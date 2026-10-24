import type { Lang } from './index';

/** Los textos del currículum (`/cv/`, `/ca/cv/`, `/en/cv/`). Aparte del resto de diccionarios: solo los usa esa página. */
export type CvCopy = {
  /** Título de la página y de la pestaña. */
  title: string;
  description: string;
  role: string;
  about: { title: string; text: string };
  contact: { title: string; email: string; linkedin: string; github: string };
  skills: { title: string; groups: { title: string; items: string[] }[] };
  soft: { title: string; items: string[] };
  languages: { title: string; items: { name: string; level: string }[] };
  experience: { title: string; jobs: { role: string; company: string; place: string; period: string; bullets: string[] }[] };
  education: { title: string; items: { school: string; period: string; lines: string[] }[] };
  additional: { title: string; paragraphs: string[] };
  ui: { print: string; back: string; photoAlt: string; langs: string };
};

const es: CvCopy = {
  title: 'Currículum',
  description: 'Currículum de Daniel Oliva Gómez, software engineer fullstack y CI/CD.',
  role: 'Software engineer · Fullstack & CI/CD',
  about: {
    title: 'Sobre mí',
    text: 'Software Engineer fullstack (Angular, NestJS) con foco en CI/CD y automatización de pipelines en GitLab. Actualmente en Zennio, combinando desarrollo de producto end-to-end con el CI/CD y las automatizaciones del equipo.',
  },
  contact: { title: 'Contacto', email: 'Email', linkedin: 'LinkedIn', github: 'GitHub' },
  skills: {
    title: 'Habilidades técnicas',
    groups: [
      { title: 'Desarrollo', items: ['Angular, TypeScript, NestJS, PrimeNG, PostgreSQL', 'VueJS, React, React Native', 'PHP / Laravel'] },
      { title: 'CI/CD · DevOps', items: ['GitLab CI/CD (diseño y automatización de pipelines)', 'Docker'] },
    ],
  },
  soft: {
    title: 'Habilidades transversales',
    items: [
      'Facilidad para la comunicación interpersonal',
      'Resolución de problemas',
      'Iniciativa, planificación, organización',
      'Constantemente interesado en las novedades y tendencias tech',
      'Pensamiento analítico',
    ],
  },
  languages: {
    title: 'Idiomas',
    items: [
      { name: 'Castellano', level: 'Nativo' },
      { name: 'Inglés', level: 'Avanzado (B2 - C1)' },
      { name: 'Francés', level: 'Medio' },
      { name: 'Catalán', level: 'Avanzado' },
    ],
  },
  experience: {
    title: 'Experiencia laboral',
    jobs: [
      {
        role: 'Fullstack engineer',
        company: 'Zennio',
        place: 'Toledo (remoto desde Barcelona)',
        period: 'Enero 2024 – actualidad',
        bullets: [
          'Ownership del frontend del producto (Angular, PrimeNG) y full-stack (NestJS). Angular: de la 13 a la 22.',
          'Estándares de calidad (linting, formato, hooks pre-commit, SonarQube) y CHANGELOG.md automático: plugin propio de VS Code (ramas desde develop con sus PBIs) y CI que rellena las entradas.',
          'CI/CD en GitLab: bots de code review en las MR, de la pipeline diaria (propone cambios y crea su MR) y de autodespliegue; evidencias SBOM, SCA, DAST y SAST en cada tag.',
          'IA en el día a día del equipo: skills, MCPs e integración en el flujo de trabajo.',
        ],
      },
      {
        role: 'Consultor asociado',
        company: 'Vanadys',
        place: 'Barcelona',
        period: 'Julio 2021 – enero 2024',
        bullets: [
          'Desarrollo de soluciones para el Output de un banco mediante Avaloq.',
          'Comunicación con clientes y recogida de requisitos funcionales.',
          'Gestión y edición de plantillas de Assentis para la creación de documentos dinámicos según las preferencias del cliente.',
        ],
      },
    ],
  },
  education: {
    title: 'Educación',
    items: [
      { school: 'Universitat Oberta de Catalunya', period: 'Septiembre 2019 – enero 2024', lines: ['Grado en Ingeniería Informática', 'Especialización en Ingeniería del Software', 'Nota media: 9,36'] },
      { school: 'IT Academy, Barcelona', period: 'Enero 2021 – julio 2021', lines: ['Fullstack Bootcamp con PHP y Laravel', 'Adicionalmente, Tailwind y VueJS'] },
    ],
  },
  additional: {
    title: 'Información adicional',
    paragraphs: [
      'Trabajo de Fin de Grado: aplicación móvil multiplataforma (iOS, Android, web) con React Native y Expo.',
      'Storia (desde marzo de 2026): app de generación de historias infantiles con IA, con selección de conceptos narrativos, personajes personalizados y generación de imágenes. Proyecto personal usado como banco de pruebas para nuevas herramientas y tendencias de IA.',
      'Además, me preparo para la certificación GitLab Certified CI/CD Associate.',
    ],
  },
  ui: { print: 'Imprimir / guardar en PDF', back: 'Volver a la web', photoAlt: 'Daniel Oliva', langs: 'Idioma del currículum' },
};

