/**
 * Avatar animado. Se compone en un canvas a partir de la escena (todo menos la cabeza), la cabeza y
 * piezas que cambian una sola zona (ojos, boca, birrete, manos, saludo, vapor). Todo sale de
 * scripts/build-avatar.py, que deja en /avatar/avatar.json el tamaño y la posición de cada pieza.
 *
 * Cada estado (uno por sección) dice qué piezas se ven en cada fotograma y dónde va la cabeza.
 * El tamaño y el sitio (grande en la portada, pequeño en la esquina) los pone el CSS.
 */

const TICK_MS = 110;

/** Piezas de los gestos del juego: se cargan después de las de las poses de cada sección (ver `startAvatar`). */
const LATER = [
  'ojos-felices', 'boca-ahh', 'ojos-somnolientos', 'ojos-bostezo', 'boca-bostezo', 'mano-boca',
  'taza-sube', 'taza-cerca', 'taza-boca', 'regadera', 'planta-feliz',
];

type PieceMeta = { x: number; y: number; head: boolean; erase?: { x: number; y: number } };
type Meta = { size: number; pieces: Record<string, PieceMeta> };
/** Un rectángulo suelto (x, y, ancho, alto, color) en coordenadas del lienzo: gotas, «z»… */
type Rect = [number, number, number, number, string];
type Pose = { pieces: string[]; head: [number, number]; rects?: Rect[]; /** Opacidad de las piezas que no van al 100 % (fundidos y estelas). */ alpha?: Record<string, number> };

export type AvatarState = 'hero' | 'projects' | 'experience' | 'studies' | 'contact' | 'hogarnizer';

/** Vapor del café: tres formas que se van turnando. */
const steam = (t: number) => [[], ['vapor-2'], ['vapor-3']][Math.floor(t / 4) % 3];
/** Tecleo: las manos alternan cada `every` fotogramas. */
const typing = (t: number, every: number) => (Math.floor(t / every) % 2 ? ['manos'] : []);
/** Mirada al teclear: a la pantalla del portátil (o parpadeando). */
const onScreen = (blink: boolean) => [blink ? 'ojos-cerrados' : 'ojos-pantalla'];
/** Saludo: la mano en alto alterna dos fotogramas, así se agita. */
const wave = (t: number) => [Math.floor(t / 3) % 2 ? 'saludo' : 'saludo-2'];

const PX = 8; // un píxel de la ilustración, en píxeles del lienzo
/** Una «z» de píxeles (5×5) con su contorno; (x, y) es la esquina de arriba a la izquierda. */
const zeta = (x: number, y: number, size = 1): Rect[] => {
  const cells = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [3, 1], [2, 2], [1, 3], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4]];
  const u = PX * size;
  return [
    ...cells.map(([cx, cy]) => [x + cx * u + 3, y + cy * u + 3, u, u, 'rgba(30,30,70,0.55)'] as Rect),
    ...cells.map(([cx, cy]) => [x + cx * u, y + cy * u, u, u, '#cdd4ff'] as Rect),
  ];
};
/** Las «z» del sueño: suben una detrás de otra desde la cabeza (a su derecha, para no tapar el pelo). */
const sleepZ = (k: number): Rect[] => {
  const out: Rect[] = [];
  for (let i = 0; i < 3; i++) {
    const age = (k + i * 14) % 42;
    if (age > 34) continue;
    out.push(...zeta(760 + i * 34 + Math.round(Math.sin(age / 5) * 6), 250 - age * 3 - i * 8, [1.4, 1.8, 2.2][i]));
  }
  return out;
};
/** Gotas de la regadera (cada una de 2×2 píxeles de la ilustración): caen en vertical hasta la planta y salpican. */
const waterDrops = (k: number): Rect[] => {
  const out: Rect[] = [];
  const top = 684;
  const floor = 716; // donde empieza la planta
  for (const [i, x] of [632, 654, 676].entries()) {
    const y = top + ((k * 2 + i * 3) % 5) * 8;
    const ys = Math.min(y, floor);
    out.push([x, ys, 16, 16, '#3c8fe0'], [x + 2, ys + 2, 12, 12, '#7ac7ff'], [x + 3, ys + 3, 4, 4, '#e6f6ff']);
    if (y >= floor) out.push([x - 12, floor + 14, 10, 6, '#7ac7ff'], [x + 18, floor + 14, 10, 6, '#7ac7ff']);
  }
  return out;
};
/** Las gafas de sol, en coordenadas del lienzo con la cabeza en su sitio (se desplazan con ella). */
const SHADES: Rect[] = [
  [496, 296, 144, 8, '#0d0f14'], // montura de arriba
  [496, 304, 56, 32, '#0d0f14'], // cristal izquierdo
  [576, 304, 56, 32, '#0d0f14'],
  [552, 304, 24, 8, '#0d0f14'], // puente
  [632, 304, 64, 8, '#0d0f14'], // patilla hacia la oreja
  [504, 312, 16, 8, '#4a5568'], // reflejos
  [584, 312, 16, 8, '#4a5568'],
  [520, 320, 8, 8, '#2b3240'],
  [600, 320, 8, 8, '#2b3240'],
];
/** La cabeza sube y baja `px` píxeles con un periodo de `period` fotogramas. */
const bob = (t: number, period: number, px = 3): [number, number] => [
  0,
  t % period < period / 2 ? 0 : px,
];

