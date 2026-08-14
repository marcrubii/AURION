"""
AURION · Demo de inspección visual de palets
Hugging Face Space — https://huggingface.co/spaces/MarcRubi04/AURION

Modelo: YOLO11n (2,58 M parámetros) entrenado sobre 870 imágenes sintéticas
con partición agrupada por imagen original.
"""

from pathlib import Path
from collections import Counter
import tempfile

import cv2
import gradio as gr
import numpy as np
from PIL import Image, ImageDraw
from ultralytics import YOLO

# ---------------------------------------------------------------- Modelo

MODEL_PATH = Path("best.pt")

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        "No se ha encontrado best.pt. Sube el archivo del modelo entrenado a la raíz del Space."
    )

modelo = YOLO(str(MODEL_PATH))

# ---------------------------------------------------------------- Etiquetas

# Los nombres internos vienen del data.yaml y no son legibles para un visitante.
NOMBRES = {
    "palet_bueno": "Palet correcto",
    "palet_roto": "Palet dañado",
    "paquete_emb_correct_dim_correct": "Carga correcta",
    "paquete_emb_correct_dim_incorrect": "Dimensiones incorrectas",
    "paquete_emb_incorrect_dim_correct": "Embalaje incorrecto",
    "paquete_emb_incorrect_dim_incorrect": "Embalaje y dimensiones incorrectos",
}

# Clases que implican defecto: determinan el veredicto y el color de la caja.
DEFECTOS = {
    "palet_roto",
    "paquete_emb_correct_dim_incorrect",
    "paquete_emb_incorrect_dim_correct",
    "paquete_emb_incorrect_dim_incorrect",
}

COLOR_OK = (141, 75, 0)      # BGR — azul corporativo #004b8d
COLOR_KO = (75, 54, 194)     # BGR — rojo de alerta #c2364b

# Límites para no agotar la CPU gratuita del Space
MAX_FRAMES_VIDEO = 450
LADO_MAX_VIDEO = 960


def _bonito(nombre: str) -> str:
    return NOMBRES.get(nombre, nombre)


