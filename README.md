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

El avatar en pixel art que acompaña al visitante (`src/components/Avatar.astro` y
`src/scripts/avatar.ts`) se compone en un canvas de 200x200 a partir de capas y piezas de
expresión, y cambia de gesto según la sección (`data-avatar` en cada sección).

Las imágenes de partida están en `art/avatar/` (la base y variantes hechas con Gemini, todas con el
mismo encuadre). `python3 scripts/build-avatar.py` (Pillow y numpy) genera `public/avatar/`:

- capas: `fondo`, `cuerpo`, `cabeza`, `primer-plano` (cabeza y primer plano, sobre fondo magenta);
- piezas: solo la zona que cambia cada variante (`ojos-*`, `cejas-*`, `boca-*`, `birrete`).

Para un gesto nuevo: pedir a Gemini la base con solo esa zona cambiada, guardarla en `art/avatar/`,
añadir su zona en `PIECES` del script y usarla en `STATES` de `avatar.ts`.
