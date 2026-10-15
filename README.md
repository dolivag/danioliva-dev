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

## Cabeza en 3D

La portada dibuja una cabeza hecha de partículas que sigue al cursor (`src/components/HeadHero.astro`
y `src/scripts/head.ts`, con three.js). Sin modelo, usa una cabeza provisional generada por código.

Para usar el escaneo: exportarlo a **GLB** (idealmente de 1-2 MB o menos, con la cara mirando a +Z) y
guardarlo como `public/models/head.glb`. La web usa los vértices y las normales de su malla; no
hace falta tocar nada más. Con «reducir movimiento» activado se muestra una imagen fija, y sin
WebGL el texto sigue ahí.
