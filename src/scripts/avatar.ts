/**
 * Avatar en pixel art. Parte de /avatar/avatar.png (64x64, fondo transparente) y le añade, píxel a
 * píxel sobre un canvas de 64x64: respiración, parpadeo, código que se escribe en la pantalla del
 * portátil y un accesorio distinto según la sección que se está viendo.
 * El tamaño y el sitio (grande en la portada, pequeño en la esquina después) lo pone el CSS.
 */

const SIZE = 64;
const TICK_MS = 160;

type Rgb = [number, number, number];
const INK: Rgb = [14, 15, 34];
const INK_SOFT: Rgb = [58, 64, 110];
const SKIN: Rgb = [252, 176, 120];
const CREAM: Rgb = [239, 226, 205];
const TEAL: Rgb = [79, 209, 218];
const PURPLE: Rgb = [110, 84, 214];
const WHITE: Rgb = [235, 238, 250];

export type AvatarState = 'hero' | 'projects' | 'experience' | 'studies' | 'contact' | 'hogarnizer';

export const BUBBLES: Record<AvatarState, string> = {
  hero: '¡Hola! Soy Daniel.',
  projects: 'Cosas que he construido.',
  experience: 'Dónde he trabajado.',
  studies: 'Siempre aprendiendo.',
  contact: '¿Hablamos?',
  hogarnizer: 'Mi proyecto para el hogar.',
};

const JOKES = [
  'Compilando…',
  'En mi máquina funciona.',
  'git push --force (es broma).',
  '¡Ay! Eso hacía cosquillas.',
];

// Longitudes de las dos líneas de código en cada paso: parece que se va escribiendo.
const CODE_STEPS: [number, number][] = [
  [3, 0],
  [7, 0],
  [11, 0],
  [11, 4],
  [11, 9],
  [6, 9],
  [6, 12],
  [2, 12],
];

export function startAvatar(
  canvas: HTMLCanvasElement,
  sprite: HTMLImageElement,
  bubble: HTMLElement,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let state: AvatarState = 'hero';
  let tick = 0;
  let blinkUntil = -1;
  let nextBlink = 14;
  let excitedUntil = 0;

  const px = (x: number, y: number, c: Rgb, a = 1) => {
    ctx.fillStyle = a === 1 ? `rgb(${c})` : `rgba(${c},${a})`;
    ctx.fillRect(x, y, 1, 1);
  };
  const row = (x: number, y: number, w: number, c: Rgb, a = 1) => {
    for (let i = 0; i < w; i++) px(x + i, y, c, a);
  };

  function drawProps(t: number) {
    const bob = Math.floor(t / 3) % 2;
    switch (state) {
      case 'studies': {
        // Birrete de graduado con la borla en turquesa.
        row(30, 2, 5, INK);
        row(25, 3, 15, INK);
        row(20, 4, 25, INK);
        row(25, 5, 15, INK);
        row(30, 6, 5, INK);
        row(24, 6, 3, INK_SOFT);
        row(22, 4, 2, INK_SOFT);
        row(25, 7, 15, INK);
        px(44, 4, TEAL);
        for (let y = 5; y < 10; y++) px(44 + (Math.floor(t / 4) % 2 && y > 7 ? 1 : 0), y, TEAL);
        break;
      }
      case 'experience': {
        // Vapor que sale de la taza.
        const s = Math.floor(t / 2) % 3;
        const wisps = [
          [[0, 0], [1, -1], [0, -2], [1, -3]],
          [[1, 0], [0, -1], [1, -2], [0, -3]],
          [[0, 0], [0, -1], [1, -2], [1, -3]],
        ][s];
        wisps.forEach(([dx, dy]) => px(17 + dx * 2, 52 + dy, WHITE, 0.85));
        break;
      }
      case 'contact': {
        // Un sobre que sube y baja.
        const y = 8 + bob;
        for (let i = 0; i < 8; i++) row(46, y + i, 13, CREAM);
        for (let i = 0; i < 6; i++) {
          px(46 + i, y + i, INK_SOFT);
          px(58 - i, y + i, INK_SOFT);
        }
        row(46, y, 13, INK_SOFT);
        row(46, y + 7, 13, INK_SOFT);
        px(52, y + 6, PURPLE);
        break;
      }
      case 'projects': {
        // Tres tarjetas flotando, como la lista de proyectos.
        const cards: [number, number, Rgb][] = [
          [46, 8 + bob, PURPLE],
          [53, 11 - bob, TEAL],
          [48, 17 + bob, CREAM],
        ];
        cards.forEach(([x, y, c]) => {
          for (let dy = 0; dy < 5; dy++) row(x, y + dy, 8, c);
          row(x + 1, y + 1, 4, INK_SOFT, 0.45);
        });
        break;
      }
      case 'hogarnizer': {
        // Una casita: el logo de la app.
        const y = 8 + bob;
        row(52, y, 2, TEAL);
        row(50, y + 1, 6, TEAL);
        row(48, y + 2, 10, TEAL);
        row(46, y + 3, 14, TEAL);
        for (let i = 4; i < 11; i++) row(48, y + i, 10, WHITE);
        for (let i = 7; i < 11; i++) row(52, y + i, 3, INK);
        break;
      }
      default:
    }
  }

  function draw(t: number) {
    ctx!.clearRect(0, 0, SIZE, SIZE);
    const excited = t < excitedUntil;
    const dy = reduced ? 0 : Math.floor(t / (excited ? 1 : 3)) % 2;
    // Cuerpo quieto y cabeza que respira una fila arriba y abajo.
    ctx!.drawImage(sprite, 0, 32, SIZE, 32, 0, 32, SIZE, 32);
    ctx!.drawImage(sprite, 0, 0, SIZE, 32, 0, dy, SIZE, 32);

    // Parpadeo: la piel cubre los ojos y queda una raya.
    if (t <= blinkUntil) {
      [25, 34].forEach((x0) => {
        for (let y = 18 + dy; y <= 20 + dy; y++) row(x0, y, 5, SKIN);
        row(x0 + 1, 20 + dy, 3, INK);
      });
    }

    // Código escribiéndose en la pantalla del portátil.
    const step = reduced ? 4 : Math.floor(t / (excited ? 1 : 2)) % CODE_STEPS.length;
    const [a, b] = CODE_STEPS[step];
    row(38, 49, a, TEAL);
    if (b) row(38, 51, b, WHITE, 0.8);
    if (!reduced && t % 4 < 2) {
      px(Math.min(38 + (b || a) + 1, 55), b ? 51 : 49, WHITE);
    }

    drawProps(reduced ? 0 : t);
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
    canvas.parentElement?.parentElement?.setAttribute('data-state', next);
    say(BUBBLES[next], next === 'hero' ? 5200 : 4200);
  }

  // La sección que cruza la línea del medio de la pantalla manda.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) setState(e.target.getAttribute('data-avatar') as AvatarState);
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  document.querySelectorAll('[data-avatar]').forEach((el) => io.observe(el));

  canvas.parentElement?.parentElement?.addEventListener('click', () => {
    excitedUntil = tick + 14;
    say(JOKES[Math.floor(Math.random() * JOKES.length)], 2600);
  });

  draw(0);
  if (reduced) return;
  setTimeout(() => say(BUBBLES.hero, 5200), 700);
  setInterval(() => {
    tick++;
    if (tick >= nextBlink) {
      blinkUntil = tick + 1;
      nextBlink = tick + 14 + Math.floor(Math.random() * 14);
    }
    draw(tick);
  }, TICK_MS);
}
