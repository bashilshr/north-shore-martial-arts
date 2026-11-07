// Motion for the light concept (/concept/). Runs alongside site.ts, which already handles the
// carousel (pinned scroll-through), reveals, tabs, timetable filter and booking sheet.
// Everything here animates transform/opacity only, and backs off under prefers-reduced-motion.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Pinned programs: size the section to its cards block (see .programs.is-pinned) ---------- */
const programsPin = document.querySelector<HTMLElement>('[data-programs-pin]');
const programs = programsPin?.closest<HTMLElement>('[data-programs]');
if (programsPin && programs) {
  new ResizeObserver(() => programs.style.setProperty('--pin-h', `${programsPin.offsetHeight}px`)).observe(programsPin);
}

/* ---------- Scroll progress line + photo parallax (one rAF per frame) ---------- */
const progress = document.querySelector<HTMLElement>('[data-progress]');
const parallax = [...document.querySelectorAll<HTMLElement>('[data-c-parallax]')];
// Hero collage columns: each drifts up at its own rate, so the fan opens as you scroll.
const drift = [...document.querySelectorAll<HTMLElement>('[data-drift]')].map((el) => ({ el, k: Number(el.dataset.drift) || 0 }));
let ticking = false;

function frame() {
  ticking = false;
  if (progress) {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  }
  if (reduce.matches) return;
  if (scrollY < innerHeight * 1.5) {
    for (const { el, k } of drift) el.style.transform = `translate3d(0, ${(-scrollY * k).toFixed(1)}px, 0)`;
  }
  for (const img of parallax) {
    const box = img.parentElement!.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) continue;
    // -1 when the frame is entering at the bottom, +1 when leaving at the top.
    const t = (innerHeight / 2 - (box.top + box.height / 2)) / (innerHeight / 2 + box.height / 2);
    img.style.transform = `translate3d(0, ${(t * 6).toFixed(2)}%, 0) scale(1.14)`;
  }
}
const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
addEventListener('scroll', request, { passive: true });
addEventListener('resize', request);
reduce.addEventListener('change', () => {
  parallax.forEach((img) => { img.style.transform = ''; });
  drift.forEach(({ el }) => { el.style.transform = ''; });
  request();
});
frame();

/* ---------- Count-up numbers ---------- */
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
const countIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    countIO.unobserve(e.target);
    const el = e.target as HTMLElement;
    const end = Number(el.dataset.count);
    if (reduce.matches || !Number.isFinite(end)) { el.textContent = String(end); continue; }
    const dur = 1100 + end * 20;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4); // ease-out quart: fast start, gentle landing
      el.textContent = String(Math.round(end * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  }
}, { threshold: 0.6 });
counters.forEach((el) => countIO.observe(el));

/* ---------- Values belt: fills with scroll, each value lights up as the belt reaches its knot ---------- */
const belt = document.querySelector<HTMLElement>('[data-belt]');
if (belt) {
  const track = belt.querySelector<HTMLElement>('.belt__track')!;
  const steps = [...belt.querySelectorAll<HTMLElement>('.belt__step')];
  const nodes = steps.map((s) => s.querySelector<HTMLElement>('.belt__node')!);
  const vertical = window.matchMedia('(max-width: 759px)');
  let fracs: number[] = [];

  // Where each knot sits along the belt (0..1). On phones the belt also has to span first → last knot.
  const measure = () => {
    if (vertical.matches) {
      const first = nodes[0].getBoundingClientRect(), last = nodes[nodes.length - 1].getBoundingClientRect();
      belt.style.setProperty('--track-h', `${last.top - first.top}px`);
    } else {
      belt.style.removeProperty('--track-h');
    }
    const t = track.getBoundingClientRect();
    fracs = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return vertical.matches
        ? (r.top + r.height / 2 - t.top) / Math.max(1, t.height)
        : (r.left + r.width / 2 - t.left) / Math.max(1, t.width);
    });
    // Belt colour changes halfway between knots.
    for (let i = 1; i < fracs.length; i++) {
      belt.style.setProperty(`--s${i}`, `${(((fracs[i - 1] + fracs[i]) / 2) * 100).toFixed(2)}%`);
    }
  };

  const update = () => {
    let p = 1;
    if (!reduce.matches) {
      const t = track.getBoundingClientRect();
      p = vertical.matches
        ? (innerHeight * 0.62 - t.top) / Math.max(1, t.height) // a reading line 62% down the screen
        : (innerHeight * 0.78 - t.top) / (innerHeight * 0.42); // fills over ~40% of a screen of scrolling
      p = Math.max(0, Math.min(1, p));
    }
    belt.style.setProperty('--p', p.toFixed(4));
    steps.forEach((s, i) => s.classList.toggle('is-on', p >= fracs[i] - 0.02));
  };

  let queued = false;
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } };
  const relayout = () => { measure(); update(); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  vertical.addEventListener('change', relayout);
  reduce.addEventListener('change', update);
  relayout();
}

/* ---------- Timetable: replay the stagger when the filter changes ---------- */
const filter = document.querySelector<HTMLElement>('[data-tt-filter]');
const week = document.querySelector<HTMLElement>('[data-tt-week]');
filter?.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('button') || !week) return;
  week.classList.remove('is-shuffled');
  void week.offsetWidth; // restart the CSS animation
  week.classList.add('is-shuffled');
});