const ca: CvCopy = {
  title: 'Currículum',
  description: 'Currículum de Daniel Oliva Gómez, software engineer fullstack i CI/CD.',
  role: 'Software engineer · Fullstack & CI/CD',
  about: {
    title: 'Sobre mi',
    text: 'Software Engineer fullstack (Angular, NestJS) amb focus en CI/CD i automatització de pipelines a GitLab. Actualment a Zennio, combinant desenvolupament de producte end-to-end amb el CI/CD i les automatitzacions de l’equip.',
  },
  contact: { title: 'Contacte', email: 'Email', linkedin: 'LinkedIn', github: 'GitHub' },
  skills: {
    title: 'Habilitats tècniques',
    groups: [
      { title: 'Desenvolupament', items: ['Angular, TypeScript, NestJS, PrimeNG, PostgreSQL', 'VueJS, React, React Native', 'PHP / Laravel'] },
      { title: 'CI/CD · DevOps', items: ['GitLab CI/CD (disseny i automatització de pipelines)', 'Docker'] },
    ],
  },
  soft: {
    title: 'Habilitats transversals',
    items: [
      'Facilitat per a la comunicació interpersonal',
      'Resolució de problemes',
      'Iniciativa, planificació, organització',
      'Constantment interessat en les novetats i tendències tech',
      'Pensament analític',
    ],
  },
  languages: {
    title: 'Idiomes',
    items: [
      { name: 'Castellà', level: 'Natiu' },
      { name: 'Anglès', level: 'Avançat (B2 - C1)' },
      { name: 'Francès', level: 'Mitjà' },
      { name: 'Català', level: 'Avançat' },
    ],
  },
  experience: {
    title: 'Experiència laboral',
    jobs: [
      {
        role: 'Fullstack engineer',
        company: 'Zennio',
        place: 'Toledo (en remot des de Barcelona)',
        period: 'Gener 2024 – actualitat',
        bullets: [
          'Ownership del frontend del producte (Angular, PrimeNG) i feina full-stack (NestJS). Actualitzacions d’Angular de la 13 a la 22.',
          'Estàndards de qualitat: linting, format, hooks de pre-commit i escaneigs de SonarQube.',
          'CHANGELOG.md automàtic: plugin propi de VS Code (branques des de develop amb els seus PBIs) i CI que omple les entrades en fusionar.',
          'CI/CD a GitLab: bots de code review a les merge requests, de la pipeline diària (proposa canvis i en crea la MR) i d’autodesplegament; evidències SBOM, SCA, DAST i SAST en generar tags.',
          'IA al dia a dia de l’equip: skills, MCPs i integració en el flux de treball.',
        ],
      },
      {
        role: 'Consultor associat',
        company: 'Vanadys',
        place: 'Barcelona',
        period: 'Juliol 2021 – gener 2024',
        bullets: [
          'Desenvolupament de solucions per a l’Output d’un banc mitjançant Avaloq.',
          'Comunicació amb clients i recollida de requisits funcionals.',
          'Gestió i edició de plantilles d’Assentis per a la creació de documents dinàmics segons les preferències del client.',
        ],
      },
    ],
  },
  education: {
    title: 'Educació',
    items: [
      { school: 'Universitat Oberta de Catalunya', period: 'Setembre 2019 – gener 2024', lines: ['Grau d’Enginyeria Informàtica', 'Especialització en Enginyeria del Programari', 'Nota mitjana: 9,36'] },
      { school: 'IT Academy, Barcelona', period: 'Gener 2021 – juliol 2021', lines: ['Fullstack Bootcamp amb PHP i Laravel', 'Addicionalment, Tailwind i VueJS'] },
    ],
  },
  additional: {
    title: 'Informació addicional',
    paragraphs: [
      'Treball de Final de Grau: aplicació mòbil multiplataforma (iOS, Android, web) amb React Native i Expo.',
      'Storia (des del març de 2026): app de generació d’històries infantils amb IA, amb selecció de conceptes narratius, personatges personalitzats i generació d’imatges. Projecte personal usat com a banc de proves per a noves eines i tendències d’IA.',
      'A més, em preparo per a la certificació GitLab Certified CI/CD Associate.',
    ],
  },
  ui: { print: 'Imprimir / desar en PDF', back: 'Tornar a la web', photoAlt: 'Daniel Oliva', langs: 'Idioma del currículum' },
};