/**
 * Qué se ve en el fotograma `t` de cada estado. `since` es el fotograma en que se entró en el
 * estado (para gestos que solo pasan al llegar, como el saludo) y `blink` si toca parpadear.
 */
const STATES: Record<AvatarState, (t: number, since: number, blink: boolean) => Pose> = {
  // Portada: saluda al llegar; luego sonríe, teclea a ratos y echa miradas de reojo (al visitante).
  hero: (t, since, blink) => {
    const waving = t - since < 16;
    const eyes = blink ? ['ojos-cerrados'] : t % 70 >= 50 ? ['ojos-reojo'] : [];
    const hands = waving ? wave(t) : typing(t, 3);
    return { pieces: [...steam(t), ...hands, ...eyes], head: bob(t, 18) };
  },
  // Proyectos: tecleando a ritmo normal.
  projects: (t, _s, blink) => ({
    pieces: [...steam(t), ...typing(t, 2), ...onScreen(blink)],
    head: bob(t, 8),
  }),
  // Experiencia: concentrado y acercándose a la pantalla a ratos.
  experience: (t, _s, blink) => {
    const lean = t % 60 >= 30;
    return {
      pieces: [
        ...steam(t),
        ...typing(t, 1),
        'cejas-fruncidas',
        'boca-seria',
        ...onScreen(blink),
      ],
      head: lean ? [-14, 12 + (t % 4 < 2 ? 0 : 2)] : bob(t, 10),
    };
  },
  // Estudios: con el birrete y media sonrisa.
  studies: (t, _s, blink) => ({
    pieces: [
      ...steam(t),
      ...typing(t, 3),
      'boca-sonrisa-cerrada',
      'birrete',
      ...onScreen(blink),
    ],
    head: bob(t, 18),
  }),
  // Contacto: deja de teclear, saluda y mira de reojo a quien visita.
  contact: (t, since, blink) => {
    const waving = (t - since) % 60 < 16;
    return {
      pieces: [
        ...steam(t),
        ...(waving ? wave(t) : []),
        ...(blink ? ['ojos-cerrados'] : ['ojos-reojo']),
      ],
      head: bob(t, 18),
    };
  },
  // Hogarnizer: inclinado hacia la pantalla, tecleando rápido.
  hogarnizer: (t, _s, blink) => ({
    pieces: [...steam(t), ...typing(t, 1), 'cejas-fruncidas', ...onScreen(blink)],
    head: [-14, 12 + (t % 2) * 2],
  }),
};

