#!/usr/bin/env python3
"""Genera los marcos de fotos de mesa en pixel art que el avatar pone sobre su escritorio en la página de cada proyecto.

    python3 scripts/build-frames.py

Lee los logos (art/frames/<proyecto>.png, 256 px con fondo transparente; salen de los .svg de al lado) y
deja en public/avatar/marcos/<proyecto>.png un sprite diminuto, a escala de píxel de arte: un marco de
bambú con el logo reducido a 10x10 píxeles. `avatar.ts` lo dibuja en el lienzo del avatar ×8, así que sus
píxeles miden exactamente lo mismo que los de la ilustración (una rejilla de 128 en 1024 px).

El marco mira hacia el mismo lado que el avatar (izquierda y un poco hacia delante, como el portátil): el borde
de abajo baja ligeramente hacia la derecha, se ve su grosor a la derecha y asoma el pie que lo sostiene por detrás.
"""
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art" / "frames"
OUT = ROOT / "public" / "avatar" / "marcos"

W, H = 16, 20  # marco, en píxeles de arte
PIC = 10  # lado del logo
B = 3  # grosor del borde (contorno, madera y bisel)
SLOPE = 0.1  # el borde de abajo baja un píxel cada diez hacia la derecha
OUTLINE = (59, 35, 20, 255)
TOP, LEFT, RIGHT, BOT = (238, 200, 146, 255), (226, 176, 114, 255), (184, 130, 74, 255), (158, 105, 58, 255)
BEVEL = (120, 76, 40, 255)
SIDE, SIDE_DARK, LEG = (128, 84, 44, 255), (96, 60, 32, 255), (84, 53, 28, 255)
MAT, MAT_SHADE = (243, 233, 207, 255), (222, 208, 176, 255)

# Ajustes por proyecto: `crop` (fracciones del logo que se conservan, para quitar un fondo) y `colors`.
CONFIG = {
    "duometeo": {"crop": (0.16, 0.14, 0.86, 0.86), "colors": 6},
}


def qr_icon() -> Image.Image:
    """Un QR minúsculo (tres esquinas y unos cuantos módulos), con un módulo naranja como el del logo."""
    dark, orange = (26, 26, 26, 255), (196, 66, 20, 255)
    im = Image.new("RGBA", (PIC, PIC), MAT)
    px = im.load()
    for ox, oy in ((0, 0), (PIC - 3, 0), (0, PIC - 3)):
        for y in range(3):
            for x in range(3):
                px[ox + x, oy + y] = dark
        px[ox + 1, oy + 1] = MAT
    for c in ((PIC - 4, PIC - 4), (PIC - 2, PIC - 2), (PIC // 2, PIC // 2), (PIC - 4, PIC // 2), (PIC // 2, PIC - 3), (5, 5), (PIC - 2, 4), (4, PIC - 2)):
        px[c] = dark
    px[PIC - 3, PIC - 3] = orange
    return im


def logo_pixels(logo: Image.Image, cfg: dict) -> Image.Image:
    """El logo recortado a su contenido, sobre el paspartú, reducido a PIC x PIC y con pocos colores."""
    if "crop" in cfg:
        w0, h0 = logo.size
        l, t, r, b = cfg["crop"]
        logo = logo.crop((int(w0 * l), int(h0 * t), int(w0 * r), int(h0 * b)))
    box = logo.getbbox()
    if box:
        logo = logo.crop(box)
    side = max(logo.size)
    sq = Image.new("RGBA", (round(side * 1.04), round(side * 1.04)), (0, 0, 0, 0))
    sq.alpha_composite(logo, ((sq.width - logo.width) // 2, (sq.height - logo.height) // 2))
    base = Image.new("RGBA", sq.size, MAT)
    base.alpha_composite(sq)
    rgb = base.convert("RGB")
    palette = rgb.quantize(colors=cfg.get("colors", 8), method=Image.MEDIANCUT, dither=Image.NONE)  # colores del logo
    small = rgb.resize((PIC, PIC), Image.BOX)  # promedia, y luego se ajusta cada píxel al color más cercano
    return small.quantize(palette=palette, dither=Image.NONE).convert("RGBA")


def frame(logo: Image.Image, slug: str = "") -> Image.Image:
    cfg = CONFIG.get(slug, {})
    out = Image.new("RGBA", (W + 5, H + 3), (0, 0, 0, 0))
    o = out.load()

    def dy(x: float) -> int:
        return math.floor(x * SLOPE)

    # 1) el pie que lo sostiene, por detrás: asoma a la derecha en la mitad de abajo
    for y in range(H // 2 - 1, H):
        t = (y - (H // 2 - 1)) / (H // 2)
        for x in range(W + 1, W + 4):
            if W + 1 + round(t * 2) <= x <= W + 2 + round(t * 2):
                o[x, y + dy(W)] = LEG
    # 2) su grosor, a la derecha (se ve porque mira hacia la izquierda)
    for x in (W, W + 1):
        for y in range(1, H - 1):
            o[x, y + dy(W) - (1 if x == W + 1 else 0)] = SIDE if x == W else SIDE_DARK
    # 3) el borde de bambú, en inglete: cada lado con su luz, y los bordes de arriba y abajo escalonados
    for y in range(H):
        for x in range(W):
            d = min(x, y, W - 1 - x, H - 1 - y)
            if d == 0:
                c = OUTLINE
            elif d < B:
                if d == B - 1:
                    c = BEVEL
                else:
                    side = min((y, "t"), (x, "l"), (W - 1 - x, "r"), (H - 1 - y, "b"))[1]
                    c = {"t": TOP, "l": LEFT, "r": RIGHT, "b": BOT}[side]
            else:
                continue
            o[x, y + dy(x)] = c
    # 4) paspartú y logo, rígidos, dentro del borde
    inner = Image.new("RGBA", (W - 2 * B, H - 2 * B), MAT)
    ip = inner.load()
    for i in range(W - 2 * B):
        ip[i, 0] = MAT_SHADE
    for j in range(H - 2 * B):
        ip[0, j] = MAT_SHADE
    pic = qr_icon() if slug == "qr-city" else logo_pixels(logo, cfg)
    inner.paste(pic, (0, (H - 2 * B - PIC) // 2))
    out.paste(inner, (B, B + dy(W // 2)))
    return out


OUT.mkdir(parents=True, exist_ok=True)
for f in sorted(SRC.glob("*.png")):
    img = frame(Image.open(f).convert("RGBA"), f.stem)
    img.save(OUT / f.name, optimize=True)
    print((OUT / f.name).relative_to(ROOT), img.size)
