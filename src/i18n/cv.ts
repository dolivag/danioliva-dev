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
    text: 'Software Engineer fullstack (Angular, NestJS) con foco en CI/CD y automatización de pipelines en GitLab. Actualmente en Zennio, combinando desarrollo de producto end-to-end con el rol de referente CI/CD y automatizaciones del equipo.',
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
          'Desarrollo full-stack de aplicación web: frontend con Angular y PrimeNG y backend con NestJS.',
          'Referente del equipo en CI/CD: diseño de pipelines, automatización de releases y creación de bots.',
          'Impulsor de la adopción de IA en el equipo: creación de skills, configuración de MCPs e integración de herramientas de IA en el flujo de desarrollo.',
          'Colaboración en la estandarización de calidad de código a nivel transversal: adopción de merge requests, herramientas como Prettier, Linter o scans de SonarQube.',
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
    text: 'Software Engineer fullstack (Angular, NestJS) amb focus en CI/CD i automatització de pipelines a GitLab. Actualment a Zennio, combinant desenvolupament de producte end-to-end amb el rol de referent de CI/CD i automatitzacions de l’equip.',
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
          'Desenvolupament full-stack d’aplicació web: frontend amb Angular i PrimeNG i backend amb NestJS.',
          'Referent de l’equip en CI/CD: disseny de pipelines, automatització de releases i creació de bots.',
          'Impulsor de l’adopció d’IA a l’equip: creació de skills, configuració de MCPs i integració d’eines d’IA en el flux de desenvolupament.',
          'Col·laboració en l’estandardització de la qualitat del codi de manera transversal: adopció de merge requests, eines com Prettier, Linter o escaneigs de SonarQube.',
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
    text: 'Fullstack software engineer (Angular, NestJS) focused on CI/CD and GitLab pipeline automation. Currently at Zennio, combining end-to-end product development with the role of CI/CD and automation lead for the team.',
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
          'Full-stack development of a web application: frontend with Angular and PrimeNG and backend with NestJS.',
          'Team reference for CI/CD: pipeline design, release automation and bot creation.',
          'Driving AI adoption in the team: building skills, configuring MCPs and integrating AI tools into the development workflow.',
          'Helping standardise code quality across teams: adoption of merge requests, tools such as Prettier and linters, and SonarQube scans.',
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
