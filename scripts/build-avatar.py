#!/usr/bin/env python3
"""Prepara el avatar animado a partir de las imágenes de art/avatar/ (1024x1024, hechas con Gemini).

Entradas (todas con el mismo encuadre que base.jpg y su fondo rosa plano):
  base.jpg              la ilustración de referencia
  sin-cabeza.jpg        la base sin cabeza ni cuello, con la capucha completada
  capa-cabeza.jpg       solo la cabeza y el cuello, sobre fondo cian (#00FFFF)
  <pieza>.jpg           la base con una sola zona cambiada (ojos, boca, birrete, saludo, vapor…)

Salidas en public/avatar/:
  escena.webp           todo menos la cabeza (de sin-cabeza.jpg), sin el fondo rosa
  cabeza.webp           la cabeza y el cuello (píxeles de la base, silueta de capa-cabeza.jpg)
  piezas/<pieza>.webp   solo la zona que cambia esa variante, recortada
  avatar.json           tamaño del lienzo y posición de cada pieza

Las piezas se recortan comparando con la base dentro de la zona de cada una (así se ignoran los
cambios sueltos que mete Gemini en el resto) y con el borde suavizado para que no se note la costura.

Uso: python3 scripts/build-avatar.py   (necesita Pillow con WebP y numpy)
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "art" / "avatar"
OUT = ROOT / "public" / "avatar"
SIZE = 1024
PINK = np.array([221, 44, 142], float)  # el fondo de la ilustración

# Zona de cada pieza (x0, y0, x1, y1) y si va pegada a la cabeza (se mueve con ella).
PIECES = {
    "ojos-cerrados": ((470, 240, 650, 345), True),
    "ojos-reojo": ((470, 240, 650, 345), True),
    "ojos-pantalla": ((470, 240, 650, 345), True),  # mira hacia abajo y a la izquierda
    # Miradas que sigue el cursor (solo se generan las que tengan imagen en art/avatar/):
    "ojos-arriba-izq": ((470, 240, 650, 345), True),
    "ojos-arriba": ((470, 240, 650, 345), True),
    "ojos-arriba-der": ((470, 240, 650, 345), True),
    "ojos-izq": ((470, 240, 650, 345), True),
    "ojos-der": ((470, 240, 650, 345), True),
    "ojos-abajo": ((470, 240, 650, 345), True),
    "cejas-fruncidas": ((470, 240, 650, 320), True),
    "boca-sonrisa-cerrada": ((480, 345, 650, 480), True),
    "boca-seria": ((480, 345, 650, 480), True),
    "boca-o": ((480, 345, 650, 480), True),
    "birrete": ((380, 30, 850, 320), True),
    "saludo": ((250, 470, 670, 900), False),
    "manos": ((420, 640, 700, 880), False),
    "vapor-2": ((100, 590, 230, 790), False),
    "vapor-3": ((100, 590, 230, 790), False),
}


def load(name):
    img = Image.open(ART / name).convert("RGB")
    if img.size != (SIZE, SIZE):
        img = img.resize((SIZE, SIZE), Image.LANCZOS)
    return np.asarray(img).astype(float)


def pink_alpha(rgb):
    """Opacidad: 0 en el fondo rosa y 1 en el dibujo, con el borde suavizado.

    Fondo = zonas de rosa casi puro grandes (la que rodea la figura y los huecos que encierra). No
    vale con «todo lo que se parezca al rosa»: la piel y la madera claras se le parecen bastante.
    """
    dist = np.sqrt(((rgb - PINK) ** 2).sum(2))
    pinkish = Image.fromarray(((dist < 70) * 255).astype("uint8"))
    filled = pinkish.copy()
    arr = np.asarray(pinkish)
    ys, xs = np.where(arr == 255)
    for y, x in zip(ys[::97], xs[::97]):  # semillas repartidas por todo el rosa
        if filled.getpixel((int(x), int(y))) != 255:
            continue
        before = np.asarray(filled) == 128
        ImageDraw.floodfill(filled, (int(x), int(y)), 128)
        region = (np.asarray(filled) == 128) & ~before
        if region.sum() < 40:  # motas sueltas: no son fondo
            filled = Image.fromarray(np.where(region, 60, np.asarray(filled)).astype("uint8"))
    bg = np.asarray(filled) == 128
    # Borde: los píxeles junto al fondo que aún tiran a rosa, medio transparentes.
    edge = grow(bg, 2) & ~bg
    alpha = np.ones(dist.shape)
    alpha[bg] = 0
    alpha[edge] = np.clip((dist[edge] - 70) / 90, 0, 1)
    return alpha


def grow(mask, px):
    """Ensancha una máscara booleana `px` píxeles."""
    img = Image.fromarray((mask * 255).astype("uint8")).filter(ImageFilter.MaxFilter(px * 2 + 1))
    return np.asarray(img) > 127


def shrink(mask, px):
    img = Image.fromarray((mask * 255).astype("uint8")).filter(ImageFilter.MinFilter(px * 2 + 1))
    return np.asarray(img) > 127


def feather(mask, px):
    """Máscara booleana -> alfa de 0 a 1 con el borde difuminado."""
    img = Image.fromarray((mask * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(px))
    return np.asarray(img).astype(float) / 255


def save(rgb, alpha, path, crop=None):
    rgba = np.dstack([rgb, alpha * 255]).astype("uint8")
    img = Image.fromarray(rgba, "RGBA")
    if crop:
        img = img.crop(crop)
    img.save(path, "WEBP", quality=90, method=6)


def main():
    (OUT / "piezas").mkdir(parents=True, exist_ok=True)
    base = load("base.jpg")

    # --- Cabeza: silueta de la capa cian, píxeles de la base (idénticos al dibujo original).
    head_rgb = load("capa-cabeza.jpg")
    cyan = (head_rgb[:, :, 0] < 90) & (head_rgb[:, :, 1] > 190) & (head_rgb[:, :, 2] > 190)
    head = grow(shrink(~cyan, 2), 4)  # sin motas, y con el contorno incluido
    head_alpha = feather(head, 1.2) * pink_alpha(base)
    save(base, head_alpha, OUT / "cabeza.webp")

    # --- Escena: la imagen sin cabeza, sin el fondo rosa.
    scene = load("sin-cabeza.jpg")
    # Fuera de la zona de la cabeza, mejor la base tal cual (Gemini retoca cosas sueltas).
    head_zone = grow(head, 30)
    zone = feather(head_zone, 8)[:, :, None]
    scene = scene * zone + base * (1 - zone)
    save(scene, pink_alpha(scene), OUT / "escena.webp")

    # --- Piezas
    meta = {"size": SIZE, "pieces": {}}
    for name, ((x0, y0, x1, y1), on_head) in PIECES.items():
        if not (ART / f"{name}.jpg").exists():
            print("sin imagen (se omite):", name)
            continue
        var = load(f"{name}.jpg")
        diff = np.sqrt(((var - base) ** 2).sum(2)) > 45
        region = np.zeros_like(diff)
        region[y0:y1, x0:x1] = True
        diff &= region
        # Fuera ruido del JPG (motas sueltas) y ensanchado para llevarse el borde del cambio.
        diff = grow(shrink(grow(diff, 2), 3), 6) & region
        alpha = feather(diff, 3) * pink_alpha(var)
        ys, xs = np.where(alpha > 0.01)
        if not len(xs):
            print("pieza vacía:", name)
            continue
        box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
        save(var, alpha, OUT / "piezas" / f"{name}.webp", crop=box)
        meta["pieces"][name] = {"x": box[0], "y": box[1], "head": on_head}
        print(f"pieza {name}: {box[2] - box[0]}x{box[3] - box[1]} en ({box[0]}, {box[1]})")

    (OUT / "avatar.json").write_text(json.dumps(meta, indent=2) + "\n")
    print("listo:", ", ".join(p.name for p in sorted(OUT.glob("*.webp"))))


if __name__ == "__main__":
    main()
