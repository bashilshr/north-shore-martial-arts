// Concept 2 behaviour. Runs alongside site.ts, which already handles the booking sheet, kids
// level tabs, timetable filter, [data-reveal], smooth in-page links and the scrolled-nav flag.
// Everything here animates transform/opacity only and backs off under prefers-reduced-motion.

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const BASE = '/concept-2/';

/* ---------- Curtain: lift once fonts and the emblem are in, drop it again before leaving ---------- */
// The emblem stays on screen at least ~750ms so it is actually seen; never longer than 1.8s in total.
const lift = () => requestAnimationFrame(() => root.setAttribute('data-c2-ready', ''));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const emblem = document.querySelector<HTMLImageElement>('[data-c2-emblem]');
const emblemReady = emblem ? emblem.decode().catch(() => undefined) : Promise.resolve();
Promise.race([
  Promise.all([document.fonts?.ready ?? Promise.resolve(), emblemReady, wait(750)]),
  wait(1800),
]).then(lift);

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!a || a.target || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;
  if (url.pathname === location.pathname) return; // same page (hash links scroll instead)
  if (reduce.matches) return;
  e.preventDefault();
  setMenu(false);
  root.setAttribute('data-c2-leaving', '');
  setTimeout(() => { location.href = url.href; }, 620);
});
// Coming back via the back button restores the page from cache with the outro still down.
addEventListener('pageshow', (e) => { if (e.persisted) root.removeAttribute('data-c2-leaving'); });

