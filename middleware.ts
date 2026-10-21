import { next } from '@vercel/functions';
import { defaultLang } from './src/i18n';
import { langFromCookie, pickLang } from './src/i18n/negotiate';

/**
 * Redirección automática por idioma, solo en la portada y en las páginas de proyecto (lo que se comparte):
 * si el navegador prefiere catalán o inglés (o un idioma que no tenemos, que va al inglés), se manda a `/ca/…`
 * o `/en/…`. No se redirige si la persona ya eligió idioma con el selector (cookie `lang`), ni a buscadores y
 * previsualizaciones de enlaces, ni si el navegador no manda `Accept-Language`. El resto de rutas no se toca.
 */
export const config = { matcher: ['/', '/apps/:slug', '/apps/:slug/'] };

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|linkedin|twitter|discord|slack/i;

export default function middleware(request: Request) {
  if (BOTS.test(request.headers.get('user-agent') ?? '')) return next();
  if (langFromCookie(request.headers.get('cookie'))) return next();

  const lang = pickLang(request.headers.get('accept-language'));
  if (!lang || lang === defaultLang) return next();

  const url = new URL(request.url);
  url.pathname = `/${lang}${url.pathname}`;
  // 302: es una sugerencia según el navegador, no una URL nueva; nunca se cachea.
  return new Response(null, {
    status: 302,
    headers: { Location: url.toString(), Vary: 'Accept-Language, Cookie', 'Cache-Control': 'private, no-store' },
  });
}
