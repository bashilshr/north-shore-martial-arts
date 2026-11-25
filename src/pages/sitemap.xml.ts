// XML sitemap for search engines, built from the same data as the pages so new programs are
// picked up automatically. Leaves out /concept-2/ (a noindex design preview) and the 404 page.
import type { APIRoute } from 'astro';
import { PROGRAMS, programHref } from '../data/site';

const PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/timetable/', priority: '0.9', changefreq: 'weekly' },
  ...PROGRAMS.map((p) => ({ path: programHref(p), priority: p.id === 'kids' ? '0.9' : '0.8', changefreq: 'monthly' })),
];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://www.northshoremixedmartialartsclub.com.au');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${new URL(p.path, base).href}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  ).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
