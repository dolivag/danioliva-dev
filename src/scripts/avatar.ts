/**
 * Avatar animado. Se compone en un canvas de 200x200 a partir de capas (fondo, cuerpo, cabeza y
 * primer plano) y piezas de expresión (ojos, cejas, boca, birrete), todas con el mismo encuadre:
 * las genera scripts/build-avatar.py desde art/avatar/.
 *
 * Cada estado (uno por sección) dice qué piezas se ponen y cómo se mueve la cabeza. El tamaño y el
 * sitio (grande en la portada, pequeño en la esquina) los pone el CSS.
 */

const SIZE = 200;
const TICK_MS = 120;

const LAYERS = ['fondo', 'cuerpo', 'cabeza', 'primer-plano'] as const;
const PIECES = [
  'ojos-cerrados',
  'ojos-pantalla',
  'cejas-fruncidas',
  'boca-sonrisa-cerrada',
  'boca-seria',
  'boca-o',
  'birrete',
] as const;

type Piece = (typeof PIECES)[number];
type Pose = { pieces: Piece[]; head: [number, number] };

export type AvatarState = 'hero' | 'projects' | 'experience' | 'studies' | 'contact' | 'hogarnizer';

export const BUBBLES: Record<AvatarState, string> = {
  hero: '¡Hola! Soy Daniel.',
  projects: 'Cosas que he construido.',
  experience: 'Concentrado, como en el trabajo.',
  studies: 'Siempre aprendiendo.',
  contact: '¿Hablamos?',
  hogarnizer: 'Picando código a tope.',
};

const JOKES = [
  'Compilando…',
  'En mi máquina funciona.',
  'git push --force (es broma).',
  '¡Eh! Eso hacía cosquillas.',
];

/**
 * Qué hace cada estado en el fotograma `t` (un fotograma cada TICK_MS).
 * `beat` alterna para el tecleo; `blink` dice si toca parpadear.
 */
const STATES: Record<AvatarState, (t: number, blink: boolean) => Pose> = {
  // Portada: mira a quien visita y sonríe; de vez en cuando echa un vistazo a la pantalla.
  hero: (t, blink) => ({
    pieces: blink ? ['ojos-cerrados'] : t % 60 >= 44 ? ['ojos-pantalla'] : [],
    head: [0, t % 16 < 8 ? 0 : 1],
  }),
  // Proyectos: tecleando a ritmo normal, mirando la pantalla.
  projects: (t, blink) => ({
    pieces: [blink ? 'ojos-cerrados' : 'ojos-pantalla'],
    head: [0, t % 6 < 3 ? 0 : 1],
  }),
  // Experiencia: concentrado, con el ceño fruncido; se acerca a la pantalla a ratos.
  experience: (t, blink) => {
    const lean = t % 50 >= 30;
    return {
      pieces: [blink ? 'ojos-cerrados' : 'ojos-pantalla', 'cejas-fruncidas', 'boca-seria'],
      head: lean ? [2, 3 + (t % 4 < 2 ? 0 : 1)] : [0, t % 10 < 5 ? 0 : 1],
    };
  },
  // Estudios: con el birrete puesto y media sonrisa.
  studies: (t, blink) => ({
    pieces: [...(blink ? (['ojos-cerrados'] as Piece[]) : []), 'boca-sonrisa-cerrada', 'birrete'],
    head: [0, t % 16 < 8 ? 0 : 1],
  }),
  // Contacto: mira de frente y sonríe.
  contact: (t, blink) => ({
    pieces: blink ? ['ojos-cerrados'] : [],
    head: [0, t % 14 < 7 ? 0 : 1],
  }),
  // Hogarnizer: inclinado hacia la pantalla, tecleando rápido.
  hogarnizer: (t, blink) => ({
    pieces: [blink ? 'ojos-cerrados' : 'ojos-pantalla', 'cejas-fruncidas'],
    head: [2, 3 + (t % 2)],
  }),
};

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
  ctx.imageSmoothingEnabled = false;
  const root = canvas.closest('.avatar') as HTMLElement | null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [layers, pieces] = await Promise.all([
    Promise.all(LAYERS.map((n) => load(`/avatar/${n}.png`))),
    Promise.all(PIECES.map((n) => load(`/avatar/piezas/${n}.png`))),
  ]);
  const [bg, body, head, front] = layers;
  const piece = Object.fromEntries(PIECES.map((n, i) => [n, pieces[i]])) as Record<
    Piece,
    HTMLImageElement
  >;

  let state: AvatarState = 'hero';
  let tick = 0;
  let blinkUntil = -1;
  let nextBlink = 20;
  let surpriseUntil = -1;

  function draw(t: number) {
    const blink = t <= blinkUntil;
    const pose = reduced ? STATES[state](0, false) : STATES[state](t, blink);
    let { pieces: on } = pose;
    if (t <= surpriseUntil) on = [...on.filter((p) => !p.startsWith('boca')), 'boca-o'];
    const [hx, hy] = pose.head;
    ctx!.clearRect(0, 0, SIZE, SIZE);
    ctx!.drawImage(bg, 0, 0);
    // El cuerpo respira despacio: una fila arriba y abajo.
    ctx!.drawImage(body, 0, !reduced && t % 24 >= 12 ? 1 : 0);
    ctx!.drawImage(head, hx, hy);
    for (const p of on) ctx!.drawImage(piece[p], hx, hy);
    ctx!.drawImage(front, 0, 0);
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
    surpriseUntil = tick + 8;
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
      nextBlink = tick + 25 + Math.floor(Math.random() * 30);
    }
    draw(tick);
  }, TICK_MS);
}
