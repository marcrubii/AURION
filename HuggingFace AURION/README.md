---
title: AURION
emoji: 👁️
colorFrom: blue
colorTo: blue
sdk: gradio
sdk_version: 5.0.0
app_file: app.py
pinned: false
---

# AURION

**Inspección inteligente para logística industrial mediante visión artificial.**

AURION permite analizar imágenes y vídeos para detectar palets, paquetes, daños, anomalías visuales y errores de embalaje mediante modelos YOLO.

## Archivos principales

- `app.py`: interfaz Gradio y lógica de inferencia.
- `requirements.txt`: dependencias necesarias para ejecutar el Space.
- `best.pt`: modelo entrenado.
- `data.yaml`: configuración del dataset/clases del entrenamiento.

## Uso

Sube una imagen o un vídeo, ajusta el umbral de confianza y pulsa el botón de análisis.