/* ---------- Heading line reveals (hero headings are driven by the curtain instead) ---------- */
const lineIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('is-in'); lineIO.unobserve(e.target); }
  }
}, { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('[data-lines]').forEach((el) => { if (!el.closest('.c2-hero, .c2-split')) lineIO.observe(el); });

// Photos marked data-c2-zoom settle from a slight zoom as they come into view.
const zoomIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('is-zoomed'); zoomIO.unobserve(e.target); }
  }
}, { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('[data-c2-zoom]').forEach((el) => zoomIO.observe(el));

/* ---------- Mobile menu ---------- */
const burger = document.querySelector<HTMLButtonElement>('[data-c2-burger]');
function setMenu(open: boolean) {
  root.toggleAttribute('data-c2-menu', open);
  burger?.setAttribute('aria-expanded', String(open));
  burger?.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
}
burger?.addEventListener('click', () => setMenu(!root.hasAttribute('data-c2-menu')));
window.matchMedia('(min-width: 1001px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- Programs mega menu: hover intent on desktop, click/keyboard everywhere ---------- */
const nav = document.querySelector<HTMLElement>('[data-c2-nav]');
const megaTrigger = document.querySelector<HTMLButtonElement>('[data-c2-mega-trigger]');
const mega = document.querySelector<HTMLElement>('[data-c2-mega]');
if (nav && megaTrigger && mega) {
  let closeTimer = 0;
  const setMega = (open: boolean) => {
    clearTimeout(closeTimer);
    nav.toggleAttribute('data-mega', open);
    if (open) nav.dataset.mega = 'open';
    megaTrigger.setAttribute('aria-expanded', String(open));
  };
  const isOpen = () => nav.dataset.mega === 'open';
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  for (const el of [megaTrigger, mega]) {
    el.addEventListener('pointerenter', () => { if (hover.matches) setMega(true); });
    el.addEventListener('pointerleave', () => { if (hover.matches) closeTimer = window.setTimeout(() => setMega(false), 180); });
  }
  megaTrigger.addEventListener('click', () => setMega(!isOpen()));
  nav.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (!next || !(megaTrigger.contains(next) || mega.contains(next))) setMega(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (isOpen()) { setMega(false); megaTrigger.focus(); }
    setMenu(false);
  });
}

/* ---------- Scroll-linked effects: hero parallax, marquee words (one rAF per frame) ---------- */
const parallax = [...document.querySelectorAll<HTMLElement>('[data-c2-parallax]')].map((el) => ({ el, k: Number(el.dataset.c2Parallax) || 0 }));
const scrollX = [...document.querySelectorAll<HTMLElement>('[data-c2-scrollx]')].map((el) => ({ el, k: Number(el.dataset.c2Scrollx) || 0 }));
let ticking = false;
function frame() {
  ticking = false;
  if (reduce.matches) return;
  for (const { el, k } of parallax) {
    if (scrollY < innerHeight * 1.2) el.style.transform = `translate3d(0, ${(scrollY * k).toFixed(1)}px, 0)`;
  }
  for (const { el, k } of scrollX) {
    const box = el.parentElement!.getBoundingClientRect();
    if (box.bottom < -200 || box.top > innerHeight + 200) continue;
    // Track starts a little off to one side and slides the other way as the section passes.
    const travel = (innerHeight - box.top) * k;
    const start = k < 0 ? 0 : -el.scrollWidth / 2;
    el.style.transform = `translate3d(${(start + travel).toFixed(1)}px, 0, 0)`;
  }
}
const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
addEventListener('scroll', request, { passive: true });
addEventListener('resize', request);
reduce.addEventListener('change', () => {
  [...parallax, ...scrollX].forEach(({ el }) => { el.style.transform = ''; });
  request();
});
frame();

/* ---------- Count-up numbers ---------- */
const countIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    countIO.unobserve(e.target);
    const el = e.target as HTMLElement;
    const end = Number(el.dataset.c2Count);
    const pad = Number(el.dataset.pad) || 1;
    const show = (n: number) => { el.textContent = String(n).padStart(pad, '0'); };
    if (reduce.matches || !Number.isFinite(end)) { show(end); continue; }
    const t0 = performance.now(), dur = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      show(Math.round(end * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}, { threshold: 0.6 });
document.querySelectorAll('[data-c2-count]').forEach((el) => countIO.observe(el));

/* ---------- Card rails: native scroll + snap, mouse drag, arrows, progress bar ---------- */
function initRail(rail: HTMLElement) {
  const track = rail.querySelector<HTMLElement>('[data-c2-rail-track]')!;
  const bar = rail.querySelector<HTMLElement>('[data-c2-rail-bar]');
  const prev = rail.querySelector<HTMLButtonElement>('[data-c2-rail-prev]');
  const next = rail.querySelector<HTMLButtonElement>('[data-c2-rail-next]');
  const step = () => {
    const card = track.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0') : 300;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 1;
    const visible = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;
    // Thumb is `visible` wide (scaled from the left) and travels the rest of the bar.
    if (bar) bar.style.transform = `translateX(${p * (1 - visible) * 100}%) scaleX(${visible})`;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max - 2;
  };
  const behavior = (): ScrollBehavior => (reduce.matches ? 'auto' : 'smooth');
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: behavior() }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: behavior() }));
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  track.addEventListener('keydown', (e) => {
    if (e.target !== track) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: behavior() }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step(), behavior: behavior() }); }
  });

  // Mouse drag (touch already scrolls natively). A drag never opens the card under the pointer.
  let down = false, dragged = false, startX = 0, startScroll = 0, lastX = 0, lastT = 0, v = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; dragged = false; startX = lastX = e.clientX; startScroll = track.scrollLeft; lastT = performance.now(); v = 0;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!dragged && Math.abs(dx) < 6) return;
    if (!dragged) { dragged = true; track.classList.add('is-dragging'); }
    const now = performance.now();
    v = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX; lastT = now;
    track.scrollLeft = startScroll - dx;
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (!dragged) return;
    // Carry the flick a little, then let scroll-snap settle on a card.
    const fling = reduce.matches ? 0 : -v * 220;
    track.classList.remove('is-dragging');
    track.scrollBy({ left: fling, behavior: behavior() });
    const swallow = (ev: Event) => { ev.preventDefault(); ev.stopPropagation(); };
    track.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => track.removeEventListener('click', swallow, { capture: true }), 50);
  });
  track.addEventListener('dragstart', (e) => e.preventDefault());
  update();
  addEventListener('load', update);
}
document.querySelectorAll<HTMLElement>('[data-c2-rail]').forEach(initRail);

