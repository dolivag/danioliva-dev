/**
 * El juego del avatar: logros que se desbloquean interactuando con él (clics, arrastrarle palabras,
 * quedarse quieto, llegar al final). Aquí están los datos, el guardado en el navegador y el arrastre
 * de palabras; las poses de cada reacción están en avatar.ts.
 */

export type AchievementId = 'hola' | 'orden' | 'tiempo' | 'trastero' | 'mareo' | 'sueno' | 'final' | 'tema' | 'konami' | 'agitar';

export type Achievement = {
  id: AchievementId;
  title: string;
  /** Qué hiciste (se enseña solo una vez desbloqueado: las interacciones son secretas). */
  how: string;
  /** Lo que dice el avatar al conseguirlo (y cada vez que se prueba desde el panel). */
  say: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'hola', title: 'Primer contacto', how: 'Le hiciste un clic.', say: '¡Hola! Soy el avatar de Daniel.' },
  { id: 'orden', title: 'Orden en casa', how: 'Le arrastraste «Hogarnizer».', say: 'Tareas, compra, gastos… ¡todo en orden!' },
  { id: 'tiempo', title: 'Previsión', how: 'Le arrastraste «DuoMeteo».', say: 'Sol aquí, lluvia allí. Lo sabía.' },
  { id: 'trastero', title: '¿Dónde estaba?', how: 'Le arrastraste «Trasteo».', say: '¿Dónde dejé el cable USB-C?' },
  { id: 'mareo', title: 'Demasiado café', how: 'Le hiciste clic muchas veces seguidas.', say: '¡Para, que me mareo!' },
  { id: 'sueno', title: 'Siesta', how: 'Te quedaste quieto un rato.', say: 'Zzz…' },
  { id: 'final', title: 'Hasta pronto', how: 'Llegaste al final de la página.', say: '¡Hasta pronto! Escríbeme cuando quieras.' },
  { id: 'tema', title: 'Luces y sombras', how: 'Cambiaste varias veces de tema.', say: '¿Luces o ambiente? Decídete.' },
  { id: 'agitar', title: 'Terremoto', how: 'Agitaste el móvil.', say: '¡Eh! ¡Que me caigo de la mesa!' },
  { id: 'konami', title: 'Código secreto', how: 'Tecleaste el código clásico.', say: '+30 vidas. Código desbloqueado.' },
];

/** Palabras que se pueden arrastrar (`data-drag` en el HTML). Las que no dan logro solo reaccionan. */
export const WORDS: Record<string, { achievement?: AchievementId; say?: string }> = {
  hogarnizer: { achievement: 'orden' },
  duometeo: { achievement: 'tiempo' },
  trasteo: { achievement: 'trastero' },
  'qr city': { say: 'Escaneando… ¡es una ciudad entera!' },
  'three.js': { say: 'Un cubo, y de pronto una ciudad.' },
  expo: { say: 'De una base de código a las dos tiendas.' },
  'react native': { say: 'Un código, iOS y Android.' },
  supabase: { say: 'Backend sin sudar.' },
};

export const JOKES = ['Compilando…', 'En mi máquina funciona.', 'git push --force (es broma).', '¡Eh! Que me desconcentras.'];

const KEY = 'avatar-unlocked';

export function loadUnlocked(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function saveUnlocked(set: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {}
}

type DragOptions = {
  /** Elemento sobre el que se suelta. */
  target: () => HTMLElement;
  onOver: (over: boolean) => void;
  onDrop: (word: string) => void;
};

/**
 * Arrastrar palabras (`[data-drag]`) hasta el avatar. Con ratón se arrastra al mover; en táctil hace
 * falta una pulsación larga (si no, es un desplazamiento normal de la página).
 */
export function enableWordDrag({ target, onOver, onDrop }: DragOptions) {
  const inside = (x: number, y: number) => {
    const r = target().getBoundingClientRect();
    const m = 14;
    return x > r.left - m && x < r.right + m && y > r.top - m && y < r.bottom + m;
  };

  document.addEventListener('pointerdown', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-drag]');
    if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const node: HTMLElement = el;
    const word = node.dataset.drag!;
    const touch = e.pointerType === 'touch';
    const sx = e.clientX;
    const sy = e.clientY;
    let dragging = false;
    let over = false;
    let ghost: HTMLElement | null = null;
    let timer = 0;

    if (!touch) e.preventDefault(); // sin arrastre nativo del enlace ni selección de texto

    const place = (x: number, y: number) => {
      if (ghost) ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };
    const start = (x: number, y: number) => {
      dragging = true;
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.textContent = node.textContent?.trim() ?? word;
      document.body.append(ghost);
      place(x, y);
      node.classList.add('dragging');
      document.body.classList.add('is-dragging');
    };
    const block = (ev: TouchEvent) => {
      if (dragging) ev.preventDefault();
    };
    const noMenu = (ev: Event) => ev.preventDefault();

    const move = (ev: PointerEvent) => {
      if (!dragging) {
        const d = Math.hypot(ev.clientX - sx, ev.clientY - sy);
        if (touch && d > 8) return cleanup();
        if (!touch && d > 6) start(ev.clientX, ev.clientY);
        return;
      }
      place(ev.clientX, ev.clientY);
      const now = inside(ev.clientX, ev.clientY);
      if (now !== over) onOver((over = now));
    };
    const end = () => {
      if (dragging) {
        // Lo que se arrastra no cuenta como clic (si no, abriría el enlace de la tarjeta).
        const swallow = (c: Event) => c.stopPropagation();
        addEventListener('click', swallow, true);
        setTimeout(() => removeEventListener('click', swallow, true), 0);
        const g = ghost;
        if (over && g) {
          const r = target().getBoundingClientRect();
          g.style.transition = 'transform 0.35s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.35s ease';
          g.style.opacity = '0';
          g.style.transform = `translate(${r.left + r.width / 2}px, ${r.top + r.height * 0.4}px) translate(-50%, -50%) scale(0.3)`;
          onDrop(word);
        } else if (g) {
          g.style.transition = 'opacity 0.25s ease';
          g.style.opacity = '0';
        }
        ghost = null;
        if (g) setTimeout(() => g.remove(), 400);
      }
      cleanup();
    };
    function cleanup() {
      clearTimeout(timer);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', end);
      removeEventListener('pointercancel', cancel);
      removeEventListener('touchmove', block);
      removeEventListener('contextmenu', noMenu);
      node.classList.remove('dragging');
      document.body.classList.remove('is-dragging');
      if (over) onOver(false);
      over = false;
      if (ghost) {
        ghost.remove();
        ghost = null;
      }
    }
    function cancel() {
      cleanup();
    }

    addEventListener('pointermove', move);
    addEventListener('pointerup', end);
    addEventListener('pointercancel', cancel);
    if (touch) {
      addEventListener('touchmove', block, { passive: false });
      addEventListener('contextmenu', noMenu);
      timer = window.setTimeout(() => start(sx, sy), 350);
    }
  });
}
