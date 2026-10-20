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

PIC = 16  # lado del cuadro, en píxeles de arte
OUTLINE = (59, 35, 20, 255)
WOOD = (155, 98, 52, 255)
LIGHT = (197, 138, 82, 255)
SHADE = (110, 65, 33, 255)
MAT = (243, 233, 207, 255)
CORD = (59, 35, 20, 255)
NAIL = (230, 200, 120, 255)

BORDER = 3  # contorno + madera
MARGIN = 1  # paspartú
W = H_FRAME = PIC + 2 * (BORDER + MARGIN)  # 24
CORD_ROWS = 5


# Ajustes por proyecto: `crop` (fracciones del logo que se conservan, para quitar un fondo) y `colors`.
# Si un logo no sobrevive a 16x16 píxeles (QR City, una ciudad isométrica), `custom` dibuja el icono a mano.
CONFIG = {
    "duometeo": {"crop": (0.16, 0.14, 0.86, 0.86), "colors": 5},
}


def qr_icon() -> Image.Image:
    """Un QR minúsculo (tres esquinas y unos cuantos módulos), con un módulo naranja como el del logo."""
    dark, orange = (26, 26, 26, 255), (196, 66, 20, 255)
    im = Image.new("RGBA", (PIC, PIC), MAT)
    px = im.load()
    for ox, oy in ((1, 1), (10, 1), (1, 10)):  # esquinas de 5x5: anillo y centro
        for y in range(5):
            for x in range(5):
                ring = x in (0, 4) or y in (0, 4)
                centre = 1 < x < 3 and 1 < y < 3
                if ring or centre:
                    px[ox + x, oy + y] = dark
    for x, y in ((8, 2), (8, 4), (7, 6), (9, 7), (11, 8), (13, 9), (8, 9), (10, 10), (12, 12), (14, 11), (9, 12), (11, 14), (14, 14), (8, 14)):
        px[x, y] = dark
    px[12, 12] = orange
    px[3, 3] = orange
    return im


def frame(logo: Image.Image, slug: str = "") -> Image.Image:
    cfg = CONFIG.get(slug, {})
    out = Image.new("RGBA", (W, H_FRAME + CORD_ROWS), (0, 0, 0, 0))
    px = out.load()
    top = CORD_ROWS

    # madera con luz arriba-izquierda y sombra abajo-derecha
    for y in range(H_FRAME):
        for x in range(W):
            d = min(x, y, W - 1 - x, H_FRAME - 1 - y)  # distancia al borde
            if d == 0:
                c = OUTLINE
            elif d < BORDER:
                c = LIGHT if (x < W / 2 and y < H_FRAME / 2 and d == 1) else SHADE if (x >= W / 2 or y >= H_FRAME / 2) and d == BORDER - 1 else WOOD
            elif d < BORDER + MARGIN:
                c = MAT
            else:
                c = MAT
            px[x, top + y] = c

    # logo: recortado a su contenido, sobre el paspartú, reducido y con pocos colores
    if "crop" in cfg:
        w0, h0 = logo.size
        l, t, r, b = cfg["crop"]
        logo = logo.crop((int(w0 * l), int(h0 * t), int(w0 * r), int(h0 * b)))
    box = logo.getbbox()
    if box:
        logo = logo.crop(box)
    side = max(logo.size)
    sq = Image.new("RGBA", (round(side * 1.1), round(side * 1.1)), (0, 0, 0, 0))
    sq.alpha_composite(logo, ((sq.width - logo.width) // 2, (sq.height - logo.height) // 2))
    base = Image.new("RGBA", sq.size, MAT)
    base.alpha_composite(sq)
    rgb = base.convert("RGB")
    palette = rgb.quantize(colors=cfg.get('colors', 6), method=Image.MEDIANCUT, dither=Image.NONE)  # colores del logo
    small = rgb.resize((PIC, PIC), Image.BOX)  # promedia, y luego se ajusta cada píxel al color más cercano
    small = small.quantize(palette=palette, dither=Image.NONE).convert("RGBA")
    if slug == "qr-city":
        small = qr_icon()
    out.paste(small, (BORDER + MARGIN, top + BORDER + MARGIN))

    # clavo y cuerda en V
    cx = W // 2
    px[cx, 0] = NAIL
    px[cx, 1] = NAIL
    for i in range(1, 4):
        px[cx - i - 1, 1 + i] = CORD
        px[cx + i + 1, 1 + i] = CORD
    px[cx - 5, 4] = CORD
    px[cx + 5, 4] = CORD
    return out


OUT.mkdir(parents=True, exist_ok=True)
for f in sorted(SRC.glob("*.png")):
    img = frame(Image.open(f).convert("RGBA"), f.stem)
    img.save(OUT / f.name, optimize=True)
    print((OUT / f.name).relative_to(ROOT), img.size)
