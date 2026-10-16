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
(`data-avatar` en cada sección) y al hacer clic.

Las imágenes de partida están en `art/avatar/` (1024x1024, hechas con Gemini a partir de
`base.jpg`, todas con el mismo encuadre y fondo rosa). `python3 scripts/build-avatar.py` (Pillow
con WebP y numpy) genera `public/avatar/`: `escena.webp`, `cabeza.webp`, `piezas/*.webp` y
`avatar.json` con la posición de cada pieza.

Para un gesto nuevo: pedir a Gemini la base con solo esa zona cambiada, guardarla en
`art/avatar/`, añadir su zona en `PIECES` del script y usarla en `STATES` de `avatar.ts`.

## Capturas de los proyectos

Las capturas salen solas: basta con dejar imágenes en `public/proyectos/<proyecto>/`, con nombres
`1.webp`, `2.webp`… (también `.png`, `.jpg` o `.avif`). Se ordenan por número. Sin imágenes no se
pinta nada.

| Carpeta | Marco | Qué | Medida orientativa |
| --- | --- | --- | --- |
| `hogarnizer` | móvil | hasta 3 en la portada y 4 en su página | vertical, unos 1170×2532 |
| `duometeo` | navegador | 1 | apaisada, unos 1600×1000 |
| `trasteo` | móvil | hasta 3 | vertical |

Para pesar poco: exportar a **WebP** (calidad 80) y que cada imagen no pase de unos 150 KB. Para
Hogarnizer, usar la cuenta de demostración de la app (`supabase/demo/cuenta-revision.sql` en su
repo): son datos ficticios.
