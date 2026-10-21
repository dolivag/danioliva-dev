// Sin imports a propósito: lo usa `middleware.ts`, que corre en el servidor de Vercel y debe ser lo más pequeño posible.
const LOCALES = ['es', 'ca', 'en'] as const;
export type NegotiatedLang = (typeof LOCALES)[number];
const isLang = (s: string | undefined): s is NegotiatedLang => !!s && (LOCALES as readonly string[]).includes(s);

/** El idioma del cookie `lang` (lo pone el selector de idioma al elegir uno), si lo hay. */
export function langFromCookie(cookie: string | null): NegotiatedLang | null {
  const m = cookie?.match(/(?:^|;\s*)lang=([a-z]{2})(?:;|$)/);
  return m && isLang(m[1]) ? m[1] : null;
}

/**
 * Qué idioma ofrecer según `Accept-Language`: el de más preferencia entre los que hay; si ninguno de los idiomas
 * que la persona habla está entre ellos, inglés. Sin cabecera (buscadores, previsualizaciones), `null`: no hay
 * nada que decidir y se sirve la página tal cual.
 */
export function pickLang(header: string | null): NegotiatedLang | null {
  if (!header) return null;
  const prefs = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const weight = q ? parseFloat(q.slice(2)) : 1;
      return { lang: tag.trim().toLowerCase().split('-')[0], q: Number.isNaN(weight) ? 1 : weight };
    })
    .filter((p) => p.lang && p.lang !== '*' && p.q > 0)
    .sort((a, b) => b.q - a.q); // estable: a igual peso, manda el orden de la cabecera
  for (const p of prefs) if (isLang(p.lang)) return p.lang;
  return prefs.length ? 'en' : null;
}

/** ¿Es una ruta que se redirige? Solo la portada y las páginas de proyecto (`/apps/<slug>/`), sin prefijo de idioma. */
export const isRedirectable = (pathname: string) => pathname === '/' || /^\/apps\/[^/]+\/?$/.test(pathname);
