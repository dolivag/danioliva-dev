import { defineConfig } from 'astro/config';

// Las páginas legales de Hogarnizer viven en la propia app web: aquí solo se redirige, para que
// las URLs bajo /apps/hogarnizer/ (las de las fichas de las tiendas) no cambien nunca.
const APP = 'https://hogarnizer.danioliva.dev';

export default defineConfig({
  site: 'https://danioliva.dev',
  redirects: {
    '/apps/hogarnizer/privacidad': `${APP}/privacidad`,
    '/apps/hogarnizer/soporte': `${APP}/soporte`,
    '/apps/hogarnizer/eliminar-cuenta': `${APP}/eliminar-cuenta`,
  },
});
