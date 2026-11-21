# North Shore Mixed Martial Arts Club (NSMMAC) website

Static website built with [Astro](https://astro.build). The look is the light, Apple-style design from `../Website redesign with Apple design/North Shore Martial Arts.dc.html` (previewed at `/concept/` until it became the main site; `public/_redirects` sends old `/concept/*` links to the same page at the root).

**Concept 2** (a bold, colour-blocked design with italic uppercase type, marquee words, card rails and a full-screen kids slideshow) is previewed at `/concept-2/` and is `noindex`. It uses the same content from `src/data/site.ts` and the same booking/tabs/timetable behaviour (`src/scripts/site.ts`). Its own files are `src/pages/concept-2/`, `src/layouts/Concept2Layout.astro`, `src/components/c2/`, `src/data/concept2.ts` (URLs, colour pairs, photo picks), `src/styles/concept2.css` and `src/scripts/concept2.ts`.

## Pages

| URL | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/kids-martial-arts/`, `/kickboxing/`, `/boxing/`, `/self-defence/`, `/personal-training/` | `src/pages/[slug].astro` (one template, data from `PROGRAMS`) |
| `/timetable/` | `src/pages/timetable.astro` |
| Nav, footer, SEO head | `src/layouts/Layout.astro` |
| Styles / motion | `src/styles/global.css`, `src/scripts/site.ts` (behaviour), `src/scripts/motion.ts` (scroll and pointer effects) |

Kids age groups can be deep-linked: `/kids-martial-arts/#minicubs`, `#cubs`, `#junior`, `#senior`.

## Editing content

Programs, the timetable, testimonials, stats, values, program colours, affiliations, phone and address all live in **`src/data/site.ts`**. Change them there and every page updates.

Timetable sessions are `[dayIndex, time, note]`, where `0` is Monday and `6` is Sunday.

## Run it

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs static files to dist/
npm run preview   # serve the built dist/
```

## Photos

The club's photos and affiliation logos are **committed in `public/images/`**, using the same filenames as the WordPress uploads, so every build (including Cloudflare's Git builds) has them.

- To add or replace a photo, put it in `public/images/` and commit it.
- Optional: if a `../photos` folder exists next to the repo (or `PHOTOS_DIR` is set), `npm run dev` and `npm run build` copy its images into `public/images/` first. `npm run images` downloads the originals from the current WordPress site into that folder.
- Any image that's missing shows a labelled placeholder.

## Free-trial booking form

The booking sheet POSTs `FormData` (`class`, `when`, `name`, `phone`) to `PUBLIC_BOOKING_ENDPOINT`. Copy `.env.example` to `.env` and set it to any form backend, for example Formspree, Basin, Netlify Forms or your own API.

- **Not set, in dev:** it pretends the request succeeded and logs the request to the console.
- **Not set, in production:** it tells the visitor to call instead. It never shows a fake "Request sent".

## Deploy (Cloudflare Workers)

Hosted as a static-assets Worker, set up the same way as jojolapa. See `wrangler.jsonc`:
- `dist/` is served as-is.
- `/kickboxing` redirects to `/kickboxing/`.
- Unknown paths get `404.html` with a real 404 status.
- `public/_headers` sets the cache rules.

**Deploy from this machine:**

```sh
npx wrangler login   # once
npm run deploy       # build + wrangler deploy → https://north-shore-martial-arts.<your-subdomain>.workers.dev
```

**Auto-deploy from GitHub (like jojolapa):** in the Cloudflare dashboard, go to **Workers & Pages → north-shore-martial-arts → Settings → Build → Connect** and pick the repo. Use build command `npm run build` and deploy command `npx wrangler deploy`.

The photos are committed in `public/images/`, so Git builds include them.

**Custom domain:** once the domain's DNS is on Cloudflare, uncomment `routes` in `wrangler.jsonc` and deploy.

Update `site` in `astro.config.mjs` if the domain changes. It's used for canonical URLs, Open Graph tags and the LocalBusiness schema.
