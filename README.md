# AURION

Detección automática de defectos en palets y embalaje para puestos de control de calidad en recepción de mercancía.

**Demo:** https://huggingface.co/spaces/MarcRubi04/AURION — acepta imagen o vídeo, con umbral de confianza ajustable
**Web:** https://marcrubii.github.io/AURION/

> El Space está alojado en el tier gratuito y se suspende tras un periodo de inactividad. La primera carga puede tardar unos 30 segundos en arrancar.

---

> ### Sobre los datos
>
> El dataset son **870 imágenes sintéticas** generadas con modelos de imagen, anotadas manualmente. El sistema **no ha sido validado sobre fotografías de una cámara industrial real**. Los resultados de este documento describen el rendimiento dentro de ese dominio sintético y no deben extrapolarse a un despliegue en producción sin una validación previa con datos reales. Ver [Limitaciones](#limitaciones).

---

## El problema

En la recepción de mercancía de un almacén, cada palet debe inspeccionarse antes de aceptarse: comprobar que la paleta no está dañada, que el embalaje es correcto y que las dimensiones de la carga se ajustan a lo esperado. La revisión es manual, lenta y depende del criterio del operario.

AURION propone automatizarla con un detector de objetos en un puesto de control con **cámara fija**: el palet pasa por un plano conocido, se captura una imagen y el sistema clasifica seis situaciones.

| Clase | Significado |
|---|---|
| `palet_bueno` | Paleta en buen estado |
| `palet_roto` | Paleta dañada |
| `paquete_emb_correct_dim_correct` | Embalaje y dimensiones correctos |
| `paquete_emb_correct_dim_incorrect` | Embalaje correcto, dimensiones incorrectas |
| `paquete_emb_incorrect_dim_correct` | Embalaje incorrecto, dimensiones correctas |
| `paquete_emb_incorrect_dim_incorrect` | Ambos incorrectos |

---

## Resultados

Modelo final: **YOLO11n** (2.58 M parámetros, 6.4 GFLOPs). Evaluado sobre un conjunto de test de 127 imágenes y 1.379 instancias, nunca vistas durante el entrenamiento en ninguna de sus variantes.

### Por escenario

El test contiene dos tipos de imagen: escenas de control (uno a seis objetos, grandes, plano completo) y escenas de almacén general (hasta 72 objetos a distintas profundidades). Solo las primeras corresponden al caso de uso previsto, así que se reportan por separado.

| Escenario | Imágenes | mAP50 | mAP50-95 | Precisión | Recall | Recall `palet_roto` |
|---|---|---|---|---|---|---|
| **Control** (dominio de diseño) | 61 | **0.881** | **0.738** | 0.858 | 0.874 | **0.901** |
| Almacén (fuera de especificación) | 66 | 0.858 | 0.672 | 0.852 | 0.815 | 0.756 |
| Global | 127 | 0.860 | 0.681 | 0.845 | 0.823 | 0.790 |

En control de calidad la métrica crítica es el **recall sobre `palet_roto`**: mide qué proporción de palets dañados se detecta. Dentro del dominio de diseño es de **0.901**; fuera cae a 0.756.

El criterio de separación entre escenarios usa únicamente la verdad terreno (número de objetos anotados y área del mayor), nunca las predicciones del modelo, y es reproducible con `AURION_filtrado.ipynb`.

### Por clase (mAP50-95)

| Clase | Control | Almacén | Global |
|---|---|---|---|
| `palet_bueno` | 0.693 | 0.639 | 0.643 |
| `palet_roto` | 0.765 | 0.561 | 0.613 |
| `paquete_emb_correct_dim_correct` | 0.801 | 0.659 | 0.671 |
| `paquete_emb_correct_dim_incorrect` | 0.693 | 0.808 | 0.768 |
| `paquete_emb_incorrect_dim_correct` | 0.790 | 0.558 | 0.616 |
| `paquete_emb_incorrect_dim_incorrect` | 0.687 | 0.805 | 0.777 |

Las clases con `dim_incorrect` rinden **mejor** en escenas densas. Una hipótesis plausible es que las dimensiones anómalas se juzgan por comparación: rodeadas de otros paquetes hay referencia visual, aisladas en un plano de control no la hay. No está verificado.

### Velocidad

| Etapa | ms/imagen |
|---|---|
| Preprocesado | 1.7 |
| Inferencia | 6.9 |
| Postprocesado (NMS) | 15.5 |

Medido en NVIDIA A100. La inferencia equivale a ~145 fps. El postprocesado supera al propio modelo y sería el primer objetivo de optimización en un despliegue real.

---

## Corrección metodológica: fuga de datos

La primera versión de este proyecto reportaba **mAP50-95 = 0.988**. Ese resultado era inválido.

### Qué ocurrió

El dataset se aumentó **antes** de dividirlo: las 870 imágenes originales se pasaron por Roboflow con augmentación ×4, generando 2.610, y el reparto train/val se hizo sobre ese conjunto ya multiplicado. Variantes de la misma imagen original acabaron a ambos lados de la partición. El modelo no generalizaba: reconocía imágenes que ya había visto con otro brillo o rotación.

### Cómo se detectó

Tres señales en las curvas de entrenamiento:

1. **mAP50 = 0.876 en la época 1.** Con un modelo preentrenado en COCO, que no conoce ninguna de las seis clases, tras una sola pasada. La tarea ya estaba resuelta antes de aprender nada.
2. **mAP50 y mAP50-95 casi idénticas** (0.992 y 0.988). Lo normal es una brecha amplia.
3. **La pérdida de validación por debajo de la de entrenamiento** durante 200 épocas (−22 % en la época 200). Ocurre cuando validación es más fácil que entrenamiento: en este caso, las mismas imágenes sin la augmentación agresiva que Ultralytics aplica solo a train.

### La corrección

Split agrupado por imagen original: todas las variantes de una misma foto caen enteras en una única partición. Además se añadió un conjunto de test independiente, que antes no existía, y en validación y test se conserva **una sola variante por original**.

| Evaluación | mAP50 | mAP50-95 |
|---|---|---|
| Split aleatorio, val *(con fuga)* | 0.992 | 0.988 |
| Split agrupado, val | 0.906 | 0.741 |
| **Split agrupado, test** | **0.859** | **0.681** |

La fuga inflaba el resultado en **31 puntos de mAP50-95**.

Tras la corrección, la época 1 pasa de 0.705 a **0.168** de mAP50-95, y la pérdida de validación queda por encima de la de entrenamiento (+0.245), que es el comportamiento esperable.

El script de partición es `split_aurion.py` e incluye una verificación explícita de solapamiento entre particiones.

---

## Elección de modelo

Se entrenaron tres tamaños en condiciones idénticas (150 épocas, `patience=30`, 640 px, semilla fija).

| Modelo | Parámetros | Época mejor | mAP50 | mAP50-95 | Tiempo |
|---|---|---|---|---|---|
| **YOLO11n** | **2.6 M** | 63 | 0.906 | **0.741** | 12.1 min |
| YOLO11s | 9.4 M | 58 | 0.896 | 0.733 | 13.3 min |
| YOLO11m | 20.1 M | 56 | 0.909 | 0.744 | 20.9 min |

Los tres quedan dentro de un punto de mAP50-95, diferencia atribuible al ruido de un conjunto de validación de 130 imágenes. Con ocho veces menos parámetros, el modelo `n` rinde igual que el `m`.

**Se elige `n`**: en un puesto de control industrial interesa un modelo que corra en hardware modesto (Jetson, mini-PC, CPU), y la capacidad adicional no aporta precisión medible en esta tarea.

---

## Robustez

El supuesto de cámara fija fija la geometría, pero no las condiciones fotométricas. Se degradó el conjunto de test en niveles controlados y se midió la caída de mAP50 (base: 0.860). Todas las degradaciones son fotométricas o desenfoque, de modo que las anotaciones siguen siendo válidas sin modificarlas.

| Degradación | Nivel más severo probado | mAP50 | Variación |
|---|---|---|---|
| Brillo | ×0.4 | 0.853 | −0.7 % |
| Brillo | ×1.5 | 0.854 | −0.6 % |
| Contraste | ×0.4 | 0.852 | −1.0 % |
| Compresión JPEG | calidad 15 | 0.849 | −1.3 % |
| Desenfoque gaussiano | kernel 15 | 0.811 | −5.7 % |
| Ruido gaussiano | σ = 20 | 0.795 | −7.5 % |
| Ruido gaussiano | σ = 35 | 0.667 | −22.4 % |
| **Desenfoque de movimiento** | **kernel 11** | **0.596** | **−30.7 %** |
| **Desenfoque de movimiento** | **kernel 21** | **0.217** | **−74.7 %** |

### Conclusión

El modelo es **prácticamente inmune a iluminación, contraste y compresión**, probablemente gracias a la augmentación HSV que Ultralytics aplica durante el entrenamiento. Tolera ruido de sensor hasta σ ≈ 20.

Su vulnerabilidad es el **desenfoque de movimiento**. Nótese la asimetría: un desenfoque gaussiano de kernel 15 cuesta un 5.7 %, mientras que un desenfoque direccional de kernel 11 cuesta un 30.7 %. Una explicación plausible es que la paleta se identifica por sus tablas horizontales, y un barrido horizontal las emborrona en la dirección que las destruye.

**Requisito de instalación derivado:** obturador rápido o captura con el palet detenido. Con un desplazamiento superior a ~10 px durante la exposición, el rendimiento cae por debajo de lo aceptable.

---

## Análisis de errores

Sobre el test, con umbral de confianza 0.25 e IoU 0.5: **449 errores en 87 de 127 imágenes**.

| Tipo | Casos |
|---|---|
| Falso positivo (detección sin objeto real) | 231 |
| Confusión (posición correcta, clase errónea) | 111 |
| No detectado (objeto real no visto) | 107 |

### El modo de fallo dominante

| Confusión | Casos |
|---|---|
| `palet_roto` → `palet_bueno` | **52** |
| `palet_bueno` → `palet_roto` | 6 |

Sumando los 15 `palet_roto` no detectados, hay **67 casos en los que un palet defectuoso supera el control**.

La asimetría 52 : 6 indica un **sesgo hacia clasificar como correcto**, que es la dirección desfavorable en control de calidad: un falso positivo cuesta una revisión manual; un falso negativo deja pasar producto defectuoso.

Las confusiones entre clases de paquete se concentran en pares que comparten un atributo y difieren en el otro (13 y 11 casos en los dos pares principales), lo que apunta al diseño de clases discutido en Limitaciones.

### El umbral de confianza no corrige los falsos positivos

| Umbral | Precisión | Recall | Recall `palet_roto` |
|---|---|---|---|
| 0.10 | 0.845 | 0.823 | 0.790 |
| 0.30 | 0.845 | 0.823 | 0.790 |
| 0.60 | 0.860 | 0.793 | 0.770 |

La precisión permanece plana hasta 0.6, punto en el que ya se pierde recall. La confianza media de los falsos positivos es **0.532**: no son detecciones dudosas filtrables, sino errores confiados.

Dado el coste asimétrico de los dos tipos de error, se opta por **mantener el umbral bajo** y asumir los falsos positivos.

---

## Limitaciones

**Dataset sintético.** Las 870 imágenes son generadas, no fotografiadas. Reproducen la geometría del escenario previsto pero no la apariencia de una cámara industrial real: ruido de sensor, reflejos sobre film retráctil, polvo, ni la sutileza de los defectos reales. Un palet astillado real no se parece a uno generado.

**Sin validación en dominio real.** No se ha medido el rendimiento sobre fotografías de un puesto de control físico. Es la limitación principal y la primera línea de trabajo futuro.

**Distribución de clases artificial.** El dataset contiene 331 instancias de `palet_roto` en test, una proporción muy superior a la de un almacén real, donde los defectos son minoritarios. Las métricas no reflejan el desbalance que se encontraría en producción.

**Diseño de clases.** Las cuatro clases de paquete codifican dos atributos binarios independientes (embalaje y dimensiones) como cuatro categorías separadas. Esto fragmenta los datos e impide que el modelo aprenda cada atributo como concepto unificado. La matriz de confusión lo confirma. Un diseño alternativo —detección de paquete más dos clasificadores de atributo, o clasificación multietiqueta— sería probablemente superior.

**Sensibilidad al movimiento.** Ver la sección de robustez: exige control sobre la captura.

**Sesgo hacia clase correcta.** El modo de fallo dominante va en la dirección desfavorable para control de calidad.

---

## Reproducir

```bash
pip install ultralytics opencv-python pandas matplotlib
```

**1. Partición sin fuga**

```bash
python split_aurion.py     # DRY_RUN=True primero: solo diagnóstico
```

Verifica el solapamiento entre particiones antes de escribir nada. Los tres cruces deben dar 0.

**2. Entrenamiento**

```python
from ultralytics import YOLO
YOLO("yolo11n.pt").train(
    data="aurion_split/data.yaml",
    epochs=150, imgsz=640, patience=30, batch=32, seed=0,
)
```

**3. Evaluación sobre test** — una sola vez, sin ajustar nada después

```python
m = YOLO("runs/detect/train/weights/best.pt")
r = m.val(split="test")
```

**4. Análisis** — `AURION_analisis.ipynb` (robustez y errores) y `AURION_filtrado.ipynb` (por escenario).

---

## Estructura

```
├── index.html                 Web del proyecto (GitHub Pages sirve desde la raíz)
├── resultados.html
├── demo.html
├── modelo.html
├── contacto.html
├── style.css
├── lang.js                    Soporte bilingüe
├── imagenes/  multimedia/     Recursos de la web
│
├── app.py                     Demo de Gradio (Hugging Face Space)
├── requirements.txt
│
├── ml/
│   ├── split_aurion.py        Partición agrupada por imagen original
│   ├── AURION_analisis.ipynb  Robustez y análisis de errores
│   ├── AURION_filtrado.ipynb  Evaluación por escenario de despliegue
│   └── data.yaml
├── results/
│   ├── yolo11n/               results.csv, curvas, matriz de confusión
│   ├── yolo11s/  yolo11m/
│   ├── robustez.csv
│   ├── errores.csv
│   └── por_escenario.csv
└── weights/best.pt            Modelo final (YOLO11n)
```

---

## Stack

Ultralytics YOLO11 · PyTorch · OpenCV · pandas · Roboflow (anotación) · Google Colab (A100) · Gradio + Hugging Face Spaces (demo)

---

## Licencia

**Código: AGPL-3.0.**

Este proyecto se construye sobre [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics), distribuido bajo AGPL-3.0. Al tratarse de una licencia copyleft fuerte con cláusula de uso en red, el código derivado —incluida la demo servida desde Hugging Face Spaces— se publica bajo los mismos términos.

Quien quiera usar este trabajo en un producto propietario necesita una licencia empresarial de Ultralytics.

**Datos y anotaciones: CC BY 4.0.**

Las 870 imágenes fueron generadas sintéticamente y anotadas manualmente por el autor.

## Autor

Marc Rubii — [GitHub](https://github.com/marcrubii)
