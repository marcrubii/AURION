#!/usr/bin/env python3
"""
split_aurion.py — Split agrupado por imagen original (anti-fuga de datos).
 
PROBLEMA QUE RESUELVE
---------------------
El dataset fue aumentado ANTES de partirlo, asi que cada imagen original tiene
~4 variantes. Un split aleatorio manda unas a train y otras a val, y el modelo
"valida" sobre fotos que ya vio. Resultado: metricas infladas (mAP50 0.876 en
la epoca 1).
 
QUE HACE ESTE SCRIPT
--------------------
1. Agrupa las imagenes por su original (el prefijo anterior a ".rf.").
2. Reparte GRUPOS COMPLETOS en train / val / test. Nunca imagenes sueltas.
3. En val y test deja UNA sola variante por grupo (evita duplicados casi
   identicos que hinchan la metrica).
4. Prueba varias semillas y elige la que mejor reparte las 6 clases.
5. Genera el data.yaml con las tres particiones.
 
USO
---
  1. Ajusta ROOT y OUT abajo.
  2. Ejecuta con DRY_RUN = True  -> solo diagnostico, no toca nada.
  3. Si la salida cuadra, pon DRY_RUN = False y vuelve a ejecutar.
 
  python split_aurion.py
"""
 
from pathlib import Path
from collections import defaultdict, Counter
import random
import shutil
import sys
 
# ============================================================
# CONFIGURACION  <-- AJUSTA ESTO
# ============================================================
 
# Carpeta que contiene 'images' y 'labels' (la exportacion de Roboflow)
ROOT = Path(r"C:\Users\Marc\Desktop\DATASET MODELO FINAL\train")
 
# Donde se escribe el dataset nuevo (se crea; no toca el original)
OUT = Path(r"C:\Users\Marc\Desktop\aurion_split")
 
# Proporciones sobre GRUPOS (imagenes originales), no sobre archivos
SPLIT = {"train": 0.70, "valid": 0.15, "test": 0.15}
 
CLASES = [
    "palet_bueno",
    "palet_roto",
    "paquete_emb_correct_dim_correct",
    "paquete_emb_correct_dim_incorrect",
    "paquete_emb_incorrect_dim_correct",
    "paquete_emb_incorrect_dim_incorrect",
]
 
# True  = solo diagnostico, no escribe nada
# False = ejecuta el split de verdad
DRY_RUN = False
 
# En val/test, quedarse con una sola variante por original
UNA_VARIANTE_EN_VAL_TEST = True
 
# Cuantas semillas probar para equilibrar clases
N_SEMILLAS = 200
 
EXT_IMG = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
 
# ============================================================
 
 
def prefijo_original(nombre: str) -> str:
    """Devuelve el nombre de la imagen original a partir del nombre exportado.
 
    Roboflow exporta como  <original>.rf.<hash>.<ext>
    Ejemplo:
        ChatGPT-Image-20-jun-2025-20_11_46_png.rf.a3f8e9c1.jpg
        -> ChatGPT-Image-20-jun-2025-20_11_46_png
    """
    if ".rf." in nombre:
        return nombre.split(".rf.")[0]
    return Path(nombre).stem
 
 
def clases_de_label(ruta_txt: Path) -> set:
    """Lee un .txt de YOLO y devuelve el conjunto de class_id que contiene."""
    ids = set()
    if not ruta_txt.exists():
        return ids
    for linea in ruta_txt.read_text(encoding="utf-8", errors="ignore").splitlines():
        linea = linea.strip()
        if not linea:
            continue
        try:
            ids.add(int(linea.split()[0]))
        except (ValueError, IndexError):
            pass
    return ids
 
 
