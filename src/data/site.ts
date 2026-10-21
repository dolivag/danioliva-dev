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
  /** Título de la sección de enlaces (por defecto «Enlaces»). */
  linksTitle?: string;
  /** Fragmento de código para empezar, con su título. */
  code?: { title: string; text: string };
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
    stack: 'Three.js · Vite · TypeScript',
    href: 'https://qr-city.danioliva.dev',
    openLabel: 'Abrir la demo',
    tags: ['Three.js', 'TypeScript', 'Vite', 'Web Component', 'Angular', 'React', 'Vue', 'npm', 'Isométrico', 'Código QR'],
    lead: 'Una ciudad en 3D isométrico cuyos tejados forman un código QR que se puede escanear desde arriba: cada módulo oscuro es un edificio y los claros son calles. Es una demo y, además, una librería con paquetes npm para integrarla en Angular, React y Vue.',
    facts: [
      { title: 'Un QR que se lee', text: 'Los tejados son planos y oscuros sobre suelo claro, con zona de silencio alrededor, para que cualquier lector lo escanee desde arriba. Tests automáticos lo decodifican con jsQR en cada estilo.' },
      { title: 'Cinco estilos', text: 'Papel, moderna, costera, nevada y cyberpunk, con ajuste del momento del día.' },
      { title: 'Todo configurable', text: 'Un laboratorio con todos los ajustes en vivo y, al lado, el código que reproduce lo que ves. El enlace guarda tu configuración.' },
      { title: 'Exportable', text: 'Comprueba que el QR se lee, lo revela, y descarga la ciudad en PNG o el QR para imprimir en SVG y PNG.' },
      { title: 'Para cualquier framework', text: 'Un núcleo sin framework, un Web Component y componentes para React, Vue y Angular. Seguro con SSR y con el tamaño de cada paquete vigilado en la integración continua.' },
      { title: 'Cuidada', text: 'En español e inglés, con tema claro, oscuro o automático. El lienzo se maneja con teclado y la animación respeta «reducir movimiento».' },
    ],
    code: {
      title: 'Empezar',
      text: "npm i @qr-city/element three\n\nimport '@qr-city/element/define';\n\n<qr-city data=\"https://tu-web.dev\" style=\"width: 480px; height: 480px\"></qr-city>",
    },
    links: [
      { label: 'Código en GitHub', href: 'https://github.com/dolivag/qr-city' },
      { label: '@qr-city/core', href: 'https://www.npmjs.com/package/@qr-city/core' },
      { label: '@qr-city/element (Web Component)', href: 'https://www.npmjs.com/package/@qr-city/element' },
      { label: '@qr-city/react', href: 'https://www.npmjs.com/package/@qr-city/react' },
      { label: '@qr-city/vue', href: 'https://www.npmjs.com/package/@qr-city/vue' },
      { label: '@qr-city/angular', href: 'https://www.npmjs.com/package/@qr-city/angular' },
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
    tags: ['En construcción', 'Expo', 'React Native', 'TypeScript', 'Supabase', 'Postgres', 'Tareas', 'Compra', 'Gastos', 'Notas', 'IA'],
    lead: 'La app para organizar un hogar compartido: las tareas se reparten solas por esfuerzo, la compra se hace entre todos, los gastos se reparten y quedan claros los saldos. Nació como mi Trabajo Final de Grado (UOC, 2023) y la he reescrito desde cero; ahora la preparo para las tiendas.',
    facts: [
      { title: 'Tareas que se reparten solas', text: 'Cada lunes las diarias y semanales se reparten por puntos de esfuerzo (las diarias cuentan siete veces) a quien menos lleva. Los puntos son para quien hace la tarea y hay ranking.' },
      { title: 'Compra en equipo', text: 'Una lista compartida en tiempo real, agrupada por categoría, con productos básicos y puntuales y tiendas en el mapa. Al terminar la compra, un toque la apunta como gasto.' },
      { title: 'Gastos y saldos', text: 'Reparto a partes iguales, varios pagadores y gastos fijos que se repiten solos (alquiler, luz, internet…). Los saldos dicen quién debe a quién y se saldan con un botón.' },
      { title: 'Notas y avisos', text: 'Un tablón en tiempo real con una nota fijada y avisos push que eliges: compra, gastos, notas nuevas y un recordatorio de tareas a las nueve.' },
      { title: 'Asistente con IA', text: 'Haz una foto a un ticket o a una factura y se convierte en gasto, o escribe en lenguaje normal («he pagado 45 de la luz, a medias con Bea») y te enseña lo que ha entendido. Solo apunta lo que dejas marcado.' },
      { title: 'Un hogar, varias personas', text: 'Se entra con un código o un enlace de invitación y el propietario acepta la solicitud. Cada hogar usa su zona horaria y cada persona, su idioma: español, inglés o catalán, con tema claro u oscuro.' },
      { title: 'Seguridad desde el diseño', text: 'Toda tabla tiene reglas de acceso (RLS) y la lógica crítica (rotación, puntos, saldos) vive en funciones de la base de datos, con pruebas automáticas. Hay copia de seguridad semanal, descarga de tus datos y borrado de la cuenta.' },
    ],
    linksTitle: 'Legal',
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
    stack: 'Next.js · React · Tailwind',
    href: 'https://duometeo.danioliva.dev/',
    openLabel: 'Abrir la web',
    tags: ['Next.js', 'React', 'Tailwind', 'Open-Meteo', 'Tiempo real', 'Pronóstico', 'Histórico', 'Comparador'],
    lead: 'Compara al instante el tiempo de cualquier pareja de ciudades del mundo: temperatura, humedad y cielo ahora mismo, el pronóstico de la semana y su clima histórico desde 1940.',
    facts: [
      { title: 'Frente a frente', text: 'Temperatura, sensación, humedad, viento, precipitación, índice UV y amanecer y atardecer de cada ciudad, con las diferencias entre ambas y la distancia en línea recta.' },
      { title: 'Próximos días', text: 'Máxima, mínima y probabilidad de lluvia de los siguientes siete días, día a día y lado a lado.' },
      { title: 'Hora a hora', text: 'Gráficas de temperatura, lluvia, viento, humedad, UV y calidad del aire (índice europeo), a la misma hora o en la hora local de cada ciudad.' },
      { title: 'Clima histórico', text: 'Medias mensuales y anuales desde 1940, a partir del reanálisis ERA5.' },
      { title: 'Globo interactivo', text: 'Sitúa las dos ciudades y hace zoom en las cercanas.' },
      { title: 'Cómodo de usar', text: 'Tu ubicación como primera ciudad, °C o °F, tema claro u oscuro, español e inglés, comparaciones recientes y enlaces para compartir con su propia imagen de vista previa. Se instala como app en el móvil.' },
      { title: 'Sin rastro', text: 'Sin cuentas ni seguimiento: una cookie recuerda el idioma y las visitas se cuentan de forma anónima. Tu ubicación solo se usa si la pides, redondeada a unos 100 m.' },
    ],
    links: [
      { label: 'Datos de Open-Meteo', href: 'https://open-meteo.com' },
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
    description: 'Saber dónde guardas cada cosa en casa y encontrarla en segundos, con fotos y búsqueda.',
    stack: 'Expo · React Native · Supabase',
    href: '',
    openLabel: '',
    tags: ['En construcción', 'Expo', 'React Native', 'Supabase', 'Inventario', 'Fotos'],
    lead: 'Una app para saber dónde guardas cada cosa en casa y encontrarla en segundos, entre todos los de la casa. Todavía se está construyendo.',
    facts: [
      { title: 'Todo en su sitio', text: 'Ubicaciones dentro de ubicaciones —casa, habitación, mueble, caja— y objetos con foto.' },
      { title: 'Fácil de encontrar', text: 'Una búsqueda que te dice dónde está cada cosa, también con una foto.' },
      { title: 'Para toda la casa', text: 'Un hogar compartido: uno guarda y otro busca.' },
    ],
  },
];