/** Reacciones del juego: poses puntuales que sustituyen a la de la sección. `k` es el fotograma desde que empezó. */
const REACTIONS: Record<string, (k: number) => Pose> = {
  hola: (k) => ({
    pieces: [...steam(k), ...(k < 24 ? wave(k) : []), 'ojos-camara', 'boca-sonrisa-cerrada'],
    head: bob(k, 12),
  }),
  orden: (k) => ({
    pieces: [...steam(k), ...typing(k, 1), 'cejas-fruncidas', 'ojos-pantalla'],
    head: [-14, 12 + (k % 2) * 2],
  }),
  tiempo: (k) => ({
    pieces: [...steam(k), 'ojos-arriba', 'boca-sonrisa-cerrada'],
    head: k % 16 < 8 ? [0, 0] : [4, -2],
  }),
  trastero: (k) => {
    const left = Math.floor(k / 6) % 2 === 0;
    return { pieces: [...steam(k), left ? 'ojos-izq' : 'ojos-arriba-izq', 'boca-seria'], head: [left ? -6 : 0, 0] };
  },
  mareo: (k) => ({
    pieces: [k % 2 ? 'ojos-arriba-izq' : 'ojos-izq', 'boca-o'],
    head: [k % 2 ? -10 : 10, k % 4 < 2 ? 0 : 4],
  }),
  sueno: (k) => ({ pieces: ['ojos-cerrados', 'boca-seria'], head: [0, k % 40 < 20 ? 0 : 6], rects: sleepZ(k) }),
  final: (k) => ({
    pieces: [...steam(k), ...(k < 24 ? wave(k) : []), 'ojos-camara', 'boca-sonrisa-cerrada'],
    head: bob(k, 12),
  }),
  tema: (k) => ({
    pieces: [k % 10 < 5 ? 'ojos-arriba' : 'ojos-abajo', 'boca-o'],
    head: [k % 10 < 5 ? 4 : -4, 0],
  }),
  agitar: (k) => ({
    pieces: [k % 2 ? 'ojos-arriba-izq' : 'ojos-izq', 'boca-o', ...(k % 3 ? [] : ['cejas-fruncidas'])],
    head: [k % 2 ? -12 : 12, k % 3 === 0 ? 6 : 0],
  }),
  konami: (k) => ({
    pieces: [...steam(k), ...typing(k, 1), 'ojos-camara', 'boca-sonrisa-cerrada'],
    head: bob(k, 4, 5),
  }),
  // Pone el marco sobre la mesa: mira hacia abajo mientras cae, levanta la mano y sonríe.
  marco: (k) => ({
    pieces: [
      ...steam(k),
      ...(k < 8 ? wave(k) : []),
      k < 6 ? 'ojos-abajo' : 'ojos-camara',
      'boca-sonrisa-cerrada',
    ],
    head: bob(k, 12),
  }),
  poliglota: (k) => ({
    pieces: [...steam(k), ...(k < 24 ? wave(k) : []), 'ojos-camara', 'boca-sonrisa-cerrada'],
    head: bob(k, 10, 4),
  }),
  // Planta: riega (la regadera sobre ella y las gotas), la planta crece y le salen dos guindillas.
  planta: (k) => {
    if (k >= 26) return { pieces: [...steam(k), 'planta-feliz', 'ojos-felices', 'boca-sonrisa-cerrada'], head: bob(k, 10, 4) };
    return {
      pieces: [...steam(k), 'regadera', 'ojos-abajo', 'boca-sonrisa-cerrada'],
      head: [6, 4],
      rects: k >= 5 ? waterDrops(k) : [],
    };
  },
  // Café: la taza de la mesa se desvanece mientras aparece en su mano (pecho), sube con un fotograma de estela, da el
  // sorbo y vuelve a la mesa. Las posturas con la cara van con la cabeza fija.
  cafe: (k): Pose => {
    const still: [number, number] = [0, 0];
    if (k < 2) return { pieces: ['taza-sube', 'ojos-izq', 'boca-sonrisa-cerrada'], head: still, alpha: { 'taza-sube': k === 0 ? 0.4 : 0.8 } };
    if (k < 6) return { pieces: ['taza-sube', 'ojos-izq', 'boca-sonrisa-cerrada'], head: still };
    if (k === 6) return { pieces: ['taza-sube', 'taza-cerca'], head: still, alpha: { 'taza-sube': 0.55, 'taza-cerca': 0.55 } };
    if (k === 7) return { pieces: ['taza-cerca'], head: still };
    if (k < 10) return { pieces: ['taza-boca'], head: still };
    if (k < 20) return { pieces: k === 15 || k === 16 ? ['taza-cerca'] : ['taza-boca'], head: still }; // un trago: baja un poco la taza
    if (k === 20) return { pieces: ['taza-cerca'], head: still };
    if (k === 21) return { pieces: ['taza-sube', 'taza-cerca'], head: still, alpha: { 'taza-sube': 0.55, 'taza-cerca': 0.55 } };
    if (k < 24) return { pieces: ['taza-sube', 'ojos-felices', 'boca-ahh'], head: bob(k, 6, 3) };
    if (k < 31) return { pieces: ['taza-sube', 'ojos-felices', 'boca-ahh'], head: bob(k, 6, 3) };
    if (k < 33) return { pieces: ['taza-sube', 'ojos-felices', 'boca-ahh'], head: bob(k, 6, 3), alpha: { 'taza-sube': k === 31 ? 0.6 : 0.25 } };
    return { pieces: [...steam(k), 'ojos-felices', 'boca-sonrisa-cerrada'], head: bob(k, 8, 3) };
  },
  portatil: (k) => ({ pieces: [...steam(k), ...typing(k, 1), 'cejas-fruncidas', 'ojos-pantalla'], head: [-14, 12 + (k % 2) * 2] }),
  // Noctámbulo: ojos de sueño, bostezo con la mano delante de la boca y las «z».
  noctambulo: (k) => {
    if (k < 9) return { pieces: [...steam(k), 'ojos-somnolientos', 'boca-seria'], head: [0, 6 + (k % 6 < 3 ? 0 : 2)] };
    if (k < 17) return { pieces: ['ojos-bostezo', 'boca-bostezo'], head: [0, -4], rects: k > 12 ? sleepZ(k) : [] };
    if (k < 31) return { pieces: ['mano-boca'], head: [0, 0], rects: sleepZ(k) };
    return { pieces: [...steam(k), 'ojos-somnolientos', 'boca-seria'], head: [0, 6], rects: sleepZ(k) };
  },
  cuento: (k) => ({
    pieces: [...steam(k), ...(Math.floor(k / 5) % 3 === 0 ? wave(k) : []), k % 20 < 10 ? 'ojos-arriba' : 'ojos-camara', 'boca-sonrisa-cerrada'],
    head: bob(k, 12, 4),
  }),
  terminal: (k) => ({ pieces: [...steam(k), ...typing(k, 1), 'cejas-fruncidas', 'boca-seria', 'ojos-pantalla'], head: [-14, 12 + (k % 2) * 2] }),
  curioso: (k) => ({
    pieces: [...steam(k), ...(k < 24 ? wave(k) : []), 'ojos-camara', 'boca-sonrisa-cerrada'],
    head: bob(k, 12),
  }),
  asiente: (k) => ({ pieces: [...steam(k), 'ojos-camara', 'boca-sonrisa-cerrada'], head: bob(k, 6, 4) }),
};

