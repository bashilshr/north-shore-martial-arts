// Downloads the photos and affiliation logos from the club's current WordPress site into public/images.
// Run once: npm run images
import { mkdir, writeFile, access } from 'node:fs/promises';
import { basename } from 'node:path';

const BASE = 'https://www.northshoremixedmartialartsclub.com.au/wp-content/uploads/';
const OUT = new URL('../public/images/', import.meta.url);
const FILES = [
  '2019/06/boxing-1-1.jpg',
  '2019/06/boxing-2-1.jpg',
  '2019/06/boxing-3-1.jpg',
  '2019/06/boxing-4-1.jpg',
  '2019/06/childrens-martialarts-1.jpg',
  '2019/06/kickboxing260-500.jpg',
  '2019/06/kickboxing270-500.jpg',
  '2019/06/kickboxing271-500.jpg',
  '2019/06/kickboxing273-500.jpg',
  '2019/06/maia-1.png',
  '2019/06/mosman-affiliates-world-taekwondo.jpg',
  '2019/06/nsw-combat-logo.png',
  '2019/06/self-defence-1-1.jpg',
  '2019/06/self-defence-2-1.jpg',
  '2019/06/self-defence-3-1.jpg',
  '2019/06/self-defence-5.jpg',
  '2019/07/active-kids-logo.png',
  '2019/07/ama-hof-logo.jpg',
  '2019/07/australian-jujitsu-logo.png',
  '2019/07/austr-sport-commission.png',
  '2019/07/boxing-australia.png',
  '2019/07/girls-kicking-high-029.jpg',
  '2019/07/kids-group-204.jpg',
  '2019/07/kids-martial-arts-lined-up-016.jpg',
  '2019/07/ma-australia.png',
  '2019/07/mosman-affiliates-daehanminguk-hapkido.jpg',
  '2019/08/ais-logo.jpg',
  '2019/08/master-tran-being-awarded-hall-of-fame-4.jpg',
  '2019/08/play-by-the-rules-opt.jpg',
  '2019/08/world-karate-union-logo.jpg',
  '2020/09/world-karate.png',
  '2020/09/world-kickboxing.png',
  '2020/10/immafa.png',
  '2022/09/Australian_Taekwondo.jpg',
  '2022/09/master-toddy.jpg',
  '2022/09/mtia.jpg',
  '2022/09/team-norton.jpg',
];

await mkdir(OUT, { recursive: true });
let failed = 0;
for (const path of FILES) {
  const dest = new URL(basename(path), OUT);
  try { await access(dest); continue; } catch {}
  try {
    const res = await fetch(BASE + path);
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    // SiteGround can answer with a bot-check HTML page instead of the file.
    const type = res.headers.get('content-type') || '';
    if (!type.startsWith('image/')) throw new Error(`not an image (${type || 'unknown type'}), probably the host's bot check`);
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log('✓', basename(path));
  } catch (e) {
    failed++;
    console.error('✗', path, e.message);
  }
}
console.log(failed
  ? `${failed} failed. Copy those files into public/images/ by hand (e.g. from the WordPress media library).`
  : 'All images ready');
