#!/usr/bin/env python3
"""Prepara capturas de iPhone para la web: las reduce a 390 px de ancho y las guarda en WebP.

    python3 scripts/optimize-shots.py hogarnizer tareas=IMG_0001.PNG tareas-oscuro=IMG_0002.PNG

Deja public/projects/<proyecto>/tareas.webp, tareas-oscuro.webp… (con `nombre=archivo`; si se da solo
el archivo, se numera 1, 2…), que luego se enlazan en `shots` de src/data/site.ts. Las capturas de iPhone traen la barra de estado (hora, batería):
`--crop-top 120` la recorta (en píxeles de la captura original) si se prefiere sin ella.
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument("project")
ap.add_argument("files", nargs="+")
ap.add_argument("--crop-top", type=int, default=0)
ap.add_argument(
    "--hide-island",
    action="store_true",
    help="tapa con una isla negra la zona de la Dynamic Island (por si hay una actividad en directo, p. ej. la radio)",
)
args = ap.parse_args()

out = Path(__file__).resolve().parent.parent / "public" / "projects" / args.project
out.mkdir(parents=True, exist_ok=True)
for i, item in enumerate(args.files, 1):
    name, _, f = item.rpartition("=") if "=" in item else (str(i), "", item)
    im = Image.open(f).convert("RGB")
    if args.hide_island:
        d = ImageDraw.Draw(im)
        w0 = im.width
        d.rounded_rectangle((w0 * 0.27, w0 * 0.022, w0 * 0.73, w0 * 0.115), radius=w0 * 0.045, fill=(0, 0, 0))
    if args.crop_top:
        im = im.crop((0, args.crop_top, im.width, im.height))
    w = 390
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    dest = out / f"{name or i}.webp"
    im.save(dest, "WEBP", quality=84, method=6)
    print(dest.relative_to(out.parent.parent.parent), f"{dest.stat().st_size // 1024} KB")
