# danioliva.dev

Web personal y portfolio de Daniel Oliva. Astro estático, desplegado en Vercel.

```bash
npm install
npm run dev      # servidor local
npm run build    # genera dist/
npm run check    # tipos de Astro
```

El contenido (proyectos, experiencia, estudios) está en `src/data/site.ts`.

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

### Juego de interacciones

El avatar vive abajo a la derecha y tiene logros que se desbloquean (se guardan en `localStorage`). Los
datos y el arrastre de palabras están en `src/scripts/game.ts`; las poses de cada reacción, en
`REACTIONS` de `avatar.ts`; el panel y la lógica, en `Avatar.astro`. Para una palabra arrastrable:
`data-drag="palabra"` en el HTML y su entrada en `WORDS`. Para un logro nuevo: añadirlo a
`ACHIEVEMENTS` y una pose con su mismo id en `REACTIONS`. El panel tiene un botón «Probar» por logro
(alternativa para teclado y táctil).

Las imágenes de partida están en `art/avatar/` (1024x1024, hechas con Gemini a partir de
`base.jpg`, todas con el mismo encuadre y fondo rosa). `python3 scripts/build-avatar.py` (Pillow
con WebP y numpy) genera `public/avatar/`: `escena.webp`, `cabeza.webp`, `piezas/*.webp` y
`avatar.json` con la posición de cada pieza.

Para un gesto nuevo: pedir a Gemini la base con solo esa zona cambiada, guardarla en
`art/avatar/`, añadir su zona en `PIECES` del script y usarla en `STATES` de `avatar.ts`.