def cargar_grupos(dir_img: Path, dir_lbl: Path):
    """Agrupa imagenes por original. Devuelve (grupos, avisos)."""
    grupos = defaultdict(list)
    sin_label = []
 
    for f in sorted(dir_img.iterdir()):
        if not f.is_file() or f.suffix.lower() not in EXT_IMG:
            continue
        if not (dir_lbl / (f.stem + ".txt")).exists():
            sin_label.append(f.name)
        grupos[prefijo_original(f.name)].append(f.name)
 
    return dict(grupos), sin_label
 
 
def clases_por_grupo(grupos, dir_lbl):
    """Para cada grupo, el conjunto de clases que aparecen en sus etiquetas."""
    out = {}
    for g, archivos in grupos.items():
        cs = set()
        for a in archivos:
            cs |= clases_de_label(dir_lbl / (Path(a).stem + ".txt"))
        out[g] = cs
    return out
 
 
def repartir(nombres_grupos, semilla):
    """Reparte grupos en train/valid/test con una semilla dada."""
    gs = list(nombres_grupos)
    random.Random(semilla).shuffle(gs)
    n = len(gs)
    n_tr = int(n * SPLIT["train"])
    n_va = int(n * SPLIT["valid"])
    return {
        "train": gs[:n_tr],
        "valid": gs[n_tr:n_tr + n_va],
        "test":  gs[n_tr + n_va:],
    }
 
 
def puntuar(reparto, g2c):
    """Puntua un reparto. Menor = mejor. inf si falta alguna clase en algun split."""
    conteos = {}
    for split, grupos in reparto.items():
        c = Counter()
        for g in grupos:
            for cid in g2c[g]:
                c[cid] += 1
        conteos[split] = c
 
    total = Counter()
    for c in conteos.values():
        total += c
 
    # Penalizacion dura: una clase ausente de un split invalida el reparto
    for cid in total:
        for split in reparto:
            if conteos[split][cid] == 0:
                return float("inf"), conteos
 
    # Desviacion respecto a las proporciones objetivo
    score = 0.0
    for cid, n_total in total.items():
        for split, frac in SPLIT.items():
            real = conteos[split][cid] / n_total
            score += abs(real - frac)
    return score, conteos
 
 
