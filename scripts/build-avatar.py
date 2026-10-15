#!/usr/bin/env python3
"""Convierte art/avatar-source.png (el pixel art reescalado) en un sprite limpio de 92x92.

1. Reduce la imagen a 96 colores (para conservar también el verde de la planta).
2. Para cada celda de la cuadrícula de 92x92 (el tamaño de píxel del dibujo, unos 4,35 px) se
   queda con el color más frecuente del centro de la celda: bordes nítidos.
3. Los azules del fondo se unifican y se hacen transparentes: el círculo azul lo pone el CSS.

Uso: python3 scripts/build-avatar.py   (necesita Pillow)
"""
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GRID = 92
BG = (31, 93, 192)

src = Image.open(ROOT / "art" / "avatar-source.png").convert("RGBA")
flat = Image.new("RGBA", src.size, BG + (255,))
flat.alpha_composite(src)
pal = flat.convert("RGB").quantize(colors=96, method=Image.MEDIANCUT, dither=Image.NONE)
idx = pal.load()
colors = pal.getpalette()


def is_bg(c):
    r, g, b = c
    return b > 140 and b > r + 70 and b > g + 40 and r < 90


out = Image.new("RGBA", (GRID, GRID), (0, 0, 0, 0))
o = out.load()
cell = src.size[0] / GRID
for gy in range(GRID):
    for gx in range(GRID):
        votes = Counter()
        x0, y0 = int((gx + 0.2) * cell), int((gy + 0.2) * cell)
        x1, y1 = max(x0 + 1, int((gx + 0.8) * cell)), max(y0 + 1, int((gy + 0.8) * cell))
        for y in range(y0, y1):
            for x in range(x0, x1):
                votes[idx[x, y]] += 1
        k = votes.most_common(1)[0][0]
        c = tuple(colors[k * 3 : k * 3 + 3])
        o[gx, gy] = (0, 0, 0, 0) if is_bg(c) else c + (255,)

dest = ROOT / "public" / "avatar" / "avatar.png"
out.save(dest)
print("escrito", dest, len(out.getcolors(10000)), "colores")