export const experience: {
  company: string;
  role: string;
  period: string;
  description: string;
  /** Detalle del puesto, plegado bajo la descripción. */
  bullets?: string[];
}[] = [
  {
    company: 'Zennio',
    role: 'Fullstack engineer',
    period: 'Desde enero de 2024',
    description:
      'Desarrollo full-stack end-to-end de una plataforma de gestión de edificios: Angular + PrimeNG en frontend, NestJS + TypeScript y PostgreSQL/TimescaleDB en backend, dentro de un monorepo Nx. Responsable de arquitectura de features, calidad (Jest, Cypress, SonarQube) y CI/CD en GitLab.',
    bullets: [
      'Desarrollo end-to-end de funcionalidades: modelo de datos, API, UI y pruebas.',
      'Frontend con Angular y PrimeNG; backend con NestJS, TypeScript, Sequelize y PostgreSQL/TimescaleDB.',
      'Diseño y evolución del esquema de base de datos, incluidas migraciones y consultas de alto volumen.',
      'Optimización de rendimiento: diagnóstico y resolución de consultas lentas y cuellos de botella en API.',
      'Estrategia de pruebas: unitarias (Jest), integración y E2E con Cypress en pipelines de CI.',
      'CI/CD en GitLab, quality gates con SonarQube y automatización de releases.',
      'Monorepo Nx con pnpm: build, lint, test y documentación (Docusaurus) unificados.',
      'Estandarización técnica del equipo: convenciones, documentación y revisión de código.',
    ],
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
