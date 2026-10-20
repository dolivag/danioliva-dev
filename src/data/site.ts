export const site = {
  name: 'Daniel Oliva',
  role: 'Software engineer fullstack',
  email: 'hola@danioliva.dev',
  github: 'https://github.com/dolivag',
  appUrl: 'https://hogarnizer.danioliva.dev',
};

/** Palabras de la cinta bajo el nombre. */
export const marquee = [
  'Software engineer',
  'Fullstack',
  'Angular',
  'NestJS',
  'React Native',
  'Automatización',
  'CI/CD',
  'Apps pequeñas',
];

/** Captura de pantalla de un proyecto: `src` es una ruta de /public (se generan con scripts/optimize-shots.py). */
export type Shot = { src: string; alt: string };

export const projects: {
  name: string;
  status: string;
  description: string;
  stack: string;
  href: string;
  /** Hasta 3 capturas de iPhone, enmarcadas en la tarjeta. Sin capturas, la tarjeta va solo con texto. */
  shots?: Shot[];
}[] = [
  {
    name: 'Hogarnizer',
    status: 'En construcción',
    description:
      'App para organizar un hogar compartido: tareas con puntos de esfuerzo, lista de la compra, gastos y notas.',
    stack: 'Expo · React Native · Supabase',
    href: '/apps/hogarnizer/',
    // shots: [{ src: '/projects/hogarnizer/1.webp', alt: 'Qué se ve en la captura' }],
  },
  {
    name: 'DuoMeteo',
    status: '',
    description: 'Compara el tiempo de dos ciudades, sus pronósticos y su histórico, de un vistazo.',
    stack: '',
    href: 'https://duometeo.vercel.app/',
  },
  {
    name: 'Trasteo',
    status: 'En construcción',
    description: 'Mantén tus cosas en orden y encuéntralas fácilmente.',
    stack: '',
    href: '',
  },
];

export const experience = [
  {
    company: 'Zennio',
    role: 'Fullstack engineer',
    period: 'Desde enero de 2024',
    description:
      'Desarrollo fullstack con Angular, Node.js, NestJS, React y React Native, además de herramientas de automatización y CI/CD.',
  },
  {
    company: 'Vanadys',
    role: 'Consultor asociado',
    period: 'Julio 2022 – enero 2024',
    description: 'Consultoría en proyectos con Avaloq.',
  },
];

export const studies = [
  {
    school: 'Universitat Oberta de Catalunya',
    title: 'Grado en Ingeniería Informática, especialidad en Ingeniería del Software (Graduado en 2024)',
  },
  {
    school: 'IT Academy',
    title: 'Bootcamp fullstack PHP con Laravel (2021)',
  },
];
