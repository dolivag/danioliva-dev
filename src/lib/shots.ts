import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Capturas de un proyecto: todas las imágenes de public/proyectos/<slug>/, por orden de nombre
 * (1.webp, 2.webp…). Si la carpeta no existe o está vacía, no hay capturas y la web no pinta nada.
 */
export function shotsOf(slug: string): string[] {
  const dir = join(process.cwd(), 'public', 'proyectos', slug);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f: string) => /\.(png|jpe?g|webp|avif)$/i.test(f))
    .sort((a: string, b: string) => a.localeCompare(b, 'en', { numeric: true }))
    .map((f: string) => `/proyectos/${slug}/${f}`);
}
