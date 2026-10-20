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
/** `srcDark` es la misma pantalla en modo oscuro: se enseña cuando la web está en oscuro. */
export type Shot = { src: string; srcDark?: string; alt: string };

export const projects: {
  name: string;
  status: string;
  description: string;
  stack: string;
  href: string;
  /** Hasta 3 capturas de iPhone, enmarcadas en la tarjeta. Sin capturas, la tarjeta va solo con texto. */
  shots?: Shot[];
  /** Captura de escritorio de la web, en una ventana de navegador (alternativa a `shots`). */
  web?: Shot;
}[] = [
  {
    name: 'QR City',
    status: '',
    description:
      'Genera una ciudad en 3D isométrico cuyos tejados forman un código QR legible. Cinco estilos (papel, moderna, costera, nevada y cyberpunk), todo personalizable y paquetes npm para Angular, React y Vue.',
    stack: 'Three.js · Vite · npm',
    href: 'https://qr-city.danioliva.dev',
    shots: [
      { src: '/projects/qr-city/ciberpunk.webp', srcDark: '/projects/qr-city/ciberpunk-oscuro.webp', alt: 'QR City: ciudad cyberpunk con rascacielos violetas cuyos tejados forman el código QR' },
      { src: '/projects/qr-city/costera.webp', srcDark: '/projects/qr-city/costera-oscuro.webp', alt: 'QR City: ciudad costera en 3D isométrico rodeada de mar' },
      { src: '/projects/qr-city/laboratorio.webp', srcDark: '/projects/qr-city/laboratorio-oscuro.webp', alt: 'QR City: laboratorio con todos los ajustes configurables de la ciudad' },
    ],
  },
  {
    name: 'Hogarnizer',
    status: 'En construcción',
    description:
      'App para organizar un hogar compartido: tareas con puntos de esfuerzo, lista de la compra, gastos y notas.',
    stack: 'Expo · React Native · Supabase',
    href: '/apps/hogarnizer/',
    shots: [
      { src: '/projects/hogarnizer/compra.webp', srcDark: '/projects/hogarnizer/compra-oscuro.webp', alt: 'Hogarnizer: lista de la compra con 14 productos agrupados por sección' },
      { src: '/projects/hogarnizer/tareas.webp', srcDark: '/projects/hogarnizer/tareas-oscuro.webp', alt: 'Hogarnizer: tareas pendientes y hechas con sus puntos de esfuerzo' },
      { src: '/projects/hogarnizer/gastos.webp', srcDark: '/projects/hogarnizer/gastos-oscuro.webp', alt: 'Hogarnizer: gastos del mes y saldo entre compañeros de piso' },
    ],
  },
  {
    name: 'DuoMeteo',
    status: '',
    description: 'Compara el tiempo de dos ciudades, sus pronósticos y su histórico, de un vistazo.',
    stack: '',
    href: 'https://duometeo.danioliva.dev/',
    // web: { src: '/projects/duometeo/web.webp', srcDark: '/projects/duometeo/web-oscuro.webp', alt: 'Qué se ve en la captura' },
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
