# AURION

Automated defect detection for pallets and packaging at goods-receiving quality control stations.

**Demo:** https://huggingface.co/spaces/MarcRubi04/AURION — accepts images or video, with an adjustable confidence threshold
**Project site:** https://marcrubii.github.io/AURION/

> The Space runs on the free tier and sleeps after a period of inactivity. The first load may take around 30 seconds to wake up.

---

> ### About the data
>
> The dataset consists of **870 synthetic images** produced with generative image models and annotated by hand. The system has **not been validated on footage from a real industrial camera**. The results below describe performance within that synthetic domain and should not be extrapolated to a production deployment without prior validation on real data. See [Limitations](#limitations).

---

## The problem

At a warehouse receiving dock, every incoming pallet has to be inspected before acceptance: check that the pallet itself is undamaged, that the packaging is correct, and that the load dimensions match what was expected. This is done manually, it is slow, and it depends on the individual operator's judgement.

AURION automates the check with an object detector at a **fixed-camera** control station: the pallet passes through a known plane, an image is captured, and the system classifies six situations.

| Class | Meaning |
|---|---|
| `palet_bueno` | Pallet in good condition |
| `palet_roto` | Damaged pallet |
| `paquete_emb_correct_dim_correct` | Packaging and dimensions both correct |
| `paquete_emb_correct_dim_incorrect` | Packaging correct, dimensions incorrect |
| `paquete_emb_incorrect_dim_correct` | Packaging incorrect, dimensions correct |
| `paquete_emb_incorrect_dim_incorrect` | Both incorrect |

Class names are kept in Spanish because they are baked into the trained weights, the `data.yaml` and every results file. Renaming them would break reproducibility.

---

## Results

Final model: **YOLO11n** (2.58 M parameters, 6.4 GFLOPs). Evaluated on a held-out test set of 127 images and 1,379 instances, none of which — in any augmented variant — was seen during training.

### By deployment scenario

The test set contains two visually distinct populations: control-station scenes (one to six large objects, full frame) and general warehouse scenes (up to 72 objects at varying depths). Only the former matches the intended use case, so both are reported separately.

| Scenario | Images | mAP50 | mAP50-95 | Precision | Recall | `palet_roto` recall |
|---|---|---|---|---|---|---|
| **Control station** (design domain) | 61 | **0.881** | **0.738** | 0.858 | 0.874 | **0.901** |
| Warehouse (out of spec) | 66 | 0.858 | 0.672 | 0.852 | 0.815 | 0.756 |
| Combined | 127 | 0.860 | 0.681 | 0.845 | 0.823 | 0.790 |

In quality control the metric that matters is **recall on `palet_roto`** — the fraction of damaged pallets actually caught. Within the design domain it is **0.901**; outside it drops to 0.756.

The scenario split is derived exclusively from ground-truth annotations (object count and largest-object area), never from model predictions, and is reproducible via `AURION_filtrado.ipynb`.

### Per class (mAP50-95)

| Class | Control | Warehouse | Combined |
|---|---|---|---|
| `palet_bueno` | 0.693 | 0.639 | 0.643 |
| `palet_roto` | 0.765 | 0.561 | 0.613 |
| `paquete_emb_correct_dim_correct` | 0.801 | 0.659 | 0.671 |
| `paquete_emb_correct_dim_incorrect` | 0.693 | 0.808 | 0.768 |
| `paquete_emb_incorrect_dim_correct` | 0.790 | 0.558 | 0.616 |
| `paquete_emb_incorrect_dim_incorrect` | 0.687 | 0.805 | 0.777 |

The two `dim_incorrect` classes perform **better** in cluttered scenes. A plausible explanation is that anomalous dimensions are judged comparatively: surrounded by other packages there is a visual reference, isolated in a control-station frame there is none. This is a hypothesis, not a verified finding.

### Inference speed

| Stage | ms/image |
|---|---|
| Preprocessing | 1.7 |
| Inference | 6.9 |
| Postprocessing (NMS) | 15.5 |

Measured on an NVIDIA A100. Inference alone is roughly 145 FPS. Postprocessing costs more than the model itself and would be the first optimisation target in a real deployment.

---

## Methodological correction: data leakage

The first version of this project reported **mAP50-95 = 0.988**. That result was invalid.

### What went wrong

The dataset was augmented **before** it was split. The 870 original images were passed through Roboflow with 4× augmentation, producing 2,610 files, and the train/val split was performed on that already-multiplied set. Variants of the same source image ended up on both sides of the partition. The model was not generalising — it was recognising images it had already seen at a different brightness or rotation.

### How it was caught

Three signals in the training curves:

1. **mAP50 = 0.876 at epoch 1.** From a COCO-pretrained model that has never seen any of the six classes, after a single pass. The task was effectively solved before any learning took place.
2. **mAP50 and mAP50-95 nearly identical** (0.992 and 0.988). A wide gap between the two is normal.
3. **Validation loss below training loss** for 200 epochs (−22 % at epoch 200). This happens when the validation set is easier than the training set — here, the same images without the aggressive augmentation Ultralytics applies to training data only.

### The fix

A group-wise split: every augmented variant of a source image is assigned to exactly one partition. A held-out test set was added, which had not existed before, and validation and test retain **a single variant per source image**.

| Evaluation | mAP50 | mAP50-95 |
|---|---|---|
| Random split, val *(leaked)* | 0.992 | 0.988 |
| Group-wise split, val | 0.906 | 0.741 |
| **Group-wise split, test** | **0.859** | **0.681** |

Leakage was inflating the headline figure by **31 mAP50-95 points**.

After the fix, epoch-1 mAP50-95 drops from 0.705 to **0.168**, and validation loss sits above training loss (+0.245) — the expected behaviour.

The partitioning script is `split_aurion.py` and includes an explicit cross-partition overlap check.

---

## Model selection

Three sizes were trained under identical conditions (150 epochs, `patience=30`, 640 px, fixed seed).

| Model | Parameters | Best epoch | mAP50 | mAP50-95 | Wall time |
|---|---|---|---|---|---|
| **YOLO11n** | **2.6 M** | 63 | 0.906 | **0.741** | 12.1 min |
| YOLO11s | 9.4 M | 58 | 0.896 | 0.733 | 13.3 min |
| YOLO11m | 20.1 M | 56 | 0.909 | 0.744 | 20.9 min |

All three land within one mAP50-95 point of each other — a difference attributable to noise on a 130-image validation set. At eight times fewer parameters, the `n` variant matches the `m`.

**`n` is the deployment choice.** An industrial control station benefits from a model that runs on modest hardware (Jetson, industrial mini-PC, CPU), and the extra capacity buys no measurable accuracy on this task.

---

## Robustness

A fixed camera constrains geometry but not photometric conditions. The test set was degraded at controlled levels and the drop in mAP50 measured (baseline: 0.860). All degradations are photometric or blur, so bounding-box annotations remain valid unmodified.

| Degradation | Most severe level tested | mAP50 | Change |
|---|---|---|---|
| Brightness | ×0.4 | 0.853 | −0.7 % |
| Brightness | ×1.5 | 0.854 | −0.6 % |
| Contrast | ×0.4 | 0.852 | −1.0 % |
| JPEG compression | quality 15 | 0.849 | −1.3 % |
| Gaussian blur | kernel 15 | 0.811 | −5.7 % |
| Gaussian noise | σ = 20 | 0.795 | −7.5 % |
| Gaussian noise | σ = 35 | 0.667 | −22.4 % |
| **Motion blur** | **kernel 11** | **0.596** | **−30.7 %** |
| **Motion blur** | **kernel 21** | **0.217** | **−74.7 %** |

### Takeaway

The model is **effectively immune to lighting, contrast and compression**, most likely thanks to the HSV augmentation Ultralytics applies during training. It tolerates sensor noise up to σ ≈ 20.

Its weakness is **motion blur**. Note the asymmetry: isotropic Gaussian blur at kernel 15 costs 5.7 %, while directional blur at kernel 11 costs 30.7 %. A plausible explanation is that pallets are identified by their horizontal slats, and a horizontal smear degrades exactly the structure the model relies on.

**Derived installation requirement:** fast shutter, or capture with the pallet stationary. Beyond roughly 10 px of displacement during exposure, performance falls below an acceptable threshold.

---

## Error analysis

On the test set, at confidence 0.25 and IoU 0.5: **449 errors across 87 of 127 images**.

| Type | Count |
|---|---|
| False positive (detection with no matching object) | 231 |
| Misclassification (correct location, wrong class) | 111 |
| Missed detection (real object not found) | 107 |

### Dominant failure mode

| Misclassification | Count |
|---|---|
| `palet_roto` → `palet_bueno` | **52** |
| `palet_bueno` → `palet_roto` | 6 |

Adding the 15 undetected `palet_roto` instances, there are **67 cases where a defective pallet passes inspection**.

The 52 : 6 asymmetry indicates a **bias towards predicting the non-defective class** — the unfavourable direction for quality control, where a false positive costs a manual re-check while a false negative ships a defective unit.

Misclassifications among the packaging classes cluster in pairs that share one attribute and differ in the other (13 and 11 cases in the two leading pairs), which points to the class-design issue discussed under Limitations.

### Raising the confidence threshold does not remove false positives

| Threshold | Precision | Recall | `palet_roto` recall |
|---|---|---|---|
| 0.10 | 0.845 | 0.823 | 0.790 |
| 0.30 | 0.845 | 0.823 | 0.790 |
| 0.60 | 0.860 | 0.793 | 0.770 |

Precision is flat up to 0.6, by which point recall is already degrading. Mean confidence of false positives is **0.532** — these are confident errors, not borderline detections that thresholding can filter out.

Given the asymmetric cost of the two error types, the chosen operating point **keeps the threshold low** and accepts the false positives.

---

## Limitations

**Synthetic dataset.** The 870 images are generated, not photographed. They reproduce the geometry of the intended scenario but not the appearance of a real industrial camera: sensor noise, glare on stretch wrap, dust, or the subtlety of real-world defects. A genuinely splintered pallet does not look like a generated one.

**No in-domain validation.** Performance on footage from a physical control station has not been measured. This is the principal limitation and the first item of future work.

**Artificial class distribution.** The test set contains 331 `palet_roto` instances — a far higher proportion than a real warehouse, where defects are rare. The reported metrics do not reflect the class imbalance a production system would face.

**Class design.** The four packaging classes encode two independent binary attributes (packaging and dimensions) as four separate categories. This fragments the data and prevents the model from learning each attribute as a unified concept; the confusion matrix bears this out. A detector plus two attribute classifiers, or a multi-label formulation, would likely perform better.

**Motion sensitivity.** See Robustness — the system requires control over capture conditions.

**Bias towards the non-defective class.** The dominant failure mode runs in the unfavourable direction for quality control.

---

## Reproducing

```bash
pip install ultralytics opencv-python pandas matplotlib
```

**1. Leak-free partitioning**

```bash
python ml/split_aurion.py     # run with DRY_RUN=True first — diagnostics only
```

Verifies cross-partition overlap before writing anything. All three intersections must be 0.

**2. Training**

```python
from ultralytics import YOLO
YOLO("yolo11n.pt").train(
    data="aurion_split/data.yaml",
    epochs=150, imgsz=640, patience=30, batch=32, seed=0,
)
```

**3. Test evaluation** — run once, with no further tuning afterwards

```python
m = YOLO("runs/detect/train/weights/best.pt")
r = m.val(split="test")
```

**4. Analysis** — `AURION_analisis.ipynb` (robustness and errors) and `AURION_filtrado.ipynb` (per-scenario evaluation).

---

## Repository layout

```
├── index.html                 Project site (GitHub Pages serves from root)
├── resultados.html
├── demo.html
├── modelo.html
├── contacto.html
├── style.css
├── lang.js                    Bilingual support
├── imagenes/  multimedia/     Site assets
│
├── huggingface-space/         Gradio demo (Hugging Face Space)
│   ├── app.py
│   ├── requirements.txt
│   ├── best.pt
│   ├── data.yaml              Dataset classes used for training
│   └── README.md              Space card
│
├── ml/
│   ├── split_aurion.py        Group-wise partitioning
│   ├── aurion_train_colab.ipynb  Training run on Colab
│   ├── AURION_analisis.ipynb  Robustness and error analysis
│   └── AURION_filtrado.ipynb  Per-scenario evaluation
├── results/
│   ├── results.csv            Per-epoch training log
│   ├── confusion_matrix.png
│   ├── robustez.csv
│   ├── errores.csv
│   └── por_escenario.csv
└── weights/best.pt            Final model (YOLO11n)
```

---

## Stack

Ultralytics YOLO11 · PyTorch · OpenCV · pandas · Roboflow (annotation) · Google Colab (A100) · Gradio + Hugging Face Spaces (demo)

---

## Licence

**Code: AGPL-3.0.**

This project builds on [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics), distributed under AGPL-3.0. As a strong copyleft licence with a network-use clause, derivative work — including the demo served from Hugging Face Spaces — is released under the same terms.

Use in a proprietary product requires an Ultralytics Enterprise Licence.

**Data and annotations: CC BY 4.0.**

The 870 images were synthetically generated and manually annotated by the author.

---

## Author

Marc Rubí — [GitHub](https://github.com/marcrubii)