def _aviso(texto: str, size=(900, 360)):
    img = Image.new("RGB", size, color=(248, 251, 255))
    ImageDraw.Draw(img).text((32, size[1] // 2 - 12), texto, fill=(20, 33, 61))
    return img


# ---------------------------------------------------------------- Dibujo

def _anotar(frame_bgr, resultado):
    """Dibuja las cajas con nombres legibles y color según sea defecto o no.

    Se sustituye resultado.plot() de Ultralytics porque este muestra los
    identificadores internos del data.yaml, ilegibles para un visitante.
    """
    out = frame_bgr.copy()
    alto = out.shape[0]
    escala = max(0.45, min(0.85, alto / 1100))
    grosor = max(1, int(alto / 450))

    for caja in resultado.boxes:
        x1, y1, x2, y2 = (int(v) for v in caja.xyxy[0].tolist())
        clase = resultado.names[int(caja.cls[0])]
        conf = float(caja.conf[0])
        color = COLOR_KO if clase in DEFECTOS else COLOR_OK

        cv2.rectangle(out, (x1, y1), (x2, y2), color, grosor + 1)

        etiqueta = f"{_bonito(clase)} {conf:.2f}"
        (tw, th), base = cv2.getTextSize(etiqueta, cv2.FONT_HERSHEY_SIMPLEX, escala, grosor)
        ty = max(th + base + 2, y1)
        cv2.rectangle(out, (x1, ty - th - base - 4), (x1 + tw + 8, ty), color, -1)
        cv2.putText(out, etiqueta, (x1 + 4, ty - base - 2),
                    cv2.FONT_HERSHEY_SIMPLEX, escala, (255, 255, 255), grosor, cv2.LINE_AA)

    return out


# ---------------------------------------------------------------- Veredicto

def _veredicto(resultado) -> str:
    """Resumen en lenguaje llano. Un control de calidad decide, no solo dibuja."""
    if resultado is None or len(resultado.boxes) == 0:
        return (
            "### Sin detecciones\n"
            "No se ha localizado ningún palet ni carga con la confianza actual. "
            "Prueba a bajar el umbral, o usa una imagen con el palet completo en plano frontal."
        )

    cuenta = Counter(resultado.names[int(c.cls[0])] for c in resultado.boxes)
    defectos = sum(n for c, n in cuenta.items() if c in DEFECTOS)
    total = sum(cuenta.values())

    if defectos:
        cabecera = (
            f"### Revisión necesaria\n"
            f"**{defectos}** de **{total}** elementos detectados presentan algún defecto.\n"
        )
    else:
        cabecera = (
            f"### Conforme\n"
            f"Los **{total}** elementos detectados están dentro de lo esperado.\n"
        )

    filas = ["", "| Elemento | Unidades |", "|---|---|"]
    for clase, n in cuenta.most_common():
        marca = " ⚠️" if clase in DEFECTOS else ""
        filas.append(f"| {_bonito(clase)}{marca} | {n} |")

    return cabecera + "\n".join(filas)


# ---------------------------------------------------------------- Inferencia

def detectar_imagen(imagen, conf_threshold: float = 0.25):
    if imagen is None:
        return _aviso("Sube una imagen para iniciar la inspección visual."), \
               "Esperando una imagen."

    bgr = cv2.cvtColor(np.array(imagen.convert("RGB")), cv2.COLOR_RGB2BGR)
    resultado = modelo.predict(bgr, conf=conf_threshold, verbose=False)[0]
    anotada = _anotar(bgr, resultado)

    return cv2.cvtColor(anotada, cv2.COLOR_BGR2RGB), _veredicto(resultado)


def detectar_video(video, conf_threshold: float = 0.25, progress=gr.Progress()):
    if video is None:
        return None, "Sube un vídeo para iniciar la inspección visual."

    cap = cv2.VideoCapture(video)
    if not cap.isOpened():
        return None, "No se ha podido abrir el vídeo. Prueba con un archivo MP4."

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0 or np.isnan(fps):
        fps = 25.0

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    n_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0

    # Reescalado: la CPU gratuita no da para 4K
    factor = min(1.0, LADO_MAX_VIDEO / max(w, h)) if max(w, h) else 1.0
    w_out, h_out = int(w * factor), int(h * factor)

    # Muestreo: si el vídeo es largo, se procesa uno de cada N fotogramas
    salto = max(1, (n_total // MAX_FRAMES_VIDEO) + 1) if n_total else 1

    salida = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    out = cv2.VideoWriter(
        salida.name, cv2.VideoWriter_fourcc(*"mp4v"),
        fps / salto, (w_out, h_out),
    )

    acumulado = Counter()
    procesados = 0
    idx = 0

    while procesados < MAX_FRAMES_VIDEO:
        ok, frame = cap.read()
        if not ok:
            break
        if idx % salto:
            idx += 1
            continue
        idx += 1

        if factor < 1.0:
            frame = cv2.resize(frame, (w_out, h_out), interpolation=cv2.INTER_AREA)

        resultado = modelo.predict(frame, conf=conf_threshold, verbose=False)[0]
        out.write(_anotar(frame, resultado))

        for c in resultado.boxes:
            acumulado[resultado.names[int(c.cls[0])]] += 1

        procesados += 1
        if n_total:
            progress(min(procesados * salto / n_total, 1.0), desc="Analizando fotogramas")

    cap.release()
    out.release()

    if procesados == 0:
        return None, "No se ha podido leer ningún fotograma del vídeo."

    defectos = sum(n for c, n in acumulado.items() if c in DEFECTOS)
    resumen = [
        f"### {procesados} fotogramas analizados",
        f"Detecciones acumuladas: **{sum(acumulado.values())}**, "
        f"de las cuales **{defectos}** corresponden a defectos.",
        "",
        "| Elemento | Detecciones |", "|---|---|",
    ]
    for clase, n in acumulado.most_common():
        marca = " ⚠️" if clase in DEFECTOS else ""
        resumen.append(f"| {_bonito(clase)}{marca} | {n} |")

    if salto > 1:
        resumen += ["", f"_Vídeo largo: se ha analizado uno de cada {salto} fotogramas "
                        f"para no agotar el entorno gratuito._"]

    return salida.name, "\n".join(resumen)


# ---------------------------------------------------------------- Interfaz

custom_css = """
.gradio-container { max-width: 1180px !important; margin: auto !important; }
.hero-title { font-size: 42px; line-height: 1.05; font-weight: 900; margin-bottom: 8px; }
.hero-subtitle { font-size: 17px; color: #5f6f89; max-width: 820px; }
.badge {
  display: inline-block; padding: 7px 12px; border-radius: 999px;
  background: #eaf4ff; color: #004b8d; font-weight: 800; font-size: 13px; margin-bottom: 14px;
}
.aviso {
  border-left: 3px solid #19a7ce; background: #eaf4ff; color: #14213d;
  padding: 14px 18px; border-radius: 0 12px 12px 0; font-size: 14px; margin-top: 8px;
}
"""

EJEMPLOS = [str(p) for p in sorted(Path("ejemplos").glob("*")) if p.suffix.lower()
            in {".jpg", ".jpeg", ".png", ".webp"}]

with gr.Blocks(title="AURION", css=custom_css) as app:
    gr.HTML(
        """
        <div class="badge">AURION · Computer Vision for Logistics</div>
        <div class="hero-title">Inspección inteligente para logística industrial</div>
        <p class="hero-subtitle">
          Detección de palets, cargas, daños y errores de embalaje en el punto de recepción.
          Modelo YOLO11n, 2,58 millones de parámetros, 6,9 ms por imagen.
        </p>
        <div class="aviso">
          <b>Sobre este modelo:</b> se entrenó con imágenes sintéticas que reproducen un puesto de
          control con cámara fija, y todavía no se ha validado sobre fotografías de una cámara
          industrial real. Funciona mejor con un palet completo en plano frontal que con escenas de
          almacén abarrotadas, y es sensible al desenfoque de movimiento.
          <a href="https://marcrubii.github.io/AURION/resultados.html#metricas" target="_blank">
          Métricas y limitaciones</a>
        </div>
        """
    )

    conf_slider = gr.Slider(
        minimum=0.10, maximum=0.75, value=0.25, step=0.05,
        label="Umbral de confianza",
        info="Bajarlo detecta más defectos a costa de más falsas alarmas. En control de calidad "
             "compensa: revisar de más cuesta menos que dejar pasar una paleta rota.",
    )

    with gr.Tab("Imagen"):
        with gr.Row():
            imagen_input = gr.Image(type="pil", label="Imagen de entrada")
            imagen_output = gr.Image(label="Resultado AURION")
        imagen_veredicto = gr.Markdown()
        imagen_btn = gr.Button("Analizar imagen", variant="primary")

        if EJEMPLOS:
            gr.Examples(
                examples=EJEMPLOS,
                inputs=imagen_input,
                outputs=[imagen_output, imagen_veredicto],
                fn=lambda img: detectar_imagen(img, 0.25),
                cache_examples=False,
                label="Ejemplos — pulsa uno para probar",
            )

        imagen_btn.click(
            fn=detectar_imagen,
            inputs=[imagen_input, conf_slider],
            outputs=[imagen_output, imagen_veredicto],
        )

    with gr.Tab("Vídeo"):
        with gr.Row():
            video_input = gr.Video(label="Vídeo de entrada")
            video_output = gr.Video(label="Vídeo procesado")
        video_veredicto = gr.Markdown()
        video_btn = gr.Button("Analizar vídeo", variant="primary")
        video_btn.click(
            fn=detectar_video,
            inputs=[video_input, conf_slider],
            outputs=[video_output, video_veredicto],
        )
        gr.Markdown(
            "_El procesado corre en CPU gratuita. Los vídeos largos se submuestrean "
            "automáticamente para evitar tiempos de espera._"
        )

    gr.Markdown(
        """
        ---
        **AURION** — [Repositorio](https://github.com/marcrubii/AURION) ·
        [Web del proyecto](https://marcrubii.github.io/AURION/) ·
        Código bajo AGPL-3.0
        """
    )

if __name__ == "__main__":
    app.launch()
