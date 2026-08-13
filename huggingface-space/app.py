from pathlib import Path
import tempfile

import cv2
import gradio as gr
import numpy as np
from PIL import Image, ImageDraw
from ultralytics import YOLO

MODEL_PATH = Path("best.pt")

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        "No se ha encontrado best.pt. Sube el archivo del modelo entrenado a la raíz del Space."
    )

# Carga del modelo AURION
modelo = YOLO(str(MODEL_PATH))


def _imagen_aviso(texto: str, size=(900, 360)):
    """Devuelve una imagen simple con un mensaje de aviso."""
    img = Image.new("RGB", size, color=(248, 251, 255))
    draw = ImageDraw.Draw(img)
    draw.text((32, size[1] // 2 - 12), texto, fill=(20, 33, 61))
    return img


def detectar_imagen(imagen, conf_threshold: float = 0.25):
    """Detecta palets, paquetes, daños y anomalías visuales en una imagen."""
    if imagen is None:
        return _imagen_aviso("⚠️ Sube una imagen para iniciar la inspección visual.")

    resultados = modelo.predict(imagen, conf=conf_threshold)
    anotada = resultados[0].plot()

    # Gradio trabaja mejor con imágenes RGB.
    if isinstance(anotada, np.ndarray):
        anotada = cv2.cvtColor(anotada, cv2.COLOR_BGR2RGB)

    return anotada


def detectar_video(video, conf_threshold: float = 0.25):
    """Procesa un vídeo completo y devuelve el vídeo anotado."""
    if video is None:
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        frame = np.array(_imagen_aviso("⚠️ Sube un vídeo para iniciar la inspección visual.", (960, 540)))
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        out = cv2.VideoWriter(
            temp_output.name,
            cv2.VideoWriter_fourcc(*"mp4v"),
            1,
            (960, 540),
        )
        out.write(frame)
        out.release()
        return temp_output.name

    cap = cv2.VideoCapture(video)
    if not cap.isOpened():
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        frame = np.array(_imagen_aviso("⚠️ No se pudo abrir el vídeo.", (960, 540)))
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        out = cv2.VideoWriter(
            temp_output.name,
            cv2.VideoWriter_fourcc(*"mp4v"),
            1,
            (960, 540),
        )
        out.write(frame)
        out.release()
        return temp_output.name

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or np.isnan(fps):
        fps = 25

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    out = cv2.VideoWriter(
        temp_output.name,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        resultados = modelo.predict(frame, conf=conf_threshold, verbose=False)
        anotado = resultados[0].plot()
        out.write(anotado)

    cap.release()
    out.release()
    return temp_output.name


custom_css = """
.gradio-container {
  max-width: 1180px !important;
  margin: auto !important;
}
.hero-title {
  font-size: 42px;
  line-height: 1.05;
  font-weight: 900;
  margin-bottom: 8px;
}
.hero-subtitle {
  font-size: 17px;
  color: #5f6f89;
  max-width: 820px;
}
.badge {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 999px;
  background: #eaf4ff;
  color: #004b8d;
  font-weight: 800;
  font-size: 13px;
  margin-bottom: 14px;
}
"""

with gr.Blocks(title="AURION", css=custom_css) as app:
    gr.HTML(
        """
        <div class="badge">AURION · Computer Vision for Logistics</div>
        <div class="hero-title">Inspección inteligente para logística industrial</div>
        <p class="hero-subtitle">
          Visión artificial para detectar palets, paquetes, daños, anomalías y errores de embalaje.
          Control objetivo, rápido y escalable en operaciones logísticas.
        </p>
        """
    )

    with gr.Row():
        conf_slider = gr.Slider(
            minimum=0.10,
            maximum=0.90,
            value=0.25,
            step=0.05,
            label="Umbral de confianza",
            info="Sube el valor para mostrar solo detecciones más seguras.",
        )

    with gr.Tab("Imagen"):
        with gr.Row():
            imagen_input = gr.Image(type="pil", label="Imagen de entrada")
            imagen_output = gr.Image(label="Resultado AURION")
        imagen_btn = gr.Button("Analizar imagen", variant="primary")
        imagen_btn.click(
            fn=detectar_imagen,
            inputs=[imagen_input, conf_slider],
            outputs=imagen_output,
        )

    with gr.Tab("Vídeo"):
        with gr.Row():
            video_input = gr.Video(label="Vídeo de entrada")
            video_output = gr.Video(label="Vídeo procesado")
        video_btn = gr.Button("Analizar vídeo", variant="primary")
        video_btn.click(
            fn=detectar_video,
            inputs=[video_input, conf_slider],
            outputs=video_output,
        )

    gr.Markdown(
        """
        ---
        **AURION** automatiza la inspección visual de mercancías mediante IA, ayudando a pasar de la inspección manual a la trazabilidad visual automatizada.
        """
    )

if __name__ == "__main__":
    app.launch()
