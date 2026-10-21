# danioliva.dev

Web personal y portfolio de Daniel Oliva. Astro estático, desplegado en Vercel.

```bash
npm install
npm run dev      # servidor local
npm run build    # genera dist/
npm run check    # tipos de Astro
```

### Idiomas

La web está en castellano (raíz, las URLs de siempre), catalán (`/ca/…`) e inglés (`/en/…`). Todo lo que se ve
es texto de `src/i18n/<idioma>.ts` (`es.ts`, `ca.ts`, `en.ts`, tipados por `types.ts`: si falta algo en un
idioma, `astro check` falla): interfaz, intro, experiencia, estudios, fichas de proyecto y juego del avatar.
Lo que no es texto (enlaces, capturas, stack) sigue en `src/data/site.ts`. Las páginas son una sola plantilla
(`src/pages/[...lang]/`); cada una lleva `hreflang`, `canonical` y `og:locale`, y un selector de idioma que
mantiene la página en la que estás.

Para un proyecto nuevo: sus datos en `src/data/site.ts` y sus textos, con el mismo `slug`, en los tres idiomas.
Para un idioma nuevo: `src/i18n/<código>.ts`, añadirlo a `locales` y a `langNames` en `src/i18n/index.ts` y a
`i18n.locales` de `astro.config.mjs`.

El contenido de proyectos, experiencia y estudios está en `src/i18n/` (textos) y `src/data/site.ts` (datos).

### Páginas de proyecto

Cada proyecto de `src/data/site.ts` tiene su página en `/apps/<slug>/` (y `/ca/…`, `/en/…`; la genera
`src/pages/[...lang]/apps/[slug].astro`). La tarjeta de la portada lleva a esa página y su botón ↗ abre el proyecto
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

### Marco de fotos del avatar en las páginas de proyecto

Al entrar en `/apps/<slug>/` el avatar pone sobre su escritorio un marco de fotos de bambú con el logo del
proyecto. El marco se dibuja dentro del lienzo del avatar (`avatar.ts`, `placeFrame`), con los mismos píxeles
que él (una rejilla de 128 en 1024 px), mirando hacia donde mira el avatar y con su pie por detrás. Los logos
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
