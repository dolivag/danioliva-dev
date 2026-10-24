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

## Comprobaciones y analítica

- **CI** (`.github/workflows/ci.yml`): en cada PR y en cada push a `main` ejecuta `npm run check` (tipos y plantillas; `astro build` por sí solo no los revisa) y `npm run build`.
- **Analítica:** Vercel Web Analytics, sin cookies y anónima. El script solo se añade en producción (`Base.astro`) y empieza a contar cuando se activa «Web Analytics» en el panel del proyecto en Vercel.
- **Proyecto anterior y siguiente** al pie de cada página de proyecto (`.pn`; el último enlaza con el primero).

## Currículum

`/cv/`, `/ca/cv/` y `/en/cv/` (`src/pages/[...lang]/cv.astro`): una hoja A4 que se imprime o se guarda como PDF desde el botón de la página (sin teléfono). Los textos están en `src/i18n/cv.ts` (aparte del resto de diccionarios) y la foto en `public/cv/foto.webp`. Para que siga cabiendo en una sola página, si añades contenido conviene comprobar la vista de impresión (`Ctrl+P`) en los tres idiomas.

## Vídeos en bucle

Una captura de escritorio de un proyecto puede ser un vídeo corto (`clip` en `web` de `src/data/site.ts`, con su `clipAlt` en
los textos). `scripts/optimize-clip.sh` convierte una grabación a MP4 + WebM + póster. `BrowserShot.astro` los reproduce
en bucle, sin sonido, solo mientras se ven en pantalla; con «reducir movimiento» no arrancan solos y se enseñan con controles.
En los móviles (`PhoneShots`, `ShotGallery`) una captura puede llevar `clip` y `clipDark` (el mismo vídeo con la web en oscuro; solo corre el del
tema activo; si falta uno de los dos se usa la imagen): así están la del medio de QR City y las tres de Hogarnizer, grabadas en un iPhone. `src/scripts/clips.ts` se encarga de arrancarlos y pararlos.
DuoMeteo lo grabé con Playwright (`recordVideo`) y recortando con ffmpeg. Las escenas 3D (QR City) no salen fluidas en un
navegador sin GPU: ese se graba en un equipo con tarjeta gráfica.

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
`ACHIEVEMENTS` y una pose con su mismo id en `REACTIONS`. Además de arrastrar, una palabra se le puede dar al avatar con **doble clic** (las etiquetas) o con **Mayús+Intro**
con el foco en una palabra o en el enlace de un proyecto (para quien no usa ratón). Hay un enlace «saltar al contenido»
(`.skip`) y las etiquetas accesibles de botones y enlaces salen de `src/i18n/`.

Para no cargar de golpe unas 60 imágenes, `avatar.ts` solo pide al arrancar la escena, la cabeza y las piezas de las poses de cada sección; las de los gestos del juego (`LATER`: taza, regadera, bostezo…) llegan a los 2,5 s, una a una cuando el navegador está libre, y una pose que lleve una pieza que aún no ha llegado simplemente la salta. Los pósters de los vídeos (`data-poster`) se piden al acercarse a la pantalla (`clips.ts`). Las tarjetas para compartir van sin grano (menos de 300 KB, que es lo que prefiere WhatsApp).

Las interacciones son secretas: el panel solo enseña «???» hasta que se descubren (y entonces
permite repetirlas). Sin pistas visuales a propósito.

Hay 18 logros. Los que no son de arrastrar ni de clic suelto: **taza, planta y portátil** (clic en esa zona del
escritorio; las zonas, en coordenadas del lienzo de 1024, están en `ZONES` de `Avatar.astro`), **políglota** y **curioso**
(se recuerdan en `localStorage` los idiomas y las páginas de proyecto visitados: `avatar-langs`, `avatar-projects`),
**noctámbulo** (entrar entre las 00:00 y las 06:00, hora local), **terminal** (escribir `sudo` o `npm install` fuera de
un campo de texto; los comandos y sus respuestas están en `game.commands` de `src/i18n/`) y **Storia** arrastrada
(`WORDS`). Las poses de la taza, la planta (regadera y guindillas), el noctámbulo (bostezo con la mano) y el saludo (dos
fotogramas que se alternan) usan piezas propias de `art/avatar/` (`taza-sube`, `taza-boca`, `regadera`,
`planta-feliz`, `ojos-somnolientos`, `ojos-bostezo`, `boca-bostezo`, `mano-boca`, `ojos-felices`, `boca-ahh`,
`saludo-2`). Una pieza solo añade píxeles; las que se llevan algo de la escena (la taza de la mesa) llevan su
máscara de borrado (`*.borra.webp`, se pinta con `destination-out`; el rectángulo está en `PIECES` como tercer
valor). Al regar, la planta se queda crecida (`planta-feliz`, que se pinta por delante de las manos del teclado y por detrás de
la regadera; su recorte es ajustado para no velar lo que tiene detrás). El sorbo del café pasa por cuatro posiciones
(`taza-sube`, `taza-cerca`, `taza-boca`) con fundidos y un fotograma de estela entre ellas (`alpha` de la pose). Para
regenerar solo alguna pieza: `ONLY=planta-feliz python3 scripts/build-avatar.py`. Las gotas y las «z» no son imágenes: son rectángulos de 1×1 o 2×2 píxeles de ilustración que dibuja
`avatar.ts` (`rects` de la pose). Las piezas que tapan la cara van «con la cabeza» y se pinta la cabeza fija
(`head: [0, 0]`) mientras están puestas.

Las imágenes de partida están en `art/avatar/` (1024x1024, hechas con Gemini a partir de
`base.jpg`, todas con el mismo encuadre y fondo rosa). `python3 scripts/build-avatar.py` (Pillow
con WebP y numpy) genera `public/avatar/`: `escena.webp`, `cabeza.webp`, `piezas/*.webp` y
`avatar.json` con la posición de cada pieza.

Para un gesto nuevo: pedir a Gemini la base con solo esa zona cambiada, guardarla en
`art/avatar/`, añadir su zona en `PIECES` del script y usarla en `STATES` de `avatar.ts`.
