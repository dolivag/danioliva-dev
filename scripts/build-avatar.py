#!/usr/bin/env python3
"""Prepara el avatar animado a partir de las imágenes de art/avatar/.

Entradas (todas con el mismo encuadre que art/avatar/base.png; las de Gemini vienen a 1024 px):
  base.png                    la imagen de referencia
  ojos-*.jpg, cejas-*.jpg,    variantes de expresión: la base con solo una zona cambiada
  boca-*.jpg, birrete.jpg
  capa-cabeza.jpg             cabeza y cuello sobre fondo magenta (#FF00FF)
  capa-primer-plano.jpg       portátil, taza y libros sobre fondo magenta
  capa-fondo.jpg              el fondo azul con la planta, sin la persona

Salidas en public/avatar/ (todas de 200x200, con la misma paleta):
  fondo.png, cuerpo.png, cabeza.png, primer-plano.png    capas
  piezas/<nombre>.png                                     solo la zona que cambia cada variante

Cómo:
1. Cada imagen se reduce a la cuadrícula de 200x200 (celdas de 2,5 px; mediana del centro).
2. La paleta sale de la base (40 colores); todo se pasa a esa paleta, así no hay saltos de color.
3. Pieza = píxeles que difieren de la base (más de un umbral) dentro de la zona de esa pieza,
   ensanchados 1 píxel para llevarse el borde.
4. Capas: la cabeza y el primer plano se recortan de la propia base con la silueta de su imagen
   magenta; el cuerpo es lo que queda, y lo que la cabeza tapa se rellena con el interior de la
   capucha para que, al moverse la cabeza, no aparezca un hueco.

Uso: python3 scripts/build-avatar.py   (necesita Pillow y numpy)
"""
from pathlib import Path

import numpy as np
from numpy.lib.stride_tricks import sliding_window_view
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "art" / "avatar"
OUT = ROOT / "public" / "avatar"
G = 200
CELL = 500 / G

# Zonas de cada pieza en la cuadrícula: (x0, y0, x1, y1), con el final exclusivo.
EYES = [(68, 42, 136, 68)]
MOUTH = [(68, 68, 136, 114)]
CAP = [(28, 0, 172, 47), (130, 47, 164, 82)]  # el birrete y la borla que cuelga
PIECES = {
    "ojos-cerrados": EYES,
    "ojos-pantalla": EYES,
    "cejas-fruncidas": EYES,
    "boca-sonrisa-cerrada": MOUTH,
    "boca-seria": MOUTH,
    "boca-o": MOUTH,
    "birrete": CAP,
}


def to_grid(path):
    """Imagen -> cuadrícula de 200x200 en RGB (mediana del centro de cada celda)."""
    a = np.asarray(Image.open(path).convert("RGB").resize((500, 500), Image.LANCZOS)).astype(float)
    out = np.zeros((G, G, 3))
    for gy in range(G):
        y0 = int((gy + 0.25) * CELL)
        for gx in range(G):
            x0 = int((gx + 0.25) * CELL)
            out[gy, gx] = np.median(a[y0 : y0 + 2, x0 : x0 + 2].reshape(-1, 3), 0)
    return out


def neighbours(mask):
    pad = np.pad(mask, 1)
    return sliding_window_view(pad, (3, 3)).sum((2, 3)) - mask


def dilate(mask):
    return neighbours(mask) + mask > 0


def make_palette(grid, colors=40, extra=((165, 90, 200, 150), 8)):
    """Paleta de la base y, aparte, unos colores de la planta: si no, el verde vivo se pierde
    (tiene pocos píxeles y la reducción general lo descarta)."""

    def quant(region, n):
        img = Image.fromarray(region.astype("uint8"))
        q = img.quantize(colors=n, method=Image.MEDIANCUT, dither=Image.NONE)
        return np.array(q.getpalette()[: n * 3]).reshape(-1, 3)

    (x0, y0, x1, y1), n = extra
    return np.vstack([quant(grid, colors), quant(grid[y0:y1, x0:x1], n)]).astype(float)


def to_palette(grid, pal):
    d = ((grid[:, :, None, :] - pal[None, None, :, :]) ** 2).sum(3)
    return d.argmin(2)


def clean(idx, pal):
    """Píxeles sueltos (sin ningún vecino igual) toman el color más común a su alrededor.
    Los muy claros (brillos de ojos, dientes) se respetan."""
    lum = pal @ np.array([0.299, 0.587, 0.114])
    for _ in range(2):
        nxt = idx.copy()
        for y in range(1, G - 1):
            for x in range(1, G - 1):
                k = idx[y, x]
                around = np.delete(idx[y - 1 : y + 2, x - 1 : x + 2].ravel(), 4)
                if k in around or lum[k] > 200:
                    continue
                nxt[y, x] = np.bincount(around).argmax()
        idx = nxt
    return idx


