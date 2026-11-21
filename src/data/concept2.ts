// Concept 2: a bold, colour-blocked design (italic uppercase type, marquee words, card rails,
// full-screen slideshow) previewed at /concept-2/. Content still comes from site.ts; this file
// only holds what is specific to the concept: its URLs, colour pairs and photo choices.
import type { Program } from './site';

export const C2 = '/concept-2/';
export const c2Href = (path = '') => `${C2}${path.replace(/^\//, '')}`;
export const c2Program = (p: Program) => c2Href(`${p.slug}/`);

/** Colour pairs: a deep block colour, the light text colour that sits on it, and a darker shade. */
export interface Tone { bg: string; fg: string; deep: string }
const MAROON: Tone = { bg: '#640021', fg: '#f0c6e6', deep: '#4c0019' };
const TEAL: Tone = { bg: '#005158', fg: '#c0f3de', deep: '#004349' };
const NAVY: Tone = { bg: '#002c49', fg: '#9ff3ff', deep: '#001f35' };
const OCHRE: Tone = { bg: '#4a3000', fg: '#f6cf7d', deep: '#382400' };
const CHARCOAL: Tone = { bg: '#262626', fg: '#ececec', deep: '#1a1a1a' };

/** Tone per program id and per kids level key. */
export const TONES: Record<string, Tone> = {
  kids: MAROON,
  kickboxing: TEAL,
  boxing: NAVY,
  selfdefence: OCHRE,
  pt: CHARCOAL,
  minicubs: OCHRE,
  cubs: TEAL,
  junior: NAVY,
  senior: MAROON,
  teens: CHARCOAL,
};
export const toneStyle = (t: Tone) => `--bg:${t.bg};--fg:${t.fg};--deep:${t.deep}`;

export const HERO_PHOTO = 'girls-kicking-high-029.jpg';

/** Kids slideshow: a photo per level and where the "+" hotspot sits on it (percent of the slide). */
export const KIDS_SLIDES: Record<string, { file: string; x: number; y: number }> = {
  minicubs: { file: 'childrens-martialarts-1.jpg', x: 42, y: 34 },
  cubs: { file: 'kids-martial-arts-lined-up-016.jpg', x: 55, y: 40 },
  junior: { file: 'girls-kicking-high-029.jpg', x: 62, y: 28 },
  senior: { file: 'kids-group-204.jpg', x: 56, y: 38 },
};
