#!/usr/bin/env python3
"""Genera los marcos de pixel art que el avatar cuelga en la página de cada proyecto.

    python3 scripts/build-frames.py

Lee los logos (art/frames/<proyecto>.png, 256 px con fondo transparente; salen de los .svg de al lado) y
deja en public/avatar/marcos/<proyecto>.png un sprite diminuto: un marco de madera con el logo
reducido a 16x16 píxeles y pocos colores. Se enseña ampliado con `image-rendering: pixelated`.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art" / "frames"
OUT = ROOT / "public" / "avatar" / "marcos"

# Los píxeles del marco tienen el mismo tamaño que los del avatar (su ilustración mide 1024 px y cada píxel
# de arte son 8: una rejilla de 128). Así el marco se ve con la misma granularidad. Se guarda ampliado
# al doble (UP) para que, al reducirlo en pantalla, el navegador lo suavice como al avatar.
PIC = 36  # lado del cuadro, en píxeles de arte
BORDER = 6  # contorno + madera + bisel
MARGIN = 2  # paspartú
UP = 2
OUTLINE = (59, 35, 20, 255)
WOOD = (155, 98, 52, 255)
LIGHT = (197, 138, 82, 255)
SHADE = (110, 65, 33, 255)
GRAIN = (138, 84, 44, 255)
BEVEL = (84, 49, 26, 255)
MAT = (243, 233, 207, 255)
MAT_SHADE = (222, 208, 176, 255)
CORD = (59, 35, 20, 255)
NAIL = (230, 200, 120, 255)

W = H_FRAME = PIC + 2 * (BORDER + MARGIN)  # 52
CORD_ROWS = 10

# Ajustes por proyecto: `crop` (fracciones del logo que se conservan, para quitar un fondo) y `colors`.
# Si un logo no sobrevive a la reducción, `custom` lo dibuja a mano.
CONFIG = {
    "duometeo": {"crop": (0.16, 0.14, 0.86, 0.86), "colors": 7},
    "hogarnizer": {"colors": 8},
    "trasteo": {"colors": 8},
    "qr-city": {"colors": 9},
}


def qr_icon() -> Image.Image:
    """Un QR de 12x12 módulos de 3 píxeles (esquinas y unos cuantos datos), con un módulo naranja como el del logo."""
    dark, orange = (26, 26, 26, 255), (196, 66, 20, 255)
    im = Image.new("RGBA", (PIC, PIC), MAT)
    px = im.load()
    cells = set()
    for ox, oy in ((0, 0), (7, 0), (0, 7)):  # esquinas de 5x5: anillo y centro
        for y in range(5):
            for x in range(5):
                if x in (0, 4) or y in (0, 4) or (x == 2 and y == 2):
                    cells.add((ox + x, oy + y))
    for c in ((6, 1), (5, 6), (6, 3), (8, 6), (10, 6), (6, 8), (7, 7), (9, 8), (11, 7), (8, 10), (10, 9), (11, 11), (7, 11), (9, 11), (6, 10)):
        cells.add(c)
    for cx, cy in cells:
        col = orange if (cx, cy) in ((2, 2), (10, 9)) else dark
        for dy in range(3):
            for dx in range(3):
                px[cx * 3 + dx, cy * 3 + dy] = col
    return im


def frame(logo: Image.Image, slug: str = "") -> Image.Image:
    cfg = CONFIG.get(slug, {})
    out = Image.new("RGBA", (W, H_FRAME + CORD_ROWS), (0, 0, 0, 0))
    px = out.load()
    top = CORD_ROWS

    # madera: luz arriba-izquierda, sombra abajo-derecha, bisel oscuro junto al paspartú y algo de veta
    for y in range(H_FRAME):
        for x in range(W):
            d = min(x, y, W - 1 - x, H_FRAME - 1 - y)  # distancia al borde
            lit = x < W / 2 and y < H_FRAME / 2
            if d == 0:
                c = OUTLINE
            elif d == 1:
                c = LIGHT if (x + y) < (W + H_FRAME) / 2 else SHADE
            elif d < BORDER - 1:
                c = WOOD
                if (x * 7 + y * 13 + x * y) % 11 == 0 and d > 1:
                    c = GRAIN
            elif d == BORDER - 1:
                c = BEVEL
            else:
                c = MAT
            px[x, top + y] = c
    # sombra interior del paspartú, arriba y a la izquierda del cuadro
    inner = BORDER + MARGIN
    for i in range(W - 2 * BORDER):
        px[BORDER + i, top + BORDER] = MAT_SHADE
        px[BORDER, top + BORDER + i] = MAT_SHADE

    # logo: recortado a su contenido, sobre el paspartú, reducido y con pocos colores
    if "crop" in cfg:
        w0, h0 = logo.size
        l, t, r, b = cfg["crop"]
        logo = logo.crop((int(w0 * l), int(h0 * t), int(w0 * r), int(h0 * b)))
    box = logo.getbbox()
    if box:
        logo = logo.crop(box)
    side = max(logo.size)
    sq = Image.new("RGBA", (round(side * 1.08), round(side * 1.08)), (0, 0, 0, 0))
    sq.alpha_composite(logo, ((sq.width - logo.width) // 2, (sq.height - logo.height) // 2))
    base = Image.new("RGBA", sq.size, MAT)
    base.alpha_composite(sq)
    rgb = base.convert("RGB")
    palette = rgb.quantize(colors=cfg.get("colors", 8), method=Image.MEDIANCUT, dither=Image.NONE)  # colores del logo
    small = rgb.resize((PIC, PIC), Image.BOX)  # promedia, y luego se ajusta cada píxel al color más cercano
    small = small.quantize(palette=palette, dither=Image.NONE).convert("RGBA")
    if slug == "qr-city":
        small = qr_icon()
    out.paste(small, (inner, top + inner))

    # clavo y cuerda en V
    cx = W // 2
    for y in range(3):
        px[cx, y] = NAIL
        px[cx - 1, y] = NAIL
    for i in range(1, 8):
        px[cx - 1 - i * 3, 2 + i] = CORD
        px[cx - 2 - i * 3, 2 + i] = CORD
        px[cx + i * 3, 2 + i] = CORD
        px[cx + 1 + i * 3, 2 + i] = CORD
    return out.resize((out.width * UP, out.height * UP), Image.NEAREST)


OUT.mkdir(parents=True, exist_ok=True)
for f in sorted(SRC.glob("*.png")):
    img = frame(Image.open(f).convert("RGBA"), f.stem)
    img.save(OUT / f.name, optimize=True)
    print((OUT / f.name).relative_to(ROOT), img.size)
