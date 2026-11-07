// Optional: copies photos from a working folder outside the repo (../photos by default, or PHOTOS_DIR)
// into public/images/, which is committed. Runs before `npm run dev` and `npm run build`; if the folder
// isn't there (e.g. on Cloudflare's build machines) it does nothing and the committed images are used.
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
  console.log(`[photos] no ${src} folder; using the images committed in public/images.`);
}
for (const f of files) await cp(resolve(src, f), resolve(dest, f));
if (files.length) console.log(`[photos] ${files.length} file(s) copied from ${src}`);
