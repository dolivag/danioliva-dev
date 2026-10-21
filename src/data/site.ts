import { useDict, localePath } from '../i18n';
import type { Lang } from '../i18n';
import type { ProjectCopy } from '../i18n/types';

export const site = {
  name: 'Daniel Oliva',
  email: 'hola@danioliva.dev',
  github: 'https://github.com/dolivag',
  linkedin: 'https://www.linkedin.com/in/daniel-oliva-gomez/',
  appUrl: 'https://hogarnizer.danioliva.dev',
};

/** Captura de pantalla de un proyecto: `src` es una ruta de /public (se generan con scripts/optimize-shots.py). */
/** `srcDark` es la misma pantalla en modo oscuro: se enseña cuando la web está en oscuro. */
export type Shot = {
  src: string;
  srcDark?: string;
  alt: string;
  /** Vídeo corto en bucle en lugar de la imagen: ruta sin extensión (`<ruta>.webm`, `.mp4` y el póster `.jpg`; ver `scripts/optimize-clip.sh`). */
  clip?: string;
  /** El mismo vídeo grabado con la web en oscuro (se enseña con el tema oscuro). */
  clipDark?: string;
  /** Qué se ve en el vídeo (para lectores de pantalla). */
  clipAlt?: string;
};

/** Lo de un proyecto que no es texto. Los textos (por idioma) están en `src/i18n/<idioma>.ts`, bajo `projects[slug]`. */
type ProjectBase = {
  /** Su página en el portfolio es /apps/<slug>/ (la de Hogarnizer no puede cambiar: está en las fichas de las tiendas). */
  slug: string;
  name: string;
  /** Tecnologías, separadas por « · » (no se traducen). */
  stack: string;
  /** Dirección pública del proyecto (se abre en una pestaña nueva, desde la tarjeta y desde su página). Vacía si aún no es pública. */
  href: string;
  /** Enlaces de su página; las etiquetas, por idioma y en el mismo orden, en `links` de sus textos. */
  links?: string[];
  /** Hasta 3 capturas de iPhone, enmarcadas en la tarjeta y en su página (su `alt`, en `shotAlts`). Sin capturas, solo texto. */
  shots?: { src: string; srcDark?: string; clip?: string; clipDark?: string }[];
  /** Captura de escritorio de la web, en una ventana de navegador (alternativa a `shots`; su `alt`, en `webAlt`). */
  web?: { src: string; srcDark?: string; clip?: string };
  /** Más capturas de escritorio, que se enseñan bajo la principal en su página (sus `alt`, en `webAlts`). */
  webs?: { src: string; srcDark?: string }[];
};

const projectsBase: ProjectBase[] = [
  {
    slug: 'qr-city',
    name: 'QR City',
    stack: 'Three.js · Vite · TypeScript',
    href: 'https://qr-city.danioliva.dev',
    links: [
      'https://github.com/dolivag/qr-city',
      'https://www.npmjs.com/package/@qr-city/core',
      'https://www.npmjs.com/package/@qr-city/element',
      'https://www.npmjs.com/package/@qr-city/react',
      'https://www.npmjs.com/package/@qr-city/vue',
      'https://www.npmjs.com/package/@qr-city/angular',
    ],
    shots: [
      { src: '/projects/qr-city/ciberpunk.webp', srcDark: '/projects/qr-city/ciberpunk-oscuro.webp' },
      { src: '/projects/qr-city/costera.webp', srcDark: '/projects/qr-city/costera-oscuro.webp', clip: '/projects/qr-city/clip', clipDark: '/projects/qr-city/clip-oscuro' },
      { src: '/projects/qr-city/laboratorio.webp', srcDark: '/projects/qr-city/laboratorio-oscuro.webp' },
    ],
  },
  {
    slug: 'hogarnizer',
    name: 'Hogarnizer',
    stack: 'Expo · React Native · Supabase',
    href: site.appUrl,
    links: ['/apps/hogarnizer/privacidad', '/apps/hogarnizer/soporte', '/apps/hogarnizer/eliminar-cuenta'],
    shots: [
      { src: '/projects/hogarnizer/compra.webp', srcDark: '/projects/hogarnizer/compra-oscuro.webp', clip: '/projects/hogarnizer/compra-clip', clipDark: '/projects/hogarnizer/compra-clip-oscuro' },
      { src: '/projects/hogarnizer/tareas.webp', srcDark: '/projects/hogarnizer/tareas-oscuro.webp', clip: '/projects/hogarnizer/tareas-clip', clipDark: '/projects/hogarnizer/tareas-clip-oscuro' },
      { src: '/projects/hogarnizer/gastos.webp', srcDark: '/projects/hogarnizer/gastos-oscuro.webp', clip: '/projects/hogarnizer/gastos-clip', clipDark: '/projects/hogarnizer/gastos-clip-oscuro' },
    ],
  },
  {
    slug: 'duometeo',
    name: 'DuoMeteo',
    stack: 'Next.js · React · Tailwind',
    href: 'https://duometeo.danioliva.dev/',
    links: ['https://open-meteo.com'],
    web: { src: '/projects/duometeo/web.webp', srcDark: '/projects/duometeo/web-oscuro.webp', clip: '/projects/duometeo/clip' },
    webs: [
      { src: '/projects/duometeo/hero.webp', srcDark: '/projects/duometeo/hero-oscuro.webp' },
      { src: '/projects/duometeo/comparativa.webp', srcDark: '/projects/duometeo/comparativa-oscuro.webp' },
      { src: '/projects/duometeo/dias.webp', srcDark: '/projects/duometeo/dias-oscuro.webp' },
    ],
  },
  {
    slug: 'trasteo',
    name: 'Trasteo',
    stack: 'Expo · React Native · Supabase',
    href: '',
  },
  {
    slug: 'storia',
    name: 'Storia',
    stack: 'Expo · React Native · Supabase',
    href: '',
  },
];

/** Un proyecto listo para pintar: sus datos y sus textos en un idioma. */
export type Project = Omit<ProjectBase, 'links' | 'shots' | 'web' | 'webs'> &
  Omit<ProjectCopy, 'links' | 'shotAlts' | 'webAlt' | 'webAlts' | 'clipAlt'> & {
    links?: { label: string; href: string }[];
    shots?: Shot[];
    web?: Shot;
    webs?: Shot[];
  };

export const projectUrl = (lang: Lang, p: Pick<ProjectBase, 'slug'>) => localePath(lang, `/apps/${p.slug}/`);

export function getProjects(lang: Lang): Project[] {
  const copy = useDict(lang).projects;
  return projectsBase.map((b) => {
    const { links, shotAlts, webAlt, webAlts, clipAlt, ...text } = copy[b.slug];
    return {
      ...text,
      slug: b.slug,
      name: b.name,
      stack: b.stack,
      href: b.href,
      links: b.links?.map((href, i) => ({ href, label: links?.[i] ?? href })),
      shots: b.shots?.map((s, i) => ({ ...s, alt: shotAlts?.[i] ?? '' })),
      web: b.web ? { ...b.web, alt: webAlt ?? '', clipAlt } : undefined,
      webs: b.webs?.map((s, i) => ({ ...s, alt: webAlts?.[i] ?? '' })),
    };
  });
}
