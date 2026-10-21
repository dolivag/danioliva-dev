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

**Redirección automática:** `middleware.ts` (Routing Middleware de Vercel) manda `/` y `/apps/<slug>/` a `/ca/…` o
`/en/…` según `Accept-Language` (el idioma preferido entre los que hay; si no se habla ninguno, inglés). No actúa
si hay cookie `lang` (la pone el selector al elegir idioma), con buscadores o previsualizaciones, ni sin la
cabecera. Es un 302 y solo se ve desplegado en Vercel, no en `astro preview`; todo está en ese
fichero, sin imports (Vercel compila cada archivo por separado y un import sin extensión no se resuelve).

Para un proyecto nuevo: sus datos en `src/data/site.ts` y sus textos, con el mismo `slug`, en los tres idiomas.
Para un idioma nuevo: `src/i18n/<código>.ts`, añadirlo a `locales` y a `langNames` en `src/i18n/index.ts` y a
`i18n.locales` de `astro.config.mjs`.

El contenido de proyectos, experiencia y estudios está en `src/i18n/` (textos) y `src/data/site.ts` (datos).

### Compartir y buscadores

- **Vista previa al compartir:** cada página (portada y proyectos, en los tres idiomas) lleva `og:image` y
  `twitter:card` con una tarjeta de 1200×630 en `public/og/<idioma>/<home|slug>.png`. Las dibuja
  `src/pages/og-card/` (solo existe con `astro dev`, no entra en el build) con los mismos textos de `src/i18n/`, y
  `node scripts/build-social.cjs` las guarda como PNG (y regenera `apple-touch-icon.png` y `favicon.ico`). Todo lo
  importante va en el cuadrado central de 630×630, que es lo que recortan WhatsApp Web y otras apps en su miniatura
  (el móvil enseña la tarjeta entera). Hay que volver a lanzarlo al cambiar un texto o una captura de proyecto, subir
  los PNG y subir `OG_VERSION` en `Base.astro` (las apps guardan la imagen de cada enlace). Necesita Playwright con
  Chromium (`PW_CHROMIUM_PATH` si ya lo tienes en otro sitio).
- **Favicon:** `public/favicon.svg`, una «D.» en Fraunces (la serif de los títulos) con el punto de los titulares, sobre ámbar: se ve igual en barras claras y oscuras.
- **`theme-color`:** una meta para claro y otra para oscuro (el selector de tema las actualiza).
- **Buscadores:** `sitemap.xml` (`src/pages/sitemap.xml.ts`) con las tres versiones de cada página (`hreflang`),
  `robots.txt`, y datos estructurados de schema.org: `Person` en la portada y `SoftwareApplication` en cada proyecto
  ya público.

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
