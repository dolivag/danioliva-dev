#!/usr/bin/env python3
"""Convierte art/avatar-source.png (500x500, estilo pixel art pero suavizado) en un sprite limpio
de 200x200 con paleta cerrada.

1. Reduce la imagen a 48 colores.
2. Para cada celda de 2,5 px se queda con el color más frecuente del centro: bordes nítidos.
3. Limpieza: un píxel que no coincide con ninguno de sus 8 vecinos (resto del suavizado) toma el
   color más común a su alrededor. Los muy claros (brillos de los ojos, dientes) se respetan.
4. Los azules del fondo se hacen transparentes: el círculo azul lo pone el CSS.

Uso: python3 scripts/build-avatar.py   (necesita Pillow)
"""
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GRID = 200
COLORS = 48

src = Image.open(ROOT / "art" / "avatar-source.png").convert("RGB")
pal = src.quantize(colors=COLORS, method=Image.MEDIANCUT, dither=Image.NONE)
idx = pal.load()
palette = pal.getpalette()
W, H = src.size

grid = [[0] * GRID for _ in range(GRID)]
cell = W / GRID
for gy in range(GRID):
    for gx in range(GRID):
        votes = Counter()
        for y in range(int((gy + 0.25) * cell), int((gy + 0.75) * cell) + 1):
            for x in range(int((gx + 0.25) * cell), int((gx + 0.75) * cell) + 1):
                votes[idx[min(x, W - 1), min(y, H - 1)]] += 1
        grid[gy][gx] = votes.most_common(1)[0][0]


def color(k):
    return tuple(palette[k * 3 : k * 3 + 3])


def luminance(k):
    r, g, b = color(k)
    return 0.299 * r + 0.587 * g + 0.114 * b


for _ in range(2):
    fixed = 0
    nxt = [row[:] for row in grid]
    for y in range(1, GRID - 1):
        for x in range(1, GRID - 1):
            k = grid[y][x]
            around = [grid[y + dy][x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dx or dy]
            if k in around or luminance(k) > 200:
                continue
            nxt[y][x] = Counter(around).most_common(1)[0][0]
            fixed += 1
    grid = nxt
    print("píxeles sueltos corregidos:", fixed)


def is_bg(c):
    r, g, b = c
    return b > 140 and b > r + 70 and b > g + 40 and r < 90


out = Image.new("RGBA", (GRID, GRID), (0, 0, 0, 0))
o = out.load()
for y in range(GRID):
    for x in range(GRID):
        c = color(grid[y][x])
        o[x, y] = (0, 0, 0, 0) if is_bg(c) else c + (255,)

dest = ROOT / "public" / "avatar" / "avatar.png"
out.save(dest, optimize=True)
print("escrito", dest, len(out.getcolors(100000)), "colores")