/* ---------- Kids slideshow: crossfade, autoplay, dots, swipe, hotspots ---------- */
function initShow(show: HTMLElement) {
  const slides = [...show.querySelectorAll<HTMLElement>('.c2-slide')];
  const dots = [...show.querySelectorAll<HTMLButtonElement>('[data-c2-show-dot]')];
  const counter = show.querySelector<HTMLElement>('[data-c2-show-n]');
  const DELAY = 7000;
  show.style.setProperty('--show-ms', `${DELAY}ms`);
  let index = 0, timer = 0, visible = false, held = false;

  const closeHotspots = () => show.querySelectorAll('[data-c2-hot]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  const go = (n: number) => {
    index = (n + slides.length) % slides.length;
    closeHotspots();
    slides.forEach((s, i) => {
      const on = i === index;
      s.toggleAttribute('data-active', on);
      s.toggleAttribute('inert', !on);
      s.setAttribute('aria-hidden', String(!on));
    });
    dots.forEach((d, i) => {
      // Re-insert the attribute so the progress animation restarts.
      d.removeAttribute('aria-current');
      if (i === index) { void d.offsetWidth; d.setAttribute('aria-current', 'true'); }
    });
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    schedule();
  };
  const playing = () => visible && !held && !reduce.matches && document.visibilityState === 'visible';
  function schedule() {
    clearTimeout(timer);
    show.classList.toggle('is-paused', !playing());
    if (playing()) timer = window.setTimeout(() => go(index + 1), DELAY);
  }
  const hold = (on: boolean) => { held = on; schedule(); };

  show.querySelector('[data-c2-show-prev]')?.addEventListener('click', () => go(index - 1));
  show.querySelector('[data-c2-show-next]')?.addEventListener('click', () => go(index + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  show.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold(true); });
  show.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hold(false); });
  show.addEventListener('focusin', () => hold(true));
  show.addEventListener('focusout', (e) => { if (!show.contains(e.relatedTarget as Node)) hold(false); });
  show.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }, { threshold: 0.4 }).observe(show);

  // Swipe on touch screens.
  let sx = 0, sy = 0;
  show.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  show.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // "+" hotspots: tap/click toggles the detail card; hovering with a mouse opens it.
  show.querySelectorAll<HTMLButtonElement>('[data-c2-hot]').forEach((b) => {
    const set = (open: boolean) => { closeHotspots(); b.setAttribute('aria-expanded', String(open)); };
    b.addEventListener('click', () => set(b.getAttribute('aria-expanded') !== 'true'));
    b.parentElement!.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(true); });
    b.parentElement!.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') set(false); });
  });

  go(0);
}
document.querySelectorAll<HTMLElement>('[data-c2-show]').forEach(initShow);

/* ---------- Call-back form (same endpoint and rules as the booking sheet) ---------- */
const callback = document.querySelector<HTMLFormElement>('[data-c2-callback]');
const callbackMsg = document.querySelector<HTMLElement>('[data-c2-callback-msg]');
const ENDPOINT = import.meta.env.PUBLIC_BOOKING_ENDPOINT as string | undefined;
const say = (text: string, tone: 'ok' | 'error' = 'ok') => {
  if (!callbackMsg) return;
  callbackMsg.textContent = text;
  callbackMsg.dataset.tone = tone;
};
callback?.addEventListener('input', () => say(''));
callback?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(callback);
  const name = String(data.get('name') || '').trim();
  const phone = String(data.get('phone') || '');
  if (!name || phone.replace(/\D/g, '').length < 8) { say('Add your name and a phone number so we can call you.', 'error'); return; }
  if (data.get('_gotcha')) return;
  const submit = callback.querySelector<HTMLButtonElement>('button[type=submit]')!;
  submit.disabled = true;
  try {
    if (ENDPOINT) {
      const res = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
    } else if (!import.meta.env.DEV) {
      throw new Error('No booking endpoint configured');
    } else {
      console.info('[call back] PUBLIC_BOOKING_ENDPOINT not set; simulating success in dev.', Object.fromEntries(data));
    }
    say(`Thanks ${name}, we'll call you soon.`);
    callback.reset();
  } catch {
    say("We couldn't send that just now. Please call (02) 8969 6703.", 'error');
  } finally {
    submit.disabled = false;
  }
});
