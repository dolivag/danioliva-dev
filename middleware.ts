/**
 * Redirección automática por idioma, solo en la portada y en las páginas de proyecto (lo que se comparte):
 * si el navegador prefiere catalán o inglés (o un idioma que no tenemos, que va al inglés), se manda a `/ca/…`
 * o `/en/…`. No se redirige si la persona ya eligió idioma con el selector (cookie `lang`), ni a buscadores y
 * previsualizaciones de enlaces, ni si el navegador no manda `Accept-Language`. El resto de rutas no se toca.
 *
 * Todo está en este fichero, sin imports: Vercel compila cada archivo por separado (sin empaquetar) y un import
 * relativo sin extensión no se resuelve en producción.
 *
 * Si algo falla, la página se sirve tal cual: un error aquí nunca debe tumbar la web.
 */
export const config = { matcher: ['/', '/apps/:path*'] };

type Lang = 'es' | 'ca' | 'en';
const LOCALES: readonly string[] = ['es', 'ca', 'en'];
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|linkedin|twitter|discord|slack/i;

/** El idioma del cookie `lang` (lo pone el selector de idioma al elegir uno), si lo hay. */
const langFromCookie = (cookie: string | null): Lang | null => {
  const m = cookie?.match(/(?:^|;\s*)lang=([a-z]{2})(?:;|$)/);
  return m && LOCALES.includes(m[1]) ? (m[1] as Lang) : null;
};

/**
 * Qué idioma ofrecer según `Accept-Language`: el de más preferencia entre los que hay; si ninguno de los idiomas
 * que la persona habla está entre ellos, inglés. Sin cabecera (buscadores, previsualizaciones), `null`.
 */
const pickLang = (header: string | null): Lang | null => {
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
  for (const p of prefs) if (LOCALES.includes(p.lang)) return p.lang as Lang;
  return prefs.length ? 'en' : null;
};

/** Solo la portada y las páginas de proyecto (`/apps/<slug>/`), sin prefijo de idioma. */
const isRedirectable = (pathname: string) => pathname === '/' || /^\/apps\/[^/]+\/?$/.test(pathname);

/** Seguir con la petición sin cambios (lo mismo que hace `next()` de `@vercel/functions`). */
const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

export default function middleware(request: Request): Response {
  try {
    const url = new URL(request.url);
    if (!isRedirectable(url.pathname)) return pass();
    if (BOTS.test(request.headers.get('user-agent') ?? '')) return pass();
    if (langFromCookie(request.headers.get('cookie'))) return pass();

    const lang = pickLang(request.headers.get('accept-language'));
    if (!lang || lang === 'es') return pass();

    url.pathname = `/${lang}${url.pathname}`;
    // 302: es una sugerencia según el navegador, no una URL nueva; nunca se cachea.
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString(), Vary: 'Accept-Language, Cookie', 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return pass();
  }
}