// Los logros nuevos reutilizan gestos que ya existen; los que piden uno propio van debajo.
REACTIONS.papel = REACTIONS.konami;
REACTIONS.mundo = REACTIONS.konami;
for (const id of ['buzon', 'explorador', 'habitual', 'charla', 'tab', 'completista']) REACTIONS[id] = REACTIONS.hola;
REACTIONS.lector = REACTIONS.trastero;
REACTIONS.rebote = REACTIONS.mareo;
REACTIONS.responsive = REACTIONS.agitar;
REACTIONS.pegar = REACTIONS.terminal;
REACTIONS.codigo = REACTIONS.terminal;
REACTIONS.lunes = REACTIONS.noctambulo;
REACTIONS.comida = REACTIONS.tiempo;
// Detective: mira de reojo, con el ceño fruncido.
REACTIONS.detective = (k) => ({
  pieces: [...steam(k), k % 16 < 8 ? 'ojos-izq' : 'ojos-arriba-izq', 'cejas-fruncidas', 'boca-seria'],
  head: [k % 16 < 8 ? -8 : -4, 0],
});
// Zoom: se acerca a la pantalla.
REACTIONS.zoom = (k) => ({ pieces: [...steam(k), 'ojos-pantalla', 'cejas-fruncidas', 'boca-o'], head: [0, 12 + (k % 2) * 2] });
// Viernes: niega con la cabeza.
REACTIONS.viernes = (k) => ({ pieces: [...steam(k), 'ojos-camara', 'boca-seria'], head: [k % 10 < 5 ? -8 : 8, 0] });

