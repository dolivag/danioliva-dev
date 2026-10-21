#!/usr/bin/env node
/**
 * Genera lo que se ve al compartir y en la pestaña del navegador:
 *   public/og/<idioma>/<home|slug>.png   tarjetas de 1200x630 (las dibuja `src/pages/og-card/`, solo con `astro dev`)
 *   public/apple-touch-icon.png          icono de iOS (180x180)
 *   public/favicon.ico                   respaldo de 32x32 para navegadores y rastreadores que lo piden
 *
 *     node scripts/build-social.cjs            # todo
 *     node scripts/build-social.cjs --icons    # solo los iconos
 *
 * Necesita Playwright con Chromium (`npm i -g playwright && npx playwright install chromium`). Si Chromium ya está
 * instalado en otro sitio: `PW_CHROMIUM_PATH=/ruta/a/chromium`.
 */
const { execSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4398;
const onlyIcons = process.argv.includes('--icons');

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
  }
}
const { chromium } = loadPlaywright();

/** Un ICO de una sola imagen: la cabecera y el PNG tal cual. */
function ico(png) {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);   // cabecera: 1 imagen
  head.writeUInt8(32, 6); head.writeUInt8(32, 7);                                  // 32x32
  head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);                           // planos y bits por píxel
  head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);                  // tamaño y posición
  return Buffer.concat([head, png]);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });

  // ---- iconos: el favicon (una «D.» sobre ámbar). Para iOS, a sangre (iOS redondea las esquinas él mismo).
  const svg = fs.readFileSync(path.join(ROOT, 'public', 'favicon.svg'), 'utf8');
  const icon = async (size, out, bleed = false) => {
    const p = await browser.newPage({ viewport: { width: size, height: size }, colorScheme: 'light' });
    await p.setContent(`<body style="margin:0;background:${bleed ? '#f0b52e' : 'transparent'}">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`);
    const buf = await p.screenshot({ type: 'png', omitBackground: !bleed });
    await p.close();
    if (out) fs.writeFileSync(out, buf);
    return buf;
  };
  await icon(180, path.join(ROOT, 'public', 'apple-touch-icon.png'), true);
  fs.writeFileSync(path.join(ROOT, 'public', 'favicon.ico'), ico(await icon(32)));
  console.log('iconos listos');
  if (onlyIcons) return browser.close();

  // ---- tarjetas: se abren desde `astro dev`
  const dev = spawn('npx', ['astro', 'dev', '--port', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
  try {
    const base = `http://localhost:${PORT}`;
    for (let i = 0; i < 60; i++) {
      try { if ((await fetch(base + '/')).ok) break; } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
    const slugs = ['home', 'qr-city', 'hogarnizer', 'duometeo', 'trasteo', 'storia'];
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    for (const lang of ['es', 'ca', 'en']) {
      fs.mkdirSync(path.join(ROOT, 'public', 'og', lang), { recursive: true });
      for (const slug of slugs) {
        await page.goto(`${base}/og-card/${lang}/${slug}/`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(ROOT, 'public', 'og', lang, `${slug}.png`), type: 'png' });
        console.log(`og/${lang}/${slug}.png`);
      }
    }
  } finally {
    dev.kill();
    await browser.close();
  }
})();
