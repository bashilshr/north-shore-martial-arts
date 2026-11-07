// Extra data for the light "Apple design" concept (/concept/). Club content itself comes from site.ts.
import { NAV } from './site';

export const BASE = '/concept';
export const conceptHref = (slug: string) => `${BASE}/${slug}/`;

export const RED = '#b4261f';

/** Colour per program id and per kids level key (used for age labels and timetable times). */
export const COLORS: Record<string, string> = {
  kids: '#b4261f',
  kickboxing: '#1a5fb4',
  boxing: '#0f766e',
  selfdefence: '#b45309',
  pt: '#1d1d1f',
  minicubs: '#b45309',
  cubs: '#0f766e',
  junior: '#1a5fb4',
  senior: '#b4261f',
  teens: '#1d1d1f',
};

export const CONCEPT_NAV = NAV.map((n) => ({ ...n, href: `${BASE}${n.href}` }));

export const VALUE_NOTES = [
  { name: 'Courage', text: "Trying the kick you haven't landed yet, in front of the class." },
  { name: 'Respect', text: 'For instructors, partners and the space: bowing in and bowing out.' },
  { name: 'Integrity', text: 'Doing the full count when nobody is watching.' },
  { name: 'Loyalty', text: 'Showing up for your team, week after week.' },
];

export const HERO_IMAGE = 'fun-fresh-active-kids-2.jpg';
