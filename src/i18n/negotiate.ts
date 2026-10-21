import { isLang, locales } from './index';
import type { Lang } from './index';

/** El idioma del cookie `lang` (lo pone el selector de idioma al elegir uno), si lo hay. */
export function langFromCookie(cookie: string | null): Lang | null {
  const m = cookie?.match(/(?:^|;\s*)lang=([a-z]{2})(?:;|$)/);
  return m && isLang(m[1]) ? m[1] : null;
}

/**
 * Qué idioma ofrecer según `Accept-Language`: el de más preferencia entre los que hay (`locales`); si ninguno
 * de los idiomas que la persona habla está entre ellos, inglés. Sin cabecera (buscadores, previsualizaciones),
 * `null`: no hay nada que decidir y se sirve la página tal cual.
 */
export function pickLang(header: string | null): Lang | null {
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
  for (const p of prefs) if ((locales as readonly string[]).includes(p.lang)) return p.lang as Lang;
  return prefs.length ? 'en' : null;
}
