/**
 * Vídeos en bucle de las capturas (`video[data-clip]`): corren solo mientras se ven en pantalla (y, si hay una versión
 * clara y otra oscura, solo la del tema activo), sin sonido. Con «reducir movimiento» no arrancan solos: se enseña el
 * póster (y los controles, donde se pueden pulsar).
 */
const clips = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-clip]'));

if (clips.length) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const v of clips) {
      v.controls = true;
      v.loop = false;
    }
  } else {
    const root = document.documentElement;
    const dark = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && dark.matches);
    const visible = new Set<Element>();
    const sync = () => {
      for (const v of clips) {
        const themed = v.classList.contains('dark') || v.classList.contains('light');
        const right = !themed || v.classList.contains('dark') === isDark();
        if (visible.has(v) && right) v.play().catch(() => {});
        else v.pause();
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
        sync();
      },
      { threshold: 0.35 },
    );
    clips.forEach((v) => io.observe(v));
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    dark.addEventListener('change', sync);
  }
}
