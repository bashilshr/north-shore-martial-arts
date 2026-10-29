// Copies photos from the private photos folder (outside this repo) into public/images/,
// which is git-ignored. Runs automatically before `npm run dev` and `npm run build`.
// Folder defaults to ../photos; override with PHOTOS_DIR=/path/to/photos.
import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = resolve(root, process.env.PHOTOS_DIR || '../photos');
const dest = resolve(root, 'public/images');

await mkdir(dest, { recursive: true });
let files = [];
try {
  files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(f));
} catch {
  console.warn(`[photos] ${src} not found; pages will show placeholders.`);
}
for (const f of files) await cp(resolve(src, f), resolve(dest, f));
console.log(`[photos] ${files.length} file(s) copied from ${src}`);
