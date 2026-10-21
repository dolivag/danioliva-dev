/**
 * Avatar animado. Se compone en un canvas a partir de la escena (todo menos la cabeza), la cabeza y
 * piezas que cambian una sola zona (ojos, boca, birrete, manos, saludo, vapor). Todo sale de
 * scripts/build-avatar.py, que deja en /avatar/avatar.json el tamaño y la posición de cada pieza.
 *
 * Cada estado (uno por sección) dice qué piezas se ven en cada fotograma y dónde va la cabeza.
 * El tamaño y el sitio (grande en la portada, pequeño en la esquina) los pone el CSS.
 */

const TICK_MS = 110;

type PieceMeta = { x: number; y: number; head: boolean };
type Meta = { size: number; pieces: Record<string, PieceMeta> };
type Pose = { pieces: string[]; head: [number, number] };

export type AvatarState = 'hero' | 'projects' | 'experience' | 'studies' | 'contact' | 'hogarnizer';

/** Vapor del café: tres formas que se van turnando. */
const steam = (t: number) => [[], ['vapor-2'], ['vapor-3']][Math.floor(t / 4) % 3];
/** Tecleo: las manos alternan cada `every` fotogramas. */
const typing = (t: number, every: number) => (Math.floor(t / every) % 2 ? ['manos'] : []);
/** Mirada al teclear: a la pantalla del portátil (o parpadeando). */
const onScreen = (blink: boolean) => [blink ? 'ojos-cerrados' : 'ojos-pantalla'];
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
    const hands = waving ? (Math.floor(t / 3) % 2 ? ['saludo'] : []) : typing(t, 3);
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
        ...(waving && Math.floor(t / 3) % 2 ? ['saludo'] : []),
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
    pieces: [...steam(k), ...(Math.floor(k / 3) % 2 ? ['saludo'] : []), 'ojos-camara', 'boca-sonrisa-cerrada'],
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
  sueno: (k) => ({ pieces: ['ojos-cerrados', 'boca-seria'], head: [0, k % 40 < 20 ? 0 : 6] }),
  final: (k) => ({
    pieces: [...steam(k), ...(Math.floor(k / 3) % 2 ? ['saludo'] : []), 'ojos-camara', 'boca-sonrisa-cerrada'],
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
      ...(k < 8 && Math.floor(k / 2) % 2 === 0 ? ['saludo'] : []),
      k < 6 ? 'ojos-abajo' : 'ojos-camara',
      'boca-sonrisa-cerrada',
    ],
    head: bob(k, 12),
  }),
  asiente: (k) => ({ pieces: [...steam(k), 'ojos-camara', 'boca-sonrisa-cerrada'], head: bob(k, 6, 4) }),
};

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
    img.onload = () => resolve(img);
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
  const names = Object.keys(meta.pieces);
  const [scene, head, ...images] = await Promise.all([
    load('/avatar/escena.webp'),
    load('/avatar/cabeza.webp'),
    ...names.map((n) => load(`/avatar/piezas/${n}.webp`)),
  ]);
  const piece = Object.fromEntries(names.map((n, i) => [n, images[i]]));
  const frameImg = frameName ? await load(`/avatar/marcos/${frameName}.png`).catch(() => null) : null;
  let frameFrom = -1; // fotograma en que se puso el marco (-1: sin marco)
  canvas.width = meta.size;
  canvas.height = meta.size;

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

  function draw(t: number) {
    if (reaction && reaction.end && performance.now() > reaction.end) reaction = null;
    const k = reaction ? (reduced ? 0 : t - reaction.start) : 0;
    const pose = reaction
      ? REACTIONS[reaction.key](k)
      : reduced
        ? STATES[state](0, -100, false)
        : STATES[state](t, since, t <= blinkUntil);
    let on = pose.pieces;
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
    const c = ctx!;
    c.clearRect(0, 0, meta.size, meta.size);
    c.drawImage(scene, 0, 0);
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
    for (const p of on) if (!meta.pieces[p].head) c.drawImage(piece[p], meta.pieces[p].x, meta.pieces[p].y);
    c.drawImage(head, hx, hy);
    for (const p of on) {
      const m = meta.pieces[p];
      if (m.head) c.drawImage(piece[p], m.x + hx, m.y + hy);
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
  };

  draw(0);
  root?.classList.add('ready');
  if (reduced) return api;
  setInterval(() => {
    tick++;
    if (tick >= nextBlink) {
      blinkUntil = tick + 1;
      nextBlink = tick + 30 + Math.floor(Math.random() * 35);
    }
    draw(tick);
  }, TICK_MS);
  return api;
}
