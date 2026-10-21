import { es } from './es';
import { ca } from './ca';
import { en } from './en';
import type { Dict } from './types';

export const locales = ['es', 'ca', 'en'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'es';

/** Nombre de cada idioma en su propio idioma. */
export const langNames: Record<Lang, string> = { es: 'Español', ca: 'Català', en: 'English' };
export const ogLocale: Record<Lang, string> = { es: 'es_ES', ca: 'ca_ES', en: 'en_GB' };

const dicts: Record<Lang, Dict> = { es, ca, en };
export const useDict = (lang: Lang): Dict => dicts[lang];

export const isLang = (s: string | undefined): s is Lang => !!s && (locales as readonly string[]).includes(s);

/** El idioma de una ruta: `/en/…` y `/ca/…` llevan prefijo; el español (por defecto) no. */
export function langFromPath(pathname: string): Lang {
  const first = pathname.split('/')[1];
  return isLang(first) && first !== defaultLang ? first : defaultLang;
}

/** La ruta sin el prefijo de idioma (siempre empieza por `/`). */
export function stripLang(pathname: string): string {
  const parts = pathname.split('/');
  if (isLang(parts[1]) && parts[1] !== defaultLang) parts.splice(1, 1);
  return parts.join('/') || '/';
}

/** La ruta de `path` (con `#ancla` opcional) en el idioma `lang`. */
export function localePath(lang: Lang, path = '/'): string {
  const [p, hash] = path.split('#');
  const base = p.startsWith('/') ? p : `/${p}`;
  const prefixed = lang === defaultLang ? base : `/${lang}${base === '/' ? '/' : base}`;
  return hash ? `${prefixed}#${hash}` : prefixed;
}

/** Rellena `{clave}` en una plantilla. */
export const fmt = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