const en: CvCopy = {
  title: 'Résumé',
  description: 'Résumé of Daniel Oliva Gómez, fullstack and CI/CD software engineer.',
  role: 'Software engineer · Fullstack & CI/CD',
  about: {
    title: 'About me',
    text: 'Fullstack software engineer (Angular, NestJS) focused on CI/CD and GitLab pipeline automation. Currently at Zennio, combining end-to-end product development with CI/CD and automation for the team.',
  },
  contact: { title: 'Contact', email: 'Email', linkedin: 'LinkedIn', github: 'GitHub' },
  skills: {
    title: 'Technical skills',
    groups: [
      { title: 'Development', items: ['Angular, TypeScript, NestJS, PrimeNG, PostgreSQL', 'VueJS, React, React Native', 'PHP / Laravel'] },
      { title: 'CI/CD · DevOps', items: ['GitLab CI/CD (pipeline design and automation)', 'Docker'] },
    ],
  },
  soft: {
    title: 'Soft skills',
    items: [
      'Strong interpersonal communication',
      'Problem solving',
      'Initiative, planning, organisation',
      'Always curious about new tech and trends',
      'Analytical thinking',
    ],
  },
  languages: {
    title: 'Languages',
    items: [
      { name: 'Spanish', level: 'Native' },
      { name: 'English', level: 'Advanced (B2 - C1)' },
      { name: 'French', level: 'Intermediate' },
      { name: 'Catalan', level: 'Advanced' },
    ],
  },
  experience: {
    title: 'Work experience',
    jobs: [
      {
        role: 'Fullstack engineer',
        company: 'Zennio',
        place: 'Toledo (remote from Barcelona)',
        period: 'January 2024 – present',
        bullets: [
          'Frontend ownership of the product (Angular, PrimeNG) and full-stack work (NestJS). Angular upgrades from 13 to 22.',
          'Team quality standards: linting, formatting, pre-commit hooks and SonarQube scans.',
          'Automated CHANGELOG.md: custom VS Code plugin that creates branches from develop knowing which PBIs they cover, and CI that fills in the entries on merge.',
          'CI/CD on GitLab: code-review bots on merge requests, a daily-pipeline bot (proposes fixes and opens its MR) and auto-deploy; SBOM, SCA, DAST and SAST evidence on every tag.',
          'AI in the team’s day-to-day work: skills, MCPs and integration into the development workflow.',
        ],
      },
      {
        role: 'Associate consultant',
        company: 'Vanadys',
        place: 'Barcelona',
        period: 'July 2021 – January 2024',
        bullets: [
          'Developing solutions for a bank’s Output using Avaloq.',
          'Client communication and gathering of functional requirements.',
          'Managing and editing Assentis templates to create dynamic documents according to client preferences.',
        ],
      },
    ],
  },
  education: {
    title: 'Education',
    items: [
      { school: 'Universitat Oberta de Catalunya', period: 'September 2019 – January 2024', lines: ['Degree in Computer Engineering', 'Specialisation in Software Engineering', 'Grade average: 9.36'] },
      { school: 'IT Academy, Barcelona', period: 'January 2021 – July 2021', lines: ['Fullstack Bootcamp with PHP and Laravel', 'Plus Tailwind and VueJS'] },
    ],
  },
  additional: {
    title: 'Additional information',
    paragraphs: [
      'Final-year project: a cross-platform mobile app (iOS, Android, web) built with React Native and Expo.',
      'Storia (since March 2026): an AI app that generates children’s stories, with narrative concept selection, custom characters and image generation. A personal project used as a testbed for new AI tools and trends.',
      'I am also preparing for the GitLab Certified CI/CD Associate certification.',
    ],
  },
  ui: { print: 'Print / save as PDF', back: 'Back to the site', photoAlt: 'Daniel Oliva', langs: 'Résumé language' },
};

export const cv: Record<Lang, CvCopy> = { es, ca, en };
