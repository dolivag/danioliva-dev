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
};

export type Dict = {
  meta: { description: string };
  /** Cargo, para el título de la página. */
  role: string;
  hero: { hi: string; role: string };
  nav: { label: string; index: string; projects: string; experience: string; contact: string };
  sections: { projects: string; experience: string; studies: string; contact: string };
  intro: { big: string; text: string; viewProjects: string; contact: string };
  marquee: string[];
  common: {
    personalProject: string;
    /** `{name}` se sustituye por el nombre del proyecto. */
    openAria: string;
    project: string;
    back: string;
    moreProjects: string;
    captures: string;
    whatItDoes: string;
    links: string;
    viewDetail: string;
    email: string;
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
  contact: { writeMe: string; code: string; profile: string };
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
    /** `{n}`, `{total}` */
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
  };
};
