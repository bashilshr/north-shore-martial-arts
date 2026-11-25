// robots.txt: everything is crawlable. /concept-2/ is kept out of results by its own noindex tag
// (blocking it here would stop Google from seeing that tag).
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://www.northshoremixedmartialartsclub.com.au');
  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', base).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
