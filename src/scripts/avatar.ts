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

export const BUBBLES: Record<AvatarState, string> = {
  hero: '¡Hola! Soy Daniel.',
  projects: 'Cosas que he construido.',
  experience: 'Modo concentración.',
  studies: 'Siempre aprendiendo.',
  contact: '¿Hablamos?',
  hogarnizer: 'Picando código a tope.',
};

const JOKES = [
  'Compilando…',
  'En mi máquina funciona.',
  'git push --force (es broma).',
  '¡Eh! Que me desconcentras.',
];

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
  'ojos-camara': [1, -0.3], // a quien visita: con la cabeza girada, es mirar hacia la derecha
  'ojos-abajo': [0, 1],
  'ojos-pantalla': [-1, 1], // abajo y a la izquierda
  'ojos-reojo': [1, 1], // abajo y a la derecha
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

export async function startAvatar(canvas: HTMLCanvasElement, bubble: HTMLElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
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
  let surpriseUntil = -1;

  function draw(t: number) {
    const pose = reduced
      ? STATES[state](0, -100, false)
      : STATES[state](t, since, t <= blinkUntil);
    let on = pose.pieces;
    let [hx, hy] = pose.head;
    // Si el cursor se ha movido hace poco, la cabeza se vuelve un poco hacia él y los ojos lo miran.
    if (!reduced && performance.now() - cursor.at < FOLLOW_MS) {
      hx += Math.round(cursor.x * 8);
      hy += Math.round(cursor.y * 5);
      const len = Math.hypot(cursor.x, cursor.y);
      const eyesShut = on.includes('ojos-cerrados');
      on = on.filter((p) => !(p in GAZES));
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
    if (t <= surpriseUntil) on = [...on.filter((p) => !p.startsWith('boca')), 'boca-o'];
    const c = ctx!;
    c.clearRect(0, 0, meta.size, meta.size);
    c.drawImage(scene, 0, 0);
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
    say(BUBBLES[next], next === 'hero' ? 5200 : 4200);
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

  root?.addEventListener('click', () => {
    surpriseUntil = tick + 10;
    say(JOKES[Math.floor(Math.random() * JOKES.length)], 2600);
    draw(tick);
  });

  draw(0);
  root?.classList.add('ready');
  if (reduced) return;
  setTimeout(() => say(BUBBLES[state], 5200), 700);
  setInterval(() => {
    tick++;
    if (tick >= nextBlink) {
      blinkUntil = tick + 1;
      nextBlink = tick + 30 + Math.floor(Math.random() * 35);
    }
    draw(tick);
  }, TICK_MS);
}
