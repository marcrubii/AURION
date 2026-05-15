/* AURION bilingual switcher. Keeps the same GitHub Pages URL and translates the static site in-browser. */
(function () {
  const STORAGE_KEY = "aurion-language";
  const exactTranslations = {
    "AURION | Inspección automática de palets": "AURION | Automatic pallet inspection",
    "AURION: sistema de visión por computador basado en YOLOv11x para inspección automática de palets y mercancías en tiempo real.": "AURION: YOLOv11x-based computer vision system for automatic real-time inspection of pallets and goods.",
    "Resultados | AURION": "Results | AURION",
    "Resultados visuales de AURION: inspección con IA para detectar daños, anomalías y errores de embalaje en palets y mercancías logísticas.": "AURION visual results: AI inspection to detect damage, anomalies and packaging errors in pallets and logistics goods.",
    "Demo | AURION": "Demo | AURION",
    "Prueba la demo online de AURION: visión artificial para inspección automática de palets, mercancías, daños y errores de embalaje.": "Try the AURION online demo: computer vision for automatic inspection of pallets, goods, damage and packaging errors.",
    "Modelo | AURION": "Model | AURION",
    "Arquitectura YOLOv11x de AURION: visión artificial para detectar palets, paquetes, daños, anomalías y errores de embalaje en logística industrial.": "AURION YOLOv11x architecture: computer vision to detect pallets, packages, damage, anomalies and packaging errors in industrial logistics.",
    "Contacto | AURION": "Contact | AURION",
    "Contacto de AURION: solución de visión artificial para inspección inteligente de palets, mercancías, daños y errores de embalaje.": "AURION contact: computer vision solution for intelligent inspection of pallets, goods, damage and packaging errors.",
    "Problema": "Problem",
    "Resultados": "Results",
    "Modelo": "Model",
    "Contacto": "Contact",
    "Inicio": "Home",
    "Computer Vision · Logística industrial · YOLOv11x": "Computer Vision · Industrial logistics · YOLOv11x",
    "Computer Vision · Logística industrial · UPC": "Computer Vision · Industrial logistics · UPC",
    "Identidad del proyecto": "Project identity",
    "Abrir web de la UPC": "Open the UPC website",
    "Logo de la Universitat Politècnica de Catalunya": "Universitat Politècnica de Catalunya logo",
    "Ir al inicio de AURION": "Go to the AURION home page",
    "Navegación principal": "Main navigation",
    "Acciones principales": "Main actions",
    "Acciones de navegación": "Navigation actions",
    "© 2025 Marc Rubí · AURION · Sistema de visión por computador para inspección logística": "© 2025 Marc Rubí · AURION · Computer vision system for logistics inspection",
    "AURION · Inspección inteligente para logística industrial": "AURION · Intelligent inspection for industrial logistics",
    "Inspección automática de": "Automatic inspection of",
    "palets y mercancías": "pallets and goods",
    "Sistema de visión por computador orientado a detectar daños, anomalías y errores de embalaje en el punto de recepción, con una evaluación más rápida, objetiva y escalable que la inspección manual.": "Computer vision system designed to detect damage, anomalies and packaging errors at the receiving point, with faster, more objective and scalable assessment than manual inspection.",
    "Ver resultados": "View results",
    "Probar la demo": "Try the demo",
    "Tiempo operativo": "Operating time",
    "Tiempo diario estimado dedicado a inspecciones manuales repetitivas.": "Estimated daily time spent on repetitive manual inspections.",
    "Riesgo de error": "Error risk",
    "Inspecciones manuales susceptibles a errores por fatiga o falta de precisión.": "Manual inspections are prone to errors caused by fatigue or lack of precision.",
    "Eficiencia esperada": "Expected efficiency",
    "Mejora estimada al automatizar el proceso de inspección visual.": "Estimated improvement from automating the visual inspection process.",
    "El reto": "The challenge",
    "Un solo fallo de inspección puede afectar a toda la cadena logística.": "A single inspection failure can affect the entire logistics chain.",
    "En entornos industriales, la recepción de palets es un punto crítico: si un daño o un mal embalaje pasa desapercibido, el error puede trasladarse al almacenamiento, transporte y manipulación posterior.": "In industrial environments, pallet reception is a critical point: if damage or poor packaging goes unnoticed, the issue can carry over into storage, transport and subsequent handling.",
    "Actualmente, gran parte de la inspección de palets y paquetes se realiza de forma manual. Este proceso depende de la atención del operario, de su experiencia y del ritmo de trabajo en cada turno.": "Today, much of the inspection of pallets and packages is performed manually. This process depends on the operator’s attention, experience and the pace of work during each shift.",
    "Como consecuencia, la evaluación puede volverse subjetiva, desigual y difícil de escalar cuando aumenta el volumen de mercancía. Además, la fatiga humana puede provocar que defectos visuales sutiles no sean detectados a tiempo.": "As a result, assessment can become subjective, inconsistent and difficult to scale as goods volume increases. Human fatigue can also cause subtle visual defects to go undetected in time.",
    "Desventaja técnica: la inspección manual no garantiza un criterio constante, repetible y medible en todas las unidades revisadas.": "Technical drawback: manual inspection does not guarantee a consistent, repeatable and measurable criterion across all inspected units.",
    "Por eso se plantea una solución automática capaz de aportar consistencia, rapidez y trazabilidad al proceso de control visual en la entrada de mercancías.": "That is why an automated solution is proposed to bring consistency, speed and traceability to visual control at goods intake.",
    "Punto de recepción logística: lugar ideal para integrar una cámara fija y automatizar el control visual.": "Logistics receiving point: an ideal place to integrate a fixed camera and automate visual control.",
    "La solución": "The solution",
    "Un sistema de visión por computador basado en YOLOv11x.": "A YOLOv11x-based computer vision system.",
    "El modelo analiza cada imagen capturada, localiza elementos relevantes y clasifica el estado del palet, la carga y el embalaje para apoyar una decisión más objetiva en tiempo real.": "The model analyzes each captured image, locates relevant elements and classifies the condition of the pallet, load and packaging to support a more objective real-time decision.",
    "Captura": "Capture",
    "Una cámara fija registra cada palet en el punto de entrada.": "A fixed camera records each pallet at the entry point.",
    "Detección": "Detection",
    "YOLOv11x identifica objetos y zonas visualmente relevantes.": "YOLOv11x identifies visually relevant objects and areas.",
    "Clasificación": "Classification",
    "El sistema diferencia estados correctos, daños y anomalías.": "The system distinguishes correct conditions, damage and anomalies.",
    "Decisión": "Decision",
    "Se genera una evaluación rápida para reducir errores operativos.": "A quick assessment is generated to reduce operational errors.",
    "Modelo entrenado": "Trained model",
    "Seis clases para evaluar el estado real de la mercancía.": "Six classes to assess the real condition of the goods.",
    "El modelo ha sido entrenado con un conjunto de datos personalizado de aproximadamente 2.600 imágenes, orientado a reconocer situaciones habituales en un entorno de recepción logística.": "The model was trained with a custom dataset of approximately 2,600 images, designed to recognize common situations in a logistics receiving environment.",
    "La arquitectura permite realizar detección multicategoría en una sola pasada, lo que facilita identificar defectos como fisuras, deformaciones, embalajes defectuosos o dimensiones incorrectas.": "The architecture enables multi-category detection in a single pass, making it easier to identify defects such as cracks, deformations, faulty packaging or incorrect dimensions.",
    "El objetivo no es sustituir el criterio operativo, sino convertirlo en un proceso más repetible, rápido y medible, reduciendo la dependencia de inspecciones puramente manuales.": "The goal is not to replace operational judgment, but to turn it into a more repeatable, faster and measurable process, reducing dependence on purely manual inspections.",
    "Palet en buen estado": "Pallet in good condition",
    "Palet dañado": "Damaged pallet",
    "Paquete correcto": "Correct package",
    "Paquete incorrecto": "Incorrect package",
    "Embalaje correcto": "Correct packaging",
    "Embalaje defectuoso": "Faulty packaging",
    "Impacto del proyecto": "Project impact",
    "Más seguridad, más eficiencia y decisiones más objetivas.": "More safety, more efficiency and more objective decisions.",
    "La propuesta convierte una tarea repetitiva y variable en un proceso visual automatizado, preparado para integrarse en operaciones logísticas reales.": "The proposal turns a repetitive and variable task into an automated visual process ready to be integrated into real logistics operations.",
    "Rapidez operativa": "Operational speed",
    "Reduce tiempos de revisión y permite analizar mercancías entrantes de forma continua.": "It reduces review times and enables continuous analysis of incoming goods.",
    "Criterio objetivo": "Objective criteria",
    "Aplica el mismo estándar de inspección a cada palet, reduciendo la variabilidad humana.": "It applies the same inspection standard to each pallet, reducing human variability.",
    "Prevención de riesgos": "Risk prevention",
    "Detecta daños y anomalías antes de que generen incidencias en transporte o almacenamiento.": "It detects damage and anomalies before they cause incidents in transport or storage.",
    "Conclusión": "Conclusion",
    "Una inspección inteligente para una logística más segura y eficiente.": "Intelligent inspection for safer and more efficient logistics.",
    "AURION demuestra cómo la inteligencia artificial puede transformar un control visual manual en una solución industrial escalable, consistente y orientada a resultados.": "AURION shows how artificial intelligence can transform manual visual control into a scalable, consistent and results-driven industrial solution.",
    "Explorar resultados": "Explore results",
    "Contactar": "Contact",
    "Indicadores principales del problema y de la solución": "Main indicators of the problem and the solution",
    "Zona logística con palets y mercancía en proceso de revisión": "Logistics area with pallets and goods undergoing inspection",
    "Flujo de funcionamiento del sistema": "System workflow",
    "Clases del sistema de detección": "Detection system classes",
    "Cierre de la página de inicio": "Home page closing section",
    "AURION · Validación visual del sistema": "AURION · Visual system validation",
    "Resultados visuales de": "Visual results from",
    "Evidencia visual de AURION mediante predicciones sobre imágenes y pruebas en vídeo, mostrando detección de palets, embalajes, daños y anomalías.": "Visual evidence from AURION through image predictions and video tests, showing the detection of pallets, packaging, damage and anomalies.",
    "Ver predicciones": "View predictions",
    "Ver vídeos": "View videos",
    "Salida de AURION": "AURION output",
    "Detección multicategoría para inspección logística": "Multi-category detection for logistics inspection",
    "AURION identifica palets, embalajes, dimensiones y anomalías para apoyar una revisión más visual, objetiva y rápida.": "AURION identifies pallets, packaging, dimensions and anomalies to support a more visual, objective and faster review.",
    "clases": "classes",
    "imágenes": "images",
    "vídeos": "videos",
    "Objetivo": "Objective",
    "Control visual": "Visual control",
    "AURION localiza elementos relevantes para apoyar la revisión de palets y mercancía entrante.": "AURION locates relevant elements to support the review of pallets and incoming goods.",
    "Cobertura": "Coverage",
    "6 clases": "6 classes",
    "Se contemplan palets en buen estado, daños, embalajes correctos o incorrectos y dimensiones fuera de estándar.": "It covers pallets in good condition, damage, correct or incorrect packaging and non-standard dimensions.",
    "Evidencia": "Evidence",
    "32 pruebas": "32 tests",
    "La página reúne ejemplos visuales en imágenes y vídeos para presentar el rendimiento de forma clara.": "The page brings together visual examples in images and videos to present performance clearly.",
    "Clases del modelo": "Model classes",
    "Leyenda de clasificaciones": "Classification legend",
    "Las categorías de AURION separan el estado del palet, la calidad del embalaje y la corrección dimensional de la mercancía.": "AURION categories separate pallet condition, packaging quality and dimensional correctness of the goods.",
    "Palet en buen estado, sin daños visibles.": "Pallet in good condition, with no visible damage.",
    "Palet con daños visibles, como tablas rotas, deformaciones o fisuras.": "Pallet with visible damage, such as broken boards, deformations or cracks.",
    "Paquete bien embalado y con dimensiones correctas respecto al estándar esperado.": "Package properly packed and with correct dimensions according to the expected standard.",
    "Embalaje incorrecto, mal cerrado, roto o mal colocado, pero con dimensiones correctas.": "Incorrect, poorly sealed, broken or misplaced packaging, but with correct dimensions.",
    "Embalaje correcto, pero dimensiones incorrectas o mercancía fuera del estándar.": "Correct packaging, but incorrect dimensions or goods outside the standard.",
    "Embalaje mal realizado y dimensiones incorrectas: escenario de mayor riesgo.": "Poorly executed packaging and incorrect dimensions: the highest-risk scenario.",
    "Predicciones visuales": "Visual predictions",
    "Galería de imágenes": "Image gallery",
    "Las previsualizaciones ahora priorizan la imagen: el texto queda debajo y no tapa la detección. Haz clic en cualquier tarjeta para ampliarla.": "The previews now prioritize the image: the text stays below and does not cover the detection. Click any card to enlarge it.",
    "20 ejemplos de predicción": "20 prediction examples",
    "Ver detección ampliada": "View enlarged detection",
    "Pruebas en vídeo": "Video tests",
    "Vídeos de prueba": "Test videos",
    "Pruebas visuales en movimiento para mostrar cómo se comporta AURION ante escenas logísticas reales o simuladas.": "Visual motion tests showing how AURION behaves in real or simulated logistics scenes.",
    "Prueba de detección en movimiento": "Motion detection test",
    "Presentación de AURION": "AURION presentation",
    "Resultados pensados para comunicar valor técnico y aplicabilidad industrial": "Results designed to communicate technical value and industrial applicability",
    "Esta página reúne la evidencia visual clave para que AURION pueda defenderse con claridad ante una evaluación técnica, empresarial o de innovación.": "This page brings together the key visual evidence so AURION can be clearly presented in a technical, business or innovation evaluation.",
    "Ir a la demo": "Go to the demo",
    "Ver modelo": "View model",
    "Resumen de resultados": "Results overview",
    "Indicadores de resultados": "Results indicators",
    "Cerrar ventana": "Close window",
    "Vista ampliada de la predicción": "Enlarged prediction view",
    "Vídeo de prueba del modelo": "Model test video",
    "AURION · Demo interactiva": "AURION · Interactive demo",
    "Prueba AURION": "Try AURION",
    "en directo": "live",
    "Accede a la demo online de AURION o implementa el modelo por tu cuenta con los archivos y el flujo preparado para Google Colab.": "Access AURION’s online demo or implement the model yourself with the files and workflow prepared for Google Colab.",
    "Abrir demo online": "Open online demo",
    "Implementarlo yo mismo": "Implement it myself",
    "Sube una imagen o un vídeo": "Upload an image or video",
    "Utiliza la demo web para cargar ejemplos propios y lanzar una inferencia rápida.": "Use the web demo to upload your own examples and run a quick inference.",
    "Ejecuta la detección": "Run detection",
    "El sistema analiza embalaje, estado del palet y consistencia dimensional.": "The system analyzes packaging, pallet condition and dimensional consistency.",
    "Revisa el resultado": "Review the result",
    "Obtén predicciones visuales y utilízalas como apoyo a la decisión en un contexto logístico.": "Get visual predictions and use them as decision support in a logistics context.",
    "Acceso rápido": "Quick access",
    "Demo online": "Online demo",
    "Versión web lista para probar el sistema sin instalación local.": "Web version ready to test the system without local installation.",
    "Uso avanzado": "Advanced use",
    "Colab + archivos": "Colab + files",
    "Descarga pesos, configuración y dataset para ejecutar tus propias pruebas.": "Download weights, configuration and dataset to run your own tests.",
    "Entorno": "Environment",
    "CPU gratuita": "Free CPU",
    "La demo web corre en entorno gratuito, así que los tiempos pueden variar según la carga.": "The web demo runs in a free environment, so response times may vary depending on load.",
    "Experiencia online": "Online experience",
    "Prueba AURION tú mismo": "Try AURION yourself",
    "Accede a la versión web de AURION y realiza pruebas con tus propios inputs para visualizar el comportamiento del modelo en un entorno interactivo.": "Access the web version of AURION and test it with your own inputs to visualize model behavior in an interactive environment.",
    "Sube tu imagen o vídeo y lánzalo en un clic": "Upload your image or video and run it in one click",
    "La demo de Hugging Face permite experimentar directamente con AURION sin necesidad de instalar dependencias ni preparar un entorno local.": "The Hugging Face demo lets you experiment directly with AURION without installing dependencies or setting up a local environment.",
    "Abrir demo en Hugging Face": "Open demo on Hugging Face",
    "Ver implementación en Colab": "View Colab implementation",
    "Sin instalación": "No installation",
    "Ideal para enseñar AURION rápidamente en una evaluación o presentación.": "Ideal for showing AURION quickly during an evaluation or presentation.",
    "Enfoque demostrativo": "Demonstration focus",
    "Pensado para validar el funcionamiento de forma visual y comprensible.": "Designed to validate the system visually and clearly.",
    "Uso recomendado": "Recommended use",
    "Sube casos representativos": "Upload representative cases",
    "Las mejores pruebas se obtienen con imágenes centradas y escenas relativamente controladas.": "The best tests are obtained with centered images and relatively controlled scenes.",
    "Tiempo de respuesta": "Response time",
    "Puede variar": "May vary",
    "En vídeo, la inferencia puede tardar más por ejecutarse en CPU y por la naturaleza del entorno gratuito.": "For video, inference can take longer because it runs on CPU and because of the free environment.",
    "Resultado esperado": "Expected result",
    "Predicción visual asistida": "Assisted visual prediction",
    "El modelo es una ayuda a la inspección, no una garantía absoluta. Su valor está en apoyar la revisión logística.": "The model is an inspection aid, not an absolute guarantee. Its value lies in supporting logistics review.",
    "Importante:": "Important:",
    "Hugging Face funciona en un entorno gratuito, por lo que utilizará": "Hugging Face runs in a free environment, so it will use",
    ". Las predicciones, especialmente en vídeo, pueden tardar más. Además, el modelo puede fallar en imágenes de baja calidad o con paquetes mal centrados, ya que ha sido diseñado para escenarios logísticos relativamente controlados.": ". Predictions, especially for video, may take longer. The model may also fail on low-quality images or poorly centered packages, as it was designed for relatively controlled logistics scenarios.",
    "Implementación propia": "Custom implementation",
    "Implementa el modelo tú mismo": "Implement the model yourself",
    "Si quieres reproducir la prueba, puedes descargar los recursos principales y ejecutar el pipeline directamente en Google Colab con tus propias imágenes.": "To reproduce the test, you can download the main resources and run the pipeline directly in Google Colab with your own images.",
    "Pesos": "Weights",
    "Archivo con los mejores pesos del modelo entrenado y listo para inferencia.": "File with the best weights of the trained model, ready for inference.",
    "Archivo de configuración con la estructura de clases y parámetros básicos del dataset.": "Configuration file with the class structure and basic dataset parameters.",
    "Imágenes y labels": "Images and labels",
    "Conjunto de datos utilizado para el entrenamiento, útil para reproducibilidad y validación.": "Dataset used for training, useful for reproducibility and validation.",
    "Descargar archivos del modelo": "Download model files",
    "Flujo de uso en Google Colab": "Google Colab workflow",
    "El proceso está pensado para que puedas ejecutar inferencias, generar labels automáticas y descargar el resultado filtrado sin complicaciones.": "The process is designed so you can run inference, generate automatic labels and download the filtered result without complications.",
    "Instala dependencias": "Install dependencies",
    "Instala Ultralytics y prepara el entorno de trabajo en Colab.": "Install Ultralytics and prepare the working environment in Colab.",
    "Sube archivos": "Upload files",
    "Carga tu ZIP de imágenes, junto con": "Upload your ZIP file of images together with",
    "y": "and",
    "Lanza": "Run",
    "y genera labels con nivel de confianza.": "and generate labels with confidence levels.",
    "Filtra y descarga": "Filter and download",
    "Conserva predicciones por encima del umbral y descarga el ZIP resultante.": "Keep predictions above the threshold and download the resulting ZIP file.",
    "Instrucciones y código para Google Colab": "Instructions and code for Google Colab",
    "He mantenido tu flujo original, pero presentado de forma más limpia para que resulte más profesional y fácil de seguir.": "I kept your original workflow, but presented it more cleanly so it feels more professional and easier to follow.",
    "Ver script completo de ejecución": "View full execution script",
    "Puedes copiar el script completo y pegarlo directamente en Google Colab.": "You can copy the full script and paste it directly into Google Colab.",
    "Copiar código": "Copy code",
    "Copiado": "Copied",
    "No se pudo copiar": "Could not copy",
    "Siguiente paso": "Next step",
    "Una demo sólida también comunica valor de producto": "A solid demo also communicates product value",
    "Esta página está pensada para que cualquier evaluador entienda rápido cómo probar AURION, cómo reproducirlo y qué puede esperar del modelo en un contexto real.": "This page is designed so any evaluator can quickly understand how to test AURION, how to reproduce it and what to expect from the model in a real context.",
    "Ver detalles del modelo": "View model details",
    "Resumen de funcionamiento": "Workflow overview",
    "Resumen de accesos": "Access overview",
    "AURION · Arquitectura de detección · YOLOv11x": "AURION · Detection architecture · YOLOv11x",
    "Modelo de visión": "Vision model",
    "para inspección logística": "for logistics inspection",
    "AURION utiliza YOLOv11x para identificar palets, embalajes, anomalías dimensionales y defectos visuales en mercancías, con foco en velocidad, consistencia y aplicabilidad industrial.": "AURION uses YOLOv11x to identify pallets, packaging, dimensional anomalies and visual defects in goods, focusing on speed, consistency and industrial applicability.",
    "Probar AURION": "Try AURION",
    "Ver dataset": "View dataset",
    "Modelo utilizado": "Model used",
    "Imagen de entrada": "Input image",
    "Captura visual de palet, paquete o mercancía.": "Visual capture of a pallet, package or goods.",
    "Extracción visual": "Visual extraction",
    "El modelo interpreta patrones, formas y defectos.": "The model interprets patterns, shapes and defects.",
    "Predicción final": "Final prediction",
    "Clase, posición y confianza de cada detección.": "Class, position and confidence of each detection.",
    "Arquitectura": "Architecture",
    "Modelo de detección de objetos orientado a inferencia visual rápida.": "Object detection model designed for fast visual inference.",
    "Imágenes anotadas manualmente y preparadas para entrenamiento supervisado.": "Manually annotated images prepared for supervised training.",
    "Clases": "Classes",
    "Categorías para palets, embalajes y dimensiones correctas o incorrectas.": "Categories for pallets, packaging and correct or incorrect dimensions.",
    "Entrenamiento": "Training",
    "Iteraciones de entrenamiento con apoyo de GPU NVIDIA A100.": "Training iterations supported by an NVIDIA A100 GPU.",
    "Funcionamiento interno": "Internal operation",
    "Arquitectura del modelo": "Model architecture",
    "El sistema de AURION divide la detección en tres bloques principales: extracción de características, fusión de información visual y predicción final.": "AURION’s system divides detection into three main blocks: feature extraction, visual information fusion and final prediction.",
    "Extrae características relevantes de la imagen, como bordes, formas, texturas y patrones visuales útiles para detectar anomalías.": "It extracts relevant image features such as edges, shapes, textures and visual patterns useful for detecting anomalies.",
    "Une información de distintas resoluciones para mejorar la detección de objetos grandes y pequeños dentro de la escena logística.": "It combines information from different resolutions to improve the detection of large and small objects in the logistics scene.",
    "Realiza las predicciones finales: clase detectada, posición de la caja y nivel de confianza asociado a cada resultado.": "It produces the final predictions: detected class, bounding box position and confidence level associated with each result.",
    "Clasificación logística": "Logistics classification",
    "Clases que detecta": "Classes detected",
    "Las seis clases permiten distinguir entre estado del palet, calidad del embalaje y corrección dimensional de la mercancía.": "The six classes distinguish pallet condition, packaging quality and dimensional correctness of the goods.",
    "Unidad logística apta para manipulación y almacenamiento.": "Logistics unit suitable for handling and storage.",
    "Palet dañado o fisurado": "Damaged or cracked pallet",
    "Palet con defectos visibles que pueden comprometer seguridad o eficiencia.": "Pallet with visible defects that may compromise safety or efficiency.",
    "Paquete correcto en embalaje y dimensiones": "Package with correct packaging and dimensions",
    "Carga bien envuelta y ajustada al estándar esperado.": "Load properly wrapped and aligned with the expected standard.",
    "Paquete con embalaje incorrecto": "Package with incorrect packaging",
    "Dimensiones válidas, pero envoltorio deficiente, roto o mal colocado.": "Valid dimensions, but poor, broken or misplaced wrapping.",
    "Paquete con dimensiones incorrectas": "Package with incorrect dimensions",
    "Embalaje correcto, pero volumen o posición fuera del estándar.": "Correct packaging, but volume or position outside the standard.",
    "Paquete incorrecto en embalaje y dimensiones": "Package incorrect in packaging and dimensions",
    "Escenario de mayor riesgo dentro de la inspección automatizada.": "Highest-risk scenario within automated inspection.",
    "Entrenamiento y validación": "Training and validation",
    "Cómo se entrenó el sistema": "How the system was trained",
    "El entrenamiento se diseñó para exponer al modelo a distintas vistas, condiciones de iluminación y combinaciones de carga.": "Training was designed to expose the model to different views, lighting conditions and load combinations.",
    "Datos anotados manualmente": "Manually annotated data",
    "Se utilizaron aproximadamente 2.600 imágenes anotadas para cubrir las seis clases de AURION.": "Approximately 2,600 annotated images were used to cover the six AURION classes.",
    "Aumento de datos": "Data augmentation",
    "Se aplicó data augmentation para mejorar la capacidad de generalización ante cambios de ángulo, iluminación y disposición de la carga.": "Data augmentation was applied to improve generalization to changes in angle, lighting and load arrangement.",
    "Equilibrio entre clases": "Class balance",
    "Se buscó mantener un número similar de ejemplos por clase para evitar sesgos fuertes en la predicción.": "A similar number of examples per class was sought to avoid strong prediction bias.",
    "Preparación del dataset": "Dataset preparation",
    "Recopilación de imágenes, labels y organización de las seis categorías principales.": "Collection of images, labels and organization of the six main categories.",
    "Entrenamiento en Google Colab": "Training in Google Colab",
    "Uso de GPU NVIDIA A100 para acelerar el proceso de entrenamiento del modelo.": "Use of an NVIDIA A100 GPU to accelerate the model training process.",
    "300 iteraciones": "300 iterations",
    "Entrenamiento prolongado para ajustar detección, localización y clasificación.": "Extended training to tune detection, localization and classification.",
    "Pruebas comparativas": "Comparative tests",
    "Comparación entre YOLOv8n, YOLOv8x y YOLOv11x antes de elegir la arquitectura final.": "Comparison between YOLOv8n, YOLOv8x and YOLOv11x before choosing the final architecture.",
    "Selección técnica": "Technical selection",
    "Comparación de versiones YOLO": "Comparison of YOLO versions",
    "La elección final se basó en pruebas entre distintas versiones, priorizando potencia, arquitectura y rendimiento para detección logística.": "The final choice was based on tests across different versions, prioritizing power, architecture and performance for logistics detection.",
    "Base ligera": "Lightweight baseline",
    "Versión compacta y rápida, útil para pruebas iniciales, pero con menor capacidad para patrones visuales complejos.": "Compact and fast version, useful for initial tests, but with lower capacity for complex visual patterns.",
    "Mayor capacidad": "Higher capacity",
    "Modelo más potente que la versión nano, adecuado para comparar mejoras de precisión y robustez.": "More powerful model than the nano version, suitable for comparing accuracy and robustness improvements.",
    "Modelo seleccionado": "Selected model",
    "Arquitectura final escogida por su capacidad para trabajar con detección multicategoría y escenarios visuales exigentes.": "Final architecture chosen for its ability to work with multi-category detection and demanding visual scenarios.",
    "Dataset visual": "Visual dataset",
    "Galería de imágenes del dataset": "Dataset image gallery",
    "Muestra representativa de imágenes utilizadas para entrenar y validar el modelo. Haz clic en cualquier imagen para verla ampliada.": "Representative sample of images used to train and validate the model. Click any image to enlarge it.",
    "Imagen de entrenamiento": "Training image",
    "Modelo en acción": "Model in action",
    "De la arquitectura técnica a una demo funcional": "From technical architecture to a functional demo",
    "La página del modelo explica la base técnica de AURION. El siguiente paso es probarlo con imágenes o vídeos para visualizar directamente sus predicciones.": "The model page explains AURION’s technical foundation. The next step is to test it with images or videos to directly visualize its predictions.",
    "Ver el modelo en acción": "See the model in action",
    "Resumen técnico del modelo": "Technical model overview",
    "Flujo de inferencia del modelo": "Model inference flow",
    "Proceso de entrenamiento": "Training process",
    "Vista ampliada de imagen del dataset": "Enlarged dataset image view",
    "AURION · Contacto y colaboración": "AURION · Contact and collaboration",
    "Hablemos de": "Let’s talk about",
    "Si quieres revisar el modelo, probar una integración, comentar el enfoque técnico o conocer mejor la propuesta comercial de AURION, puedes contactar directamente conmigo.": "If you want to review the model, test an integration, discuss the technical approach or learn more about AURION’s business proposal, you can contact me directly.",
    "Escribirme por email": "Email me",
    "Ver repositorio": "View repository",
    "Autor de AURION": "AURION author",
    "Perfil": "Profile",
    "Autor técnico": "Technical author",
    "Desarrollo de la solución de visión por computador aplicada a inspección logística.": "Development of the computer vision solution applied to logistics inspection.",
    "Enfoque": "Focus",
    "Aplicación real": "Real application",
    "Solución orientada a detectar palets, embalajes, dimensiones y anomalías en recepción.": "Solution designed to detect pallets, packaging, dimensions and anomalies at reception.",
    "Respuesta directa": "Direct response",
    "Email, GitHub y LinkedIn disponibles para dudas, revisión o colaboración.": "Email, GitHub and LinkedIn are available for questions, review or collaboration.",
    "Canales de contacto": "Contact channels",
    "Contacto profesional": "Professional contact",
    "Para cualquier duda sobre AURION, la instalación, el entrenamiento, los resultados o la posible aplicación industrial, estos son los canales principales.": "For any questions about AURION, installation, training, results or potential industrial application, these are the main channels.",
    "¿Quieres comentar la solución?": "Want to discuss the solution?",
    "Estoy disponible para explicar el funcionamiento de AURION, revisar el pipeline técnico, enseñar la demo o comentar posibles mejoras para un entorno logístico real.": "I am available to explain how AURION works, review the technical pipeline, show the demo or discuss possible improvements for a real logistics environment.",
    "Enviar email": "Send email",
    "Abrir LinkedIn": "Open LinkedIn",
    "Email principal": "Main email",
    "Copiar": "Copy",
    "Canal recomendado para consultas directas.": "Recommended channel for direct enquiries.",
    "Perfil y repositorios de AURION.": "AURION profile and repositories.",
    "Contacto profesional y trayectoria.": "Professional contact and background.",
    "Motivos de contacto": "Reasons to contact",
    "¿Sobre qué puedo ayudar?": "What can I help with?",
    "Esta sección facilita que cualquier evaluador, mentor o colaborador entienda rápidamente qué tipo de conversación puede iniciar.": "This section helps any evaluator, mentor or collaborator quickly understand what kind of conversation they can start.",
    "Técnico": "Technical",
    "Modelo y entrenamiento": "Model and training",
    "Explicación de YOLOv11x, dataset, clases, entrenamiento, resultados y limitaciones del sistema.": "Explanation of YOLOv11x, dataset, classes, training, results and system limitations.",
    "Pruebas y validación": "Testing and validation",
    "Revisión de la demo online, ejemplos de uso y posibles escenarios de prueba con nuevas imágenes.": "Review of the online demo, usage examples and possible test scenarios with new images.",
    "Industria": "Industry",
    "Aplicación logística": "Logistics application",
    "Conversación sobre integración en recepción de mercancías, automatización y mejora de procesos.": "Discussion about integration in goods reception, automation and process improvement.",
    "Cierre comercial": "Business closing",
    "Una buena solución también debe ser fácil de contactar y defender": "A good solution should also be easy to contact and present",
    "Esta página deja claro quién está detrás de AURION, cómo contactar y qué valor puede aportar el sistema en una evaluación técnica o de innovación.": "This page makes it clear who is behind AURION, how to get in touch and what value the system can bring to a technical or innovation evaluation.",
    "Contactar ahora": "Contact now",
    "Perfil del autor": "Author profile",
    "Foto de Marc Rubí García": "Photo of Marc Rubí García",
    "Resumen de contacto": "Contact overview"
};
  const regexTranslations = [
    [
        "\\bPredicción (\\d{2})\\b",
        "Prediction \\1"
    ],
    [
        "\\bVídeo (\\d{2})\\b",
        "Video \\1"
    ],
    [
        "\\bDataset (\\d{2})\\b",
        "Dataset \\1"
    ],
    [
        "Abrir predicción (\\d{2})",
        "Open prediction \\1"
    ],
    [
        "Predicción visual (\\d{2}) del modelo sobre mercancía logística",
        "Visual prediction \\1 from the model on logistics goods"
    ],
    [
        "Abrir vídeo de prueba (\\d{2})",
        "Open test video \\1"
    ],
    [
        "Miniatura del vídeo de prueba (\\d{2})",
        "Test video \\1 thumbnail"
    ],
    [
        "Abrir imagen (\\d{2}) del dataset",
        "Open dataset image \\1"
    ],
    [
        "Imagen (\\d{2}) del dataset de palets y mercancías",
        "Dataset image \\1 of pallets and goods"
    ],
    [
        "# Instalar ultralytics",
        "# Install ultralytics"
    ],
    [
        "# Subir imagenes_nuevas\\.zip \\(imágenes que quieras predecir\\), best\\.pt y data\\.yaml",
        "# Upload imagenes_nuevas.zip (images you want to predict), best.pt and data.yaml"
    ],
    [
        "# Extraer imágenes",
        "# Extract images"
    ],
    [
        "# Mover imágenes desde subcarpetas",
        "# Move images from subfolders"
    ],
    [
        "# Autolabel con best\\.pt, utilizamos el archivo para que pongan las labels de las predicciones",
        "# Autolabel with best.pt; use the file to generate prediction labels"
    ],
    [
        "# Filtrar por confianza ≥ 0\\.7 \\(puedes variar el parámetro de confianza; a mayor confianza,",
        "# Filter by confidence ≥ 0.7 (you can change the confidence parameter; the higher the confidence,"
    ],
    [
        "# es más probable que prediga menos clases\\)",
        "# the more likely it is to predict fewer classes)"
    ],
    [
        "# Comprimir y descargar",
        "# Compress and download"
    ]
].map(([pattern, replacement]) => [new RegExp(pattern, "g"), replacement]);
  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();
  const translatableAttrs = ["alt", "aria-label", "title", "placeholder", "value", "content"];

  function getStoredLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function setStoredLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Ignore storage errors so the language switch still works in restricted browsers.
    }
  }

  function normalizeKey(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function preserveOuterWhitespace(original, translated) {
    const start = String(original).match(/^\s*/)[0];
    const end = String(original).match(/\s*$/)[0];
    return start + translated + end;
  }

  function translateValue(original, lang) {
    if (!original || !String(original).trim()) return original;
    if (lang === "es") return original;

    const normalized = normalizeKey(original);
    if (exactTranslations[normalized]) {
      return preserveOuterWhitespace(original, exactTranslations[normalized]);
    }

    let translated = String(original);
    regexTranslations.forEach(([pattern, replacement]) => {
      translated = translated.replace(pattern, replacement);
    });
    return translated;
  }

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest("script, style, .language-toggle")) return true;
    return false;
  }

  function translateTextNodes(lang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
      node.nodeValue = translateValue(textOriginals.get(node), lang);
    });
  }

  function translateAttributes(lang) {
    const elements = document.querySelectorAll("[alt], [aria-label], [title], [placeholder], [value], meta[name='description']");
    elements.forEach((element) => {
      translatableAttrs.forEach((attr) => {
        if (!element.hasAttribute(attr)) return;
        if (element.classList && element.classList.contains("language-toggle")) return;
        let originals = attrOriginals.get(element);
        if (!originals) {
          originals = {};
          attrOriginals.set(element, originals);
        }
        if (!(attr in originals)) originals[attr] = element.getAttribute(attr);
        element.setAttribute(attr, translateValue(originals[attr], lang));
      });
    });
  }

  function translateHead(lang) {
    const originalTitle = document.documentElement.dataset.originalTitle || document.title;
    document.documentElement.dataset.originalTitle = originalTitle;
    document.title = translateValue(originalTitle, lang);
    document.documentElement.lang = lang;
  }

  function updateToggleButton(lang) {
    const button = document.querySelector(".language-toggle");
    if (!button) return;
    const nextLang = lang === "es" ? "en" : "es";
    button.textContent = lang === "es" ? "EN" : "ES";
    button.setAttribute("aria-label", lang === "es" ? "Switch page language to English" : "Cambiar el idioma de la página a español");
    button.setAttribute("title", lang === "es" ? "Switch to English" : "Cambiar a español");
    button.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    button.dataset.nextLang = nextLang;
  }

  function applyLanguage(lang) {
    const safeLang = lang === "en" ? "en" : "es";
    setStoredLanguage(safeLang);
    translateHead(safeLang);
    translateTextNodes(safeLang);
    translateAttributes(safeLang);
    updateToggleButton(safeLang);
  }

  function createToggle() {
    const nav = document.querySelector(".main-nav");
    if (!nav || nav.querySelector(".language-toggle")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "language-toggle";
    button.addEventListener("click", () => {
      const current = getStoredLanguage() === "en" ? "en" : "es";
      applyLanguage(current === "es" ? "en" : "es");
    });
    nav.appendChild(button);
  }

  function injectStyles() {
    if (document.getElementById("aurion-language-styles")) return;
    const style = document.createElement("style");
    style.id = "aurion-language-styles";
    style.textContent = `
      /* Header fix: keep the two logos together in ES and EN, and let the menu wrap instead. */
      .topbar {
        display: flex !important;
        align-items: flex-start !important;
        justify-content: space-between !important;
        gap: clamp(22px, 3vw, 44px) !important;
      }

      .brand-strip {
        flex: 0 0 auto !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        gap: clamp(12px, 1.5vw, 18px) !important;
      }

      .logo-card.upc-logo-card {
        width: clamp(148px, 10vw, 164px) !important;
      }

      .aurion-logo-link {
        width: clamp(230px, 18vw, 300px) !important;
      }

      .main-nav {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        justify-content: flex-end !important;
        align-items: center !important;
        gap: clamp(8px, 0.8vw, 13px) !important;
      }

      .main-nav a,
      .language-toggle {
        white-space: nowrap !important;
        padding: 10px 13px !important;
      }

      .language-toggle {
        border: 1px solid rgba(255, 255, 255, 0.24);
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.92);
        background: rgba(255, 255, 255, 0.10);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
        transition: 0.22s ease;
      }
      .language-toggle:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.18);
        transform: translateY(-1px);
      }

      @media (max-width: 1180px) {
        .topbar {
          flex-direction: column !important;
          align-items: flex-start !important;
        }

        .main-nav {
          width: 100% !important;
          justify-content: flex-start !important;
        }
      }

      @media (max-width: 620px) {
        .brand-strip {
          flex-wrap: wrap !important;
        }

        .aurion-logo-link {
          width: min(300px, 100%) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function initialLanguage() {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get("lang");
    if (queryLang === "en" || queryLang === "es") return queryLang;
    return getStoredLanguage() === "en" ? "en" : "es";
  }

  function init() {
    injectStyles();
    createToggle();
    applyLanguage(initialLanguage());
  }

  window.AURION_I18N = {
    applyLanguage,
    getLanguage: () => getStoredLanguage() === "en" ? "en" : "es",
    t: (value) => translateValue(value, getStoredLanguage() === "en" ? "en" : "es")
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
