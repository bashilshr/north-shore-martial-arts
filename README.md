# North Shore Martial Arts Club website

Static website built with [Astro](https://astro.build) from the v2 design in `../Website redesign with Apple design/`.

## Pages

| URL | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/kids-martial-arts/`, `/kickboxing/`, `/boxing/`, `/self-defence/`, `/personal-training/` | `src/pages/[slug].astro` (one template, data from `PROGRAMS`) |
| `/timetable/` | `src/pages/timetable.astro` |

Kids age groups can be deep-linked: `/kids-martial-arts/#minicubs`, `#cubs`, `#junior`, `#senior`.

## Editing content

Programs, the timetable, testimonials, stats, affiliations, phone and address all live in **`src/data/site.ts`**. Change them there and every page updates.

Timetable sessions are `[dayIndex, time, note]`, where `0` is Monday and `6` is Sunday.

## Run it

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs static files to dist/
npm run preview   # serve the built dist/
```

## Photos (kept out of this repo)

The club's photos and affiliation logos are **not committed**. Keep them in a private folder next to the repo, using the same filenames as the WordPress uploads:

```
Takewondo/
  photos/   <- the images (private, never committed)
  site/     <- this repo
```

`npm run dev` and `npm run build` copy them into `public/images/` first. That folder is git-ignored.

- To use a different folder, set `PHOTOS_DIR=/path/to/photos`.
- Any image that's missing shows a labelled placeholder.
- `npm run images` tries to download the files from the current site. The host's bot protection currently blocks it, so copy them in by hand from the WordPress media library. The script lists the exact filenames.

When deploying, build on a machine that has the photos folder (or give your CI host the photos some other way). Otherwise the deployed site will show placeholders.

## Free-trial booking form

The booking sheet POSTs `FormData` (`class`, `when`, `name`, `phone`) to `PUBLIC_BOOKING_ENDPOINT`. Copy `.env.example` to `.env` and set it to any form backend, for example Formspree, Basin, Netlify Forms or your own API.

- **Not set, in dev:** it pretends the request succeeded and logs the request to the console.
- **Not set, in production:** it tells the visitor to call instead. It never shows a fake "Request sent".

## Deploy

`npm run build` produces a plain static site in `dist/`. Upload it to any static host, such as Netlify, Vercel, Cloudflare Pages or SiteGround.

Update `site` in `astro.config.mjs` if the domain changes. It's used for canonical URLs, Open Graph tags and the LocalBusiness schema.
