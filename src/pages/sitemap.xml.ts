import type { APIRoute } from 'astro';
import { locales, localePath } from '../i18n';
import { getProjects } from '../data/site';

/** Mapa del sitio con las tres versiones de cada página (`hreflang`), a mano y sin dependencias. */
const pages = ['/', '/cv/', ...getProjects('es').map((p) => `/apps/${p.slug}/`)];

export const GET: APIRoute = ({ site }) => {
  const abs = (lang: (typeof locales)[number], path: string) => new URL(localePath(lang, path), site).href;
  const urls = pages.flatMap((path) =>
    locales.map(
      (lang) =>
        `  <url>\n    <loc>${abs(lang, path)}</loc>\n` +
        locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(l, path)}"/>`).join('\n') +
        `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${abs('es', path)}"/>\n  </url>`,
    ),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
