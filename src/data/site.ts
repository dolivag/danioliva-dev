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

export type Project = {
  /** Su página en el portfolio es /apps/<slug>/ (la de Hogarnizer no puede cambiar: está en las fichas de las tiendas). */
  slug: string;
  name: string;
  status: string;
  description: string;
  stack: string;
  /** Dirección pública del proyecto (se abre en una pestaña nueva, desde la tarjeta y desde su página). Vacía si aún no es pública. */
  href: string;
  /** Texto del botón de su página (p. ej. «Abrir la demo»). */
  openLabel: string;
  /** Palabras de la cinta de su página. */
  tags: string[];
  /** Introducción de su página. */
  lead: string;
  facts: { title: string; text: string }[];
  links?: { label: string; href: string }[];
  /** Hasta 3 capturas de iPhone, enmarcadas en la tarjeta y en su página. Sin capturas, solo texto. */
  shots?: Shot[];
  /** Captura de escritorio de la web, en una ventana de navegador (alternativa a `shots`). */
  web?: Shot;
};

export const projectUrl = (p: Pick<Project, 'slug'>) => `/apps/${p.slug}/`;

export const projects: Project[] = [
  {
    slug: 'qr-city',
    name: 'QR City',
    status: '',
    description:
      'Genera una ciudad en 3D isométrico cuyos tejados forman un código QR legible. Cinco estilos (papel, moderna, costera, nevada y cyberpunk), todo personalizable y paquetes npm para Angular, React y Vue.',
    stack: 'Three.js · Vite · npm',
    href: 'https://qr-city.danioliva.dev',
    openLabel: 'Abrir la demo',
    tags: ['Three.js', 'Vite', 'npm', 'Angular', 'React', 'Vue', 'Isométrico', 'Código QR'],
    lead: 'Una ciudad en 3D isométrico cuyos tejados forman un código QR que se puede escanear desde arriba. Es una demo y, además, una librería: hay paquetes npm para integrarla en Angular, React y Vue.',
    facts: [
      { title: 'Cinco estilos', text: 'Papel, moderna, costera, nevada y cyberpunk, con ajuste del momento del día.' },
      { title: 'Todo configurable', text: 'Un laboratorio con todos los ajustes en vivo y, al lado, el código que reproduce lo que ves. El enlace guarda tu configuración.' },
      { title: 'Siempre legible', text: 'Un botón comprueba que el QR se lee, otro lo revela, y se puede descargar la ciudad en PNG o el QR para imprimir en SVG y PNG.' },
      { title: 'Para integrar', text: 'Paquetes npm publicados para Angular, React y Vue. La demo está hecha con Vite y Three.js.' },
      { title: 'Cuidada', text: 'En español e inglés, con tema claro, oscuro o automático, y animación que respeta «reducir movimiento».' },
    ],
    shots: [
      { src: '/projects/qr-city/ciberpunk.webp', srcDark: '/projects/qr-city/ciberpunk-oscuro.webp', alt: 'QR City: ciudad cyberpunk con rascacielos violetas cuyos tejados forman el código QR' },
      { src: '/projects/qr-city/costera.webp', srcDark: '/projects/qr-city/costera-oscuro.webp', alt: 'QR City: ciudad costera en 3D isométrico rodeada de mar' },
      { src: '/projects/qr-city/laboratorio.webp', srcDark: '/projects/qr-city/laboratorio-oscuro.webp', alt: 'QR City: laboratorio con todos los ajustes configurables de la ciudad' },
    ],
  },
  {
    slug: 'hogarnizer',
    name: 'Hogarnizer',
    status: 'En construcción',
    description:
      'App para organizar un hogar compartido: tareas con puntos de esfuerzo, lista de la compra, gastos y notas.',
    stack: 'Expo · React Native · Supabase',
    href: site.appUrl,
    openLabel: 'Abrir la app web',
    tags: ['En construcción', 'Expo', 'React Native', 'Supabase', 'Tareas', 'Compra', 'Gastos', 'Notas'],
    lead: 'La app para organizar un hogar compartido: repartir las tareas de forma justa con puntos de esfuerzo, hacer la lista de la compra entre todos, llevar los gastos y compartir notas.',
    facts: [
      { title: 'Tareas', text: 'Rotación semanal y puntos según el esfuerzo de cada tarea.' },
      { title: 'Compra', text: 'Una lista compartida que se convierte en gasto al terminarla.' },
      { title: 'Gastos', text: 'Quién ha pagado qué y quién debe a quién.' },
      { title: 'Notas', text: 'Avisos y recordatorios para toda la casa.' },
    ],
    links: [
      { label: 'Política de privacidad', href: '/apps/hogarnizer/privacidad' },
      { label: 'Soporte', href: '/apps/hogarnizer/soporte' },
      { label: 'Cómo borrar tu cuenta', href: '/apps/hogarnizer/eliminar-cuenta' },
    ],
    shots: [
      { src: '/projects/hogarnizer/compra.webp', srcDark: '/projects/hogarnizer/compra-oscuro.webp', alt: 'Hogarnizer: lista de la compra con 14 productos agrupados por sección' },
      { src: '/projects/hogarnizer/tareas.webp', srcDark: '/projects/hogarnizer/tareas-oscuro.webp', alt: 'Hogarnizer: tareas pendientes y hechas con sus puntos de esfuerzo' },
      { src: '/projects/hogarnizer/gastos.webp', srcDark: '/projects/hogarnizer/gastos-oscuro.webp', alt: 'Hogarnizer: gastos del mes y saldo entre compañeros de piso' },
    ],
  },
  {
    slug: 'duometeo',
    name: 'DuoMeteo',
    status: '',
    description: 'Compara el tiempo de dos ciudades, sus pronósticos y su histórico, de un vistazo.',
    stack: '',
    href: 'https://duometeo.danioliva.dev/',
    openLabel: 'Abrir la web',
    tags: ['Tiempo real', 'Open-Meteo', 'Pronóstico', 'Histórico', 'Comparador'],
    lead: 'Compara al instante el tiempo de cualquier pareja de ciudades del mundo: temperatura, humedad y cielo ahora mismo, el pronóstico de la semana y su clima histórico.',
    facts: [
      { title: 'Frente a frente', text: 'Temperatura, sensación, humedad, viento, precipitación, índice UV y horas de sol de cada ciudad, con una frase que resume la diferencia y la distancia entre ambas.' },
      { title: 'Próximos días', text: 'Máxima, mínima y probabilidad de lluvia de los siguientes siete días, lado a lado.' },
      { title: 'Gráficas y globo', text: 'Gráfica por horas de temperatura, lluvia, viento, humedad, UV y calidad del aire, y un globo que sitúa las dos ciudades.' },
      { title: 'Clima histórico', text: 'Medias por meses y por años para ver cómo es cada sitio a lo largo del año.' },
      { title: 'Cómodo de usar', text: 'Ejemplos para empezar, ciudades recientes, enlace para compartir la comparación, °C o °F y español o inglés. Datos de Open-Meteo.' },
    ],
    web: {
      src: '/projects/duometeo/web.webp',
      srcDark: '/projects/duometeo/web-oscuro.webp',
      alt: 'DuoMeteo comparando el tiempo en Barcelona (17 °C) y Reikiavik (4 °C), con sus diferencias de temperatura, humedad y distancia',
    },
  },
  {
    slug: 'trasteo',
    name: 'Trasteo',
    status: 'En construcción',
    description: 'Mantén tus cosas en orden y encuéntralas fácilmente.',
    stack: '',
    href: '',
    openLabel: '',
    tags: ['En construcción', 'Proyecto personal'],
    lead: 'Mantén tus cosas en orden y encuéntralas fácilmente. Todavía se está construyendo: aquí irá su ficha cuando sea público.',
    facts: [],
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