def rgba(idx, pal, mask=None):
    rgb = pal[idx].astype("uint8")
    alpha = np.full((G, G), 255, "uint8") if mask is None else (mask * 255).astype("uint8")
    rgb[alpha == 0] = 0  # lo invisible, a cero: el PNG se comprime mucho mejor
    return Image.fromarray(np.dstack([rgb, alpha]), "RGBA")


def region_mask(boxes):
    m = np.zeros((G, G), bool)
    for x0, y0, x1, y1 in boxes:
        m[y0:y1, x0:x1] = True
    return m


def magenta_mask(grid):
    r, g, b = grid[:, :, 0], grid[:, :, 1], grid[:, :, 2]
    magenta = (r > 170) & (b > 170) & (g < 110)
    keep = ~magenta
    # Quita motas sueltas del JPG.
    return keep & (neighbours(keep) >= 3)


def main():
    (OUT / "piezas").mkdir(parents=True, exist_ok=True)
    base_rgb = to_grid(ART / "base.png")
    pal = make_palette(base_rgb)
    base = clean(to_palette(base_rgb, pal), pal)

    # --- Piezas de expresión
    for name, boxes in PIECES.items():
        var_rgb = to_grid(ART / f"{name}.jpg")
        diff = np.sqrt(((var_rgb - pal[base]) ** 2).sum(2)) > 55
        diff &= neighbours(diff) >= 2  # fuera ruido
        diff &= region_mask(boxes)
        mask = dilate(diff) & region_mask(boxes)
        var = clean(to_palette(var_rgb, pal), pal)
        rgba(var, pal, mask).save(OUT / "piezas" / f"{name}.png", optimize=True)
        print(f"pieza {name}: {mask.sum()} píxeles")

    # --- Capas
    head = magenta_mask(to_grid(ART / "capa-cabeza.jpg"))
    front = magenta_mask(to_grid(ART / "capa-primer-plano.jpg"))
    bg_rgb = to_grid(ART / "capa-fondo.jpg")
    bg = clean(to_palette(bg_rgb, pal), pal)
    # Fondo: donde la base ya enseña fondo o planta, mejor la base (idéntica).
    same_as_bg = np.sqrt(((pal[base] - pal[bg]) ** 2).sum(2)) < 45
    bg = np.where(same_as_bg, base, bg)
    # La silueta de la imagen magenta se queda un píxel corta: se ensancha (sin comerse el fondo)
    # para que el contorno del pelo y de la cara vaya con la cabeza y no deje un fantasma.
    for _ in range(2):
        head = head | (dilate(head) & ~same_as_bg & ~front)
    # Alrededor de la cabeza, el fondo sale de la capa de fondo (azul limpio): el borde de la base
    # está mezclado con el pelo y quedaría como un contorno fantasma al moverse la cabeza.
    near_head = head.copy()
    for _ in range(3):
        near_head = dilate(near_head)
    clean_bg = clean(to_palette(bg_rgb, pal), pal)
    bg = np.where(near_head, clean_bg, bg)

    body = ~same_as_bg & ~head & ~front
    body &= neighbours(body) >= 3
    # Lo que la cabeza tapa: interior de la capucha entre los bordes del cuerpo de esa fila.
    hood = pal[base][np.where(body)].mean(0)
    hood_idx = int(((pal - np.array([20, 22, 40])) ** 2).sum(1).argmin())  # azul marino oscuro
    body_idx = base.copy()
    for y in range(G):
        xs = np.where(body[y])[0]
        if len(xs) < 2:
            continue
        for x in range(xs.min(), xs.max() + 1):
            if head[y, x]:
                body[y, x] = True
                body_idx[y, x] = hood_idx
    print("cuerpo: color medio", hood.astype(int), "relleno", pal[hood_idx].astype(int))

    rgba(bg, pal).save(OUT / "fondo.png", optimize=True)
    rgba(body_idx, pal, body).save(OUT / "cuerpo.png", optimize=True)
    rgba(base, pal, head).save(OUT / "cabeza.png", optimize=True)
    rgba(base, pal, front).save(OUT / "primer-plano.png", optimize=True)
    print("capas: cabeza", head.sum(), "primer plano", front.sum(), "cuerpo", body.sum())


if __name__ == "__main__":
    main()
