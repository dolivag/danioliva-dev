import type { AchievementId } from '../scripts/game';

export type Fact = { title: string; text: string };

/** Los textos de un proyecto en un idioma. Lo que no es texto (enlaces, capturas, stack) está en `data/site.ts`. */
export type ProjectCopy = {
  status: string;
  description: string;
  /** Texto del botón de su página (vacío si aún no es público). */
  openLabel: string;
  /** Palabras de la cinta de su página. */
  tags: string[];
  lead: string;
  facts: Fact[];
  /** Título de la sección de enlaces (por defecto, `common.links`). */
  linksTitle?: string;
  /** Etiquetas de los enlaces de `data/site.ts`, en el mismo orden. */
  links?: string[];
  code?: { title: string; text: string };
  /** Textos alternativos de las capturas de móvil, en el mismo orden. */
  shotAlts?: string[];
  /** Texto alternativo de la captura de escritorio. */
  webAlt?: string;
  /** Textos alternativos de las capturas de escritorio extra (`webs`), en el mismo orden. */
  webAlts?: string[];
};

export type Dict = {
  meta: { description: string };
  /** Cargo, para el título de la página. */
  role: string;
  hero: { hi: string; role: string };
  /** Página 404. `say` es lo que dice el avatar al llegar. */
  notFound: { hi: string; text: string; say: string; home: string; projects: string };
  nav: { label: string; index: string; projects: string; experience: string; contact: string };
  sections: { projects: string; experience: string; studies: string; contact: string };
  intro: {
    big: string;
    text: string;
    viewProjects: string;
    contact: string;
    /** Ficha de un vistazo (a la derecha del texto en pantallas anchas). */
    glance: { label: string; items: { k: string; v: string }[] };
  };
  marquee: string[];
  common: {
    personalProject: string;
    /** `{name}` se sustituye por el nombre del proyecto. */
    openAria: string;
    project: string;
    back: string;
    moreProjects: string;
    /** Carrusel de proyectos de la portada (pantallas anchas). */
    carousel: { label: string; prev: string; next: string };
    captures: string;
    whatItDoes: string;
    links: string;
    viewDetail: string;
    email: string;
    /** Aviso para lectores de pantalla en los enlaces que abren otra pestaña (sin paréntesis). */
    newTab: string;
    /** Enlace «saltar al contenido» para teclado y lectores de pantalla. */
    skip: string;
  };
  theme: {
    group: string;
    toggle: string;
    toggleTitle: string;
    light: string;
    lightShort: string;
    dark: string;
    darkShort: string;
    system: string;
    systemShort: string;
  };
  lang: { label: string };
  contact: { writeMe: string; code: string; profile: string; cvLabel: string; cvLink: string };
  experience: { company: string; role: string; period: string; description: string; bullets?: string[] }[];
  studies: { school: string; when: string; title: string }[];
  projects: Record<string, ProjectCopy>;
  game: {
    panelTitle: string;
    panelAria: string;
    toDiscover: string;
    repeat: string;
    /** `{title}` */
    repeatAria: string;
    stageAria: string;
    /** `{n}`, `{total}`; debe empezar por el texto visible del botón («{n}/{total}»). */
    counterAria: string;
    /** `{title}`, `{n}`, `{total}` */
    unlocked: string;
    complete: string;
    done: string;
    woke: string;
    achievements: Record<AchievementId, { title: string; how: string; say: string }>;
    /** Lo que dice el avatar al arrastrarle una palabra que no da logro. */
    words: Record<string, string>;
    jokes: string[];
    /** Lo que responde al escribir un comando con el teclado (`sudo`, `npm install`). */
    commands: Record<string, string>;
  };
};