def main():
    dir_img = ROOT / "images"
    dir_lbl = ROOT / "labels"
 
    if not dir_img.is_dir():
        sys.exit(f"ERROR: no existe {dir_img}\nAjusta ROOT en la cabecera del script.")
    if not dir_lbl.is_dir():
        sys.exit(f"ERROR: no existe {dir_lbl}\nLas etiquetas .txt deben estar ahi.")
 
    grupos, sin_label = cargar_grupos(dir_img, dir_lbl)
    total_img = sum(len(v) for v in grupos.values())
 
    print("=" * 62)
    print("DIAGNOSTICO")
    print("=" * 62)
    print(f"Imagenes totales     : {total_img}")
    print(f"Originales (grupos)  : {len(grupos)}")
    if grupos:
        print(f"Factor de aumento    : {total_img / len(grupos):.2f}x")
 
    dist = Counter(len(v) for v in grupos.values())
    print("\nVariantes por original:")
    for k in sorted(dist):
        print(f"  {k} variante(s): {dist[k]:>5} originales")
 
    if sin_label:
        print(f"\nAVISO: {len(sin_label)} imagenes sin .txt asociado")
        for n in sin_label[:5]:
            print(f"  - {n}")
        if len(sin_label) > 5:
            print(f"  ... y {len(sin_label) - 5} mas")
 
    if len(grupos) == total_img:
        print("\nNOTA: cada nombre aparece una sola vez.")
        print("Estas imagenes ya son originales, o el patron '.rf.' no aplica aqui.")
 
    # Buscar el mejor reparto
    g2c = clases_por_grupo(grupos, dir_lbl)
    mejor = (float("inf"), None, None, None)
    for s in range(N_SEMILLAS):
        rep = repartir(grupos.keys(), s)
        sc, cnt = puntuar(rep, g2c)
        if sc < mejor[0]:
            mejor = (sc, s, rep, cnt)
 
    score, semilla, reparto, conteos = mejor
    if reparto is None:
        sys.exit("ERROR: no se encontro reparto valido. Baja N_SEMILLAS o revisa las clases.")
    if score == float("inf"):
        print("\nAVISO: alguna clase no aparece en los tres splits.")
        print("Suele pasar con clases muy minoritarias. Revisa el reparto de abajo.")
 
    print("\n" + "=" * 62)
    print(f"REPARTO ELEGIDO (semilla {semilla}, score {score:.4f})")
    print("=" * 62)
 
    plan = {}
    for split in ("train", "valid", "test"):
        archivos = []
        for g in reparto[split]:
            v = sorted(grupos[g])
            if split != "train" and UNA_VARIANTE_EN_VAL_TEST:
                v = v[:1]
            archivos.extend(v)
        plan[split] = archivos
        print(f"{split:<6}: {len(reparto[split]):>4} originales -> {len(archivos):>5} imagenes")
 
    print("\nInstancias por clase:")
    print(f"  {'clase':<38} {'train':>7} {'valid':>7} {'test':>7}")
    for cid, nombre in enumerate(CLASES):
        t = conteos["train"][cid]
        v = conteos["valid"][cid]
        s = conteos["test"][cid]
        alerta = "  <-- pocos" if min(v, s) < 5 else ""
        print(f"  {nombre:<38} {t:>7} {v:>7} {s:>7}{alerta}")
 
    # Verificacion de fuga
    print("\n" + "=" * 62)
    print("VERIFICACION DE FUGA")
    print("=" * 62)
    sets = {k: set(reparto[k]) for k in reparto}
    ok = True
    for a, b in (("train", "valid"), ("train", "test"), ("valid", "test")):
        inter = sets[a] & sets[b]
        print(f"  {a} & {b}: {len(inter)} originales compartidas")
        if inter:
            ok = False
    print("\n  OK: ningun original aparece en dos splits." if ok
          else "\n  ERROR: hay solapamiento. No entrenes con esto.")
 
    if DRY_RUN:
        print("\n" + "=" * 62)
        print("DRY_RUN activo: no se ha escrito nada.")
        print("Si el diagnostico cuadra, pon DRY_RUN = False y vuelve a ejecutar.")
        print("=" * 62)
        return
 
    # Escribir
    print("\nCopiando archivos...")
    if OUT.exists():
        sys.exit(f"ERROR: {OUT} ya existe. Borrala o cambia OUT para no sobrescribir.")
 
    for split, archivos in plan.items():
        (OUT / split / "images").mkdir(parents=True, exist_ok=True)
        (OUT / split / "labels").mkdir(parents=True, exist_ok=True)
        for a in archivos:
            shutil.copy2(dir_img / a, OUT / split / "images" / a)
            txt = Path(a).stem + ".txt"
            if (dir_lbl / txt).exists():
                shutil.copy2(dir_lbl / txt, OUT / split / "labels" / txt)
        print(f"  {split}: {len(archivos)} imagenes")
 
    yaml = (
        f"# Generado por split_aurion.py (semilla {semilla})\n"
        f"# Split agrupado por imagen original: sin fuga entre particiones.\n"
        f"# Dataset sintetico (imagenes generativas), etiquetado manual.\n\n"
        f"path: {OUT.as_posix()}\n"
        f"train: train/images\n"
        f"val: valid/images\n"
        f"test: test/images\n\n"
        f"nc: {len(CLASES)}\n"
        f"names: {CLASES}\n"
    )
    (OUT / "data.yaml").write_text(yaml, encoding="utf-8")
 
    print(f"\nListo. Dataset en: {OUT}")
    print(f"data.yaml en:      {OUT / 'data.yaml'}")
    print("\nSiguiente paso:")
    print(f"  yolo detect train model=yolo11s.pt data={(OUT / 'data.yaml').as_posix()} \\")
    print("       epochs=150 imgsz=640 patience=30")
 
 
if __name__ == "__main__":
    main()