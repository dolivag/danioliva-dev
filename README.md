# danioliva.dev

Web personal y portfolio de Daniel Oliva. Astro estático, desplegado en Vercel.

```bash
npm install
npm run dev      # servidor local
npm run build    # genera dist/
npm run check    # tipos de Astro
```

El contenido (proyectos, experiencia, estudios) está en `src/data/site.ts`.

### Páginas de proyecto

Cada proyecto de `projects` (en `src/data/site.ts`) tiene su página en `/apps/<slug>/` (la genera
`src/pages/apps/[slug].astro`). La tarjeta de la portada lleva a esa página y su botón ↗ abre el proyecto
(`href`) en una pestaña nueva; la página también tiene su botón para abrirlo.

### Capturas de los proyectos

Cada proyecto puede llevar hasta 3 capturas de iPhone (`shots`) o una captura de escritorio en una
ventana de navegador (`web`, preparada con `--width 1440`), enmarcadas en su tarjeta:

```bash
python3 scripts/optimize-shots.py hogarnizer IMG_0001.PNG IMG_0002.PNG IMG_0003.PNG
```

Deja `public/projects/hogarnizer/1.webp…` (390 px de ancho). Luego se enlazan en `shots` del proyecto en
`src/data/site.ts` (hay un ejemplo comentado), con un `alt` que describa la captura.

## Hogarnizer

Las páginas legales de la app viven en la propia app web (`hogarnizer.danioliva.dev`); aquí solo hay
redirecciones, definidas en `astro.config.mjs`, para que estas URL no cambien nunca:

- `/apps/hogarnizer/privacidad`
- `/apps/hogarnizer/soporte`
- `/apps/hogarnizer/eliminar-cuenta`

## Avatar animado

El avatar que acompaña al visitante (`src/components/Avatar.astro` y `src/scripts/avatar.ts`) se
compone en un canvas: la escena (todo menos la cabeza), la cabeza y piezas que cambian una sola zona
(ojos, cejas, boca, birrete, manos, saludo, vapor). Cambia de gesto según la sección
(`data-avatar` en cada sección).

### Marcos del avatar en las páginas de proyecto

Al entrar en `/apps/<slug>/` el avatar cuelga un marco de pixel art con el logo del proyecto (con los
mismos píxeles que el avatar: una rejilla de 128 en su ancho). Los logos
están en `art/frames/<slug>.svg` (y su `.png`, que sale de renderizarlo a 256 px); `python3
scripts/build-frames.py` genera los sprites de `public/avatar/marcos/`. Para un proyecto nuevo: añadir su
logo ahí y volver a lanzar el script.

### Juego de interacciones

El avatar vive abajo a la derecha y tiene logros que se desbloquean (se guardan en `localStorage`). Los
datos y el arrastre de palabras están en `src/scripts/game.ts`; las poses de cada reacción, en
`REACTIONS` de `avatar.ts`; el panel y la lógica, en `Avatar.astro`. Para una palabra arrastrable:
`data-drag="palabra"` en el HTML y su entrada en `WORDS`. Para un logro nuevo: añadirlo a
`ACHIEVEMENTS` y una pose con su mismo id en `REACTIONS`. Las interacciones son secretas: el panel solo enseña «???» hasta que se descubren (y entonces
permite repetirlas). Sin pistas visuales a propósito.

Las imágenes de partida están en `art/avatar/` (1024x1024, hechas con Gemini a partir de
`base.jpg`, todas con el mismo encuadre y fondo rosa). `python3 scripts/build-avatar.py` (Pillow
con WebP y numpy) genera `public/avatar/`: `escena.webp`, `cabeza.webp`, `piezas/*.webp` y
`avatar.json` con la posición de cada pieza.

Para un gesto nuevo: pedir a Gemini la base con solo esa zona cambiada, guardarla en
`art/avatar/`, añadir su zona en `PIECES` del script y usarla en `STATES` de `avatar.ts`.
