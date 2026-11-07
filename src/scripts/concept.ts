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

/* ---------- Fighter card: tilt toward the pointer, foil sheen + glare follow it ---------- */
document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let raf = 0;
  card.addEventListener('pointermove', (e) => {
    if (!fine.matches || reduce.matches) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; // 0..1
      card.style.setProperty('--ry', `${((x - 0.5) * 18).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      card.classList.add('is-tilting');
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf);
    card.classList.remove('is-tilting'); // eases back flat via the CSS transition
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

/* ---------- Footer tiles: a soft glow that follows the pointer ---------- */
document.querySelectorAll<HTMLElement>('[data-glow]').forEach((tile) => {
  tile.addEventListener('pointermove', (e) => {
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--gx', `${e.clientX - r.left}px`);
    tile.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
});

/* ---------- Footer map: click to interact (so it never traps the page scroll) ---------- */
document.querySelectorAll<HTMLElement>('[data-map]').forEach((map) => {
  const frame = map.querySelector('iframe');
  map.querySelector('[data-map-unlock]')?.addEventListener('click', () => {
    map.classList.add('is-live');
    frame?.removeAttribute('tabindex');
    frame?.focus();
  });
});

/* ---------- Copy address ---------- */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const label = btn.querySelector<HTMLElement>('[data-copy-label]');
  const original = label?.textContent ?? '';
  let timer = 0;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy || '');
      btn.classList.add('is-done');
      if (label) label.textContent = 'Copied ✓';
    } catch {
      if (label) label.textContent = btn.dataset.copy || original; // clipboard blocked: show it to copy by hand
    }
    clearTimeout(timer);
    timer = window.setTimeout(() => { btn.classList.remove('is-done'); if (label) label.textContent = original; }, 2200);
  });
});

/* ---------- Footer: the next three classes from now, in the club's time zone ---------- */
const nextList = document.querySelector<HTMLElement>('[data-next]');
if (nextList) {
  type Slot = { d: number; start: number; time: string; note: string; cls: string; when: string };
  const slots: Slot[] = JSON.parse(nextList.dataset.sessions || '[]');
  const WEEK = 7 * 1440;
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // "Now" in Sydney as minutes since Monday 00:00, whatever the visitor's own time zone.
  const sydneyNow = () => {
    const parts = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const day = Math.max(0, DAY_NAMES.indexOf(get('weekday').slice(0, 3)));
    return day * 1440 + Number(get('hour')) * 60 + Number(get('minute'));
  };

  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

  let lastKey = '';
  const render = () => {
    const now = sydneyNow();
    const upcoming = slots
      .map((s) => ({ s, wait: (s.d * 1440 + s.start - now + WEEK) % WEEK || WEEK }))
      .sort((a, b) => a.wait - b.wait)
      .slice(0, 3);
    const key = upcoming.map(({ s, wait }) => s.when + Math.floor((now % 1440 + wait) / 1440)).join('|');
    if (key === lastKey) return; // only redraw (and re-animate) when the list actually changes
    lastKey = key;
    nextList.innerHTML = upcoming.map(({ s, wait }, i) => {
      const dayOffset = Math.floor((now % 1440 + wait) / 1440);
      const label = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tmrw' : DAY_NAMES[s.d];
      return `<li style="--i:${i}"><button class="next__row" type="button" data-book data-cls="${esc(s.cls)}" data-when="${esc(s.when)}">`
        + `<span class="next__day${dayOffset === 0 ? ' is-today' : ''}">${label}</span>`
        + `<span class="next__info"><strong>${esc(s.cls)}</strong><small>${esc(s.time)}${s.note ? ' · ' + esc(s.note) : ''}</small></span>`
        + `<span class="next__go" aria-hidden="true">Book</span></button></li>`;
    }).join('');
    nextList.classList.add('is-live');
  };
  render();
  setInterval(render, 60_000);
}

/* ---------- Testimonial thread: typing… → message, one after another, then the visitor's reply ---------- */
const chat = document.querySelector<HTMLElement>('[data-chat]');
if (chat) {
  const msgs = [...chat.querySelectorAll<HTMLElement>('.chat__msg')];
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const showAll = () => msgs.forEach((m) => { m.classList.remove('is-typing'); m.classList.add('is-shown', 'is-delivered'); });

  const play = async () => {
    for (const m of msgs) {
      const mine = m.classList.contains('chat__msg--me');
      if (!mine) {
        m.classList.add('is-typing');
        // Longer quotes "type" a little longer, within reason.
        const len = m.querySelector('.chat__bubble')?.textContent?.length ?? 80;
        await wait(Math.min(1500, 650 + len * 4));
        m.classList.remove('is-typing');
      } else {
        await wait(500);
      }
      m.classList.add('is-shown');
      if (mine) { await wait(700); m.classList.add('is-delivered'); }
      await wait(mine ? 0 : 450);
    }
  };

  if (reduce.matches) showAll();
  else {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      play();
    }, { threshold: 0.35 });
    io.observe(chat);
  }
}