/** El bostezo de antes de dormirse: el del noctámbulo, sin las «z». */
REACTIONS.bostezo = (k) => ({ ...REACTIONS.noctambulo(k), rects: undefined });

/**
 * Miradas disponibles y hacia dónde apuntan (x: izquierda -1 / derecha 1; y: arriba -1 / abajo 1,
 * vistas desde la pantalla de quien visita). Solo se usan las que existan en avatar.json.
 */
const GAZES: Record<string, [number, number]> = {
  'ojos-arriba-izq': [-1, -1],
  'ojos-arriba': [0, -1],
  'ojos-arriba-der': [1, -1],
  'ojos-izq': [-1, 0],
  'ojos-der': [1, 0],
  'ojos-camara': [1, 0.2], // a quien visita: con la cabeza girada, es mirar hacia la derecha
  'ojos-abajo': [0, 1],
  'ojos-pantalla': [-1, 1], // abajo y a la izquierda
};
const FOLLOW_MS = 4000; // sin mover el cursor este tiempo, vuelve a lo suyo
const DEAD_ZONE = 0.16; // cursor casi encima: mira de frente

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    // `decode()` descodifica la imagen fuera del hilo principal (si no, el primer `drawImage` lo bloquea).
    img.onload = () => (img.decode ? img.decode().then(() => resolve(img), () => resolve(img)) : resolve(img));
    img.onerror = reject;
    img.src = src;
  });
}

export type AvatarApi = {
  /** Pone una reacción (`REACTIONS`) con un mensaje; `ms` es lo que dura (0: hasta `stop()`). */
  react: (key: string, text: string, ms?: number) => void;
  stop: () => void;
  say: (text: string, ms?: number) => void;
  /** Pone el marco del proyecto sobre el escritorio (cae y se posa); `quitarMarco` lo retira. */
  placeFrame: () => void;
  removeFrame: () => void;
  /** La planta regada se queda crecida (con sus guindillas). */
  setGrown: (grown: boolean) => void;
  /** Las gafas de sol (el premio de completar todos los logros): se ven en todas las poses. */
  setSkin: (on: boolean) => void;
};

/**
 * El marco de fotos de mesa (public/avatar/marcos/<proyecto>.png, a escala de píxel de arte) se dibuja ×8 sobre
 * el escritorio, a la derecha de la maceta: tiene la misma granularidad que la ilustración. Cae con la gravedad
 * y se posa con un pequeño rebote (desplazamientos en píxeles de arte por fotograma).
 */
const FRAME = { x: 724, base: 846, scale: 8 };
const FRAME_FALL = [-9, -5, -2, 0, -1, 0];

