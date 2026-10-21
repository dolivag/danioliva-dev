import { isRedirectable, langFromCookie, pickLang } from './src/i18n/negotiate';

/**
 * Redirección automática por idioma, solo en la portada y en las páginas de proyecto (lo que se comparte):
 * si el navegador prefiere catalán o inglés (o un idioma que no tenemos, que va al inglés), se manda a `/ca/…`
 * o `/en/…`. No se redirige si la persona ya eligió idioma con el selector (cookie `lang`), ni a buscadores y
 * previsualizaciones de enlaces, ni si el navegador no manda `Accept-Language`. El resto de rutas no se toca.
 *
 * Si algo falla, la página se sirve tal cual: un error aquí nunca debe tumbar la web.
 */
export const config = { matcher: ['/', '/apps/:path*'] };

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|linkedin|twitter|discord|slack/i;

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