export async function startAvatar(
  canvas: HTMLCanvasElement,
  bubble: HTMLElement,
  frameName?: string,
): Promise<AvatarApi | null> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const root = canvas.closest('.avatar') as HTMLElement | null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const meta: Meta = await (await fetch('/avatar/avatar.json')).json();
  // Al arrancar solo se cargan la escena, la cabeza y las piezas de las poses de cada sección; las de los gestos del
  // juego (taza, regadera, bostezo…, que son las más pesadas) se piden después, una a una, cuando el navegador está libre.
  const names = Object.keys(meta.pieces);
  const later = new Set(LATER);
  const now = names.filter((n) => !later.has(n));
  const [scene, head, ...images] = await Promise.all([
    load('/avatar/escena.webp'),
    load('/avatar/cabeza.webp'),
    ...now.map((n) => load(`/avatar/piezas/${n}.webp`)),
  ]);
  const piece: Record<string, HTMLImageElement> = Object.fromEntries(now.map((n, i) => [n, images[i]]));
  // Máscaras de borrado: las piezas solo añaden píxeles; las que se llevan algo de la escena (la taza) traen su máscara.
  const erasers: Record<string, HTMLImageElement> = {};
  const frameImg = frameName ? await load(`/avatar/marcos/${frameName}.png`).catch(() => null) : null;
  let frameFrom = -1; // fotograma en que se puso el marco (-1: sin marco)
  canvas.width = meta.size;
  canvas.height = meta.size;
  const idleWait = () =>
    new Promise<void>((resolve) => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 3000 }) : setTimeout(resolve, 200)));
  const loadLater = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2500)); // primero lo que ve quien llega
    for (const n of names.filter((x) => later.has(x))) {
      await idleWait();
      try {
        piece[n] = await load(`/avatar/piezas/${n}.webp`);
        if (meta.pieces[n].erase) erasers[n] = await load(`/avatar/piezas/${n}.borra.webp`);
      } catch {}
    }
    draw(tick); // por si la pose actual lleva una pieza que acaba de llegar (la planta crecida)
  };

  // Cursor: normalizado respecto a la cabeza (de -1 a 1) mientras se mueve.
  const gazes = Object.entries(GAZES).filter(([n]) => n in meta.pieces);
  const cursor = { x: 0, y: 0, at: -Infinity };
  addEventListener(
    'pointermove',
    (e) => {
      const r = canvas.getBoundingClientRect();
      const hx = r.left + r.width * 0.59; // la cabeza, dentro del lienzo
      const hy = r.top + r.height * 0.3;
      cursor.x = Math.max(-1, Math.min(1, (e.clientX - hx) / (innerWidth * 0.4)));
      cursor.y = Math.max(-1, Math.min(1, (e.clientY - hy) / (innerHeight * 0.4)));
      cursor.at = performance.now();
    },
    { passive: true },
  );

  let state: AvatarState = 'hero';
  let since = 0;
  let tick = 0;
  let blinkUntil = -1;
  let nextBlink = 25;
  let reaction: { key: string; start: number; end: number } | null = null;
  let skin = false; // lleva las gafas de sol puestas
  let grown = false; // la planta ya está regada y se queda crecida

  function draw(t: number) {
    if (reaction && reaction.end && performance.now() > reaction.end) {
      if (reaction.key === 'planta') grown = true; // al acabar de regar, la planta se queda crecida
      reaction = null;
    }
    const k = reaction ? (reduced ? 0 : t - reaction.start) : 0;
    const pose = reaction
      ? REACTIONS[reaction.key](k)
      : reduced
        ? STATES[state](0, -100, false)
        : STATES[state](t, since, t <= blinkUntil);
    let on = pose.pieces.filter((p) => piece[p]); // las que aún no han llegado se saltan
    let [hx, hy] = pose.head;
    // Si el cursor se ha movido hace poco, la cabeza se vuelve un poco hacia él y los ojos lo miran.
    if (!reduced && !reaction && performance.now() - cursor.at < FOLLOW_MS) {
      hx += Math.round(cursor.x * 8);
      hy += Math.round(cursor.y * 5);
      const len = Math.hypot(cursor.x, cursor.y);
      const eyesShut = on.includes('ojos-cerrados');
      on = on.filter((p) => !(p in GAZES) && p !== 'ojos-reojo');
      // Con el cursor justo encima, te mira a ti (a cámara).
      if (!eyesShut && len <= DEAD_ZONE && 'ojos-camara' in meta.pieces) on = [...on, 'ojos-camara'];
      if (!eyesShut && len > DEAD_ZONE && gazes.length) {
        let best = gazes[0][0];
        let bestDot = -Infinity;
        for (const [name, [gx, gy]] of gazes) {
          const dot = (cursor.x * gx + cursor.y * gy) / (Math.hypot(gx, gy) * len);
          if (dot > bestDot) [best, bestDot] = [name, dot];
        }
        on = [...on, best];
      }
    }
    // Planta crecida: por delante de las manos del teclado (están detrás de ella), pero por detrás de la regadera.
    if (grown && !on.includes('planta-feliz') && 'planta-feliz' in meta.pieces) {
      on = on.includes('regadera') ? ['planta-feliz', ...on] : [...on, 'planta-feliz'];
    }
    on = on.filter((p) => piece[p]); // (la planta crecida se añade arriba: puede no haber llegado aún)
    const c = ctx!;
    c.clearRect(0, 0, meta.size, meta.size);
    c.drawImage(scene, 0, 0);
    for (const p of on) {
      const e = meta.pieces[p].erase;
      if (!e || !erasers[p]) continue;
      c.globalCompositeOperation = 'destination-out';
      c.globalAlpha = pose.alpha?.[p] ?? 1;
      c.drawImage(erasers[p], e.x, e.y);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }
    if (frameImg && frameFrom >= 0) {
      const k = reduced ? FRAME_FALL.length : Math.max(0, t - frameFrom);
      const off = (FRAME_FALL[Math.min(k, FRAME_FALL.length - 1)] ?? 0) * FRAME.scale;
      const w = frameImg.width * FRAME.scale;
      const h = frameImg.height * FRAME.scale;
      const y = FRAME.base - h + 6 + off;
      c.fillStyle = 'rgba(0, 0, 0, 0.26)'; // sombra sobre la mesa
      c.fillRect(FRAME.x + 8, FRAME.base - 10, w - 24, 12);
      c.imageSmoothingEnabled = false;
      c.drawImage(frameImg, FRAME.x, y, w, h);
      c.imageSmoothingEnabled = true;
    }
    // Primero lo que va fuera de la cabeza (manos, vapor…), luego la cabeza y sus piezas.
    const draw1 = (p: string, dx: number, dy: number) => {
      c.globalAlpha = pose.alpha?.[p] ?? 1;
      c.drawImage(piece[p], meta.pieces[p].x + dx, meta.pieces[p].y + dy);
      c.globalAlpha = 1;
    };
    for (const p of on) if (!meta.pieces[p].head) draw1(p, 0, 0);
    c.drawImage(head, hx, hy);
    for (const p of on) {
      const m = meta.pieces[p];
      if (m.head) draw1(p, hx, hy);
    }
    // Gafas de sol: píxeles de la ilustración (8 px) pegados a la cabeza.
    if (skin) {
      for (const [x, y, w, h, color] of SHADES) {
        c.fillStyle = color;
        c.fillRect(x + hx, y + hy, w, h);
      }
    }
    // Lo dibujado a mano (gotas, «z»…): rectángulos del tamaño de un píxel de la ilustración.
    if (pose.rects) {
      for (const [x, y, w, h, color] of pose.rects) {
        c.fillStyle = color;
        c.fillRect(x, y, w, h);
      }
    }
  }

  let hideTimer: number | undefined;
  function say(text: string, ms = 4200) {
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => bubble.classList.remove('show'), ms);
  }

  function setState(next: AvatarState) {
    if (next === state && tick > 0) return;
    state = next;
    since = tick;
    root?.setAttribute('data-state', next);
    draw(tick);
  }

  // Manda la sección que cruza la línea del medio de la pantalla; al final de la página, la última
  // (puede que nunca llegue al medio).
  const sections = document.querySelectorAll('[data-avatar]');
  const last = sections[sections.length - 1]?.getAttribute('data-avatar') as AvatarState | undefined;
  let middle: AvatarState = state;
  const update = () => {
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    setState(atBottom && last ? last : middle);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) middle = e.target.getAttribute('data-avatar') as AvatarState;
      }
      update();
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((el) => io.observe(el));
  addEventListener('scroll', update, { passive: true });

  const api: AvatarApi = {
    say,
    react(key, text, ms = 3200) {
      reaction = { key, start: tick, end: ms ? performance.now() + ms : 0 };
      if (text) say(text, ms || 600000);
      draw(tick);
      if (reduced && ms) setTimeout(() => draw(tick), ms + 30);
    },
    stop() {
      reaction = null;
      bubble.classList.remove('show');
      draw(tick);
    },
    placeFrame() {
      frameFrom = tick;
      draw(tick);
    },
    removeFrame() {
      frameFrom = -1;
      draw(tick);
    },
    setSkin(on: boolean) {
      skin = on;
      draw(tick);
    },
    setGrown(v: boolean) {
      grown = v;
      draw(tick);
    },
  };

  draw(0);
  root?.classList.add('ready');
  void loadLater();
  if (reduced) return api;
  setInterval(() => {
    if (document.hidden) return; // pestaña oculta: nada que dibujar
    tick++;
    if (tick >= nextBlink) {
      blinkUntil = tick + 1;
      nextBlink = tick + 30 + Math.floor(Math.random() * 35);
    }
    draw(tick);
  }, TICK_MS);
  return api;
}
