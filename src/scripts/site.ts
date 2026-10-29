// Client-side behaviour, ported from the v2 design's component logic.

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Missing images fall back to a labelled placeholder ---------- */
function markMissing(el: HTMLImageElement) { el.parentElement?.classList.add('is-missing'); }
document.querySelectorAll<HTMLImageElement>('[data-label] > img').forEach((el) => {
  if (el.complete && el.naturalWidth === 0) markMissing(el);
  else el.addEventListener('error', () => markMissing(el), { once: true });
});

/* ---------- Nav: compact + material once scrolled, hero parallax ---------- */
const parallax = document.querySelector<HTMLElement>('[data-parallax]');
function onScroll() {
  root.toggleAttribute('data-scrolled', window.scrollY > 24);
  if (parallax && !reduceMotion.matches && window.scrollY < window.innerHeight * 1.2) {
    parallax.style.transform = `translate3d(0,${window.scrollY * 0.25}px,0)`;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Fullscreen menu ---------- */
const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
function setMenu(open: boolean) {
  root.toggleAttribute('data-menu-open', open);
  if (!menuToggle) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? 'Close' : 'Menu';
}
menuToggle?.addEventListener('click', () => setMenu(!root.hasAttribute('data-menu-open')));
window.matchMedia('(min-width: 1040px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }
}, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

/* ---------- Smooth in-page scroll ---------- */
document.querySelectorAll<HTMLAnchorElement>('a[data-smooth]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector<HTMLElement>(a.hash);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.hash);
  });
});

/* ---------- Programs carousel (pinned scroll-through + drag/flick, spring settle) ---------- */
// When the section fits on screen it is pinned (CSS sticky): page scroll moves the cards
// sideways 1:1, and the page only carries on once the last card is in view. Dragging and
// the arrow buttons move the scroll position inside that pinned range, so cards and page
// can't drift apart. If the section doesn't fit (short screens) or motion is reduced,
// nothing is pinned and the cards move only by drag/buttons.
function initCarousel(vp: HTMLElement) {
  const track = vp.querySelector<HTMLElement>('[data-car-track]')!;
  const section = vp.closest<HTMLElement>('[data-programs]');
  const pin = section?.querySelector<HTMLElement>('[data-programs-pin]');
  const prev = document.querySelector<HTMLButtonElement>('[data-car-prev]');
  const next = document.querySelector<HTMLButtonElement>('[data-car-next]');
  const c = { x: 0, v: 0, zeta: 1, offset: 0, min: 0, pinned: false, down: false, dragging: false, startX: 0, originX: 0, pointerId: 0, hist: [] as [number, number][], raf: 0, last: 0 };

  const bounds = () => { c.min = Math.min(0, vp.clientWidth - track.scrollWidth); };
  const apply = (x: number) => { c.x = x; track.style.transform = `translate3d(${x}px,0,0)`; };
  const clamp = (x: number) => Math.max(c.min, Math.min(0, x));
  const rubber = (x: number) => {
    const k = 0.55, dim = vp.clientWidth || 800;
    if (x > 0) return (x * dim * k) / (dim + k * x);
    if (x < c.min) { const o = c.min - x; return c.min - (o * dim * k) / (dim + k * o); }
    return x;
  };

  // Pinned range starts when the section's top reaches the top of the screen.
  const pinStart = () => section!.getBoundingClientRect().top + window.scrollY;
  const scrolled = () => -section!.getBoundingClientRect().top; // px into the pinned range
  const target = () => (c.pinned ? clamp(-scrolled()) : clamp(c.offset));

  const step = (now: number) => {
    const dt = Math.min(0.032, (now - c.last) / 1000); c.last = now;
    const goal = target();
    const w = (2 * Math.PI) / 0.4;
    const dx = c.x - goal;
    c.v += (-w * w * dx - 2 * c.zeta * w * c.v) * dt;
    const x = c.x + c.v * dt;
    if (Math.abs(dx) < 0.3 && Math.abs(c.v) < 5) { apply(goal); c.v = 0; c.zeta = 1; c.raf = 0; return; }
    apply(x);
    c.raf = requestAnimationFrame(step);
  };
  const run = () => {
    if (c.down) return;
    if (reduceMotion.matches) { apply(target()); return; }
    if (!c.raf) { c.last = performance.now(); c.raf = requestAnimationFrame(step); }
  };
  const stop = () => { cancelAnimationFrame(c.raf); c.raf = 0; };
  // Show the track at x. Pinned: jump the scroll position within the pinned range (the
  // section is stuck there, so only the cards visibly move, easing over via the spring).
  const goTo = (x: number) => {
    if (c.pinned) window.scrollTo(0, pinStart() - clamp(x));
    else c.offset = clamp(x);
    run();
  };

  let lastW = 0, lastH = 0;
  const layout = () => {
    // Mobile browsers resize the viewport a little as the address bar shows/hides; ignore that.
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) { bounds(); run(); return; }
    lastW = innerWidth; lastH = innerHeight;
    if (section && pin) {
      section.classList.remove('is-pinned');
      section.style.removeProperty('--pin-dist');
    }
    bounds();
    const fits = !!pin && pin.scrollHeight + 60 + 8 <= innerHeight; // 60 = compact nav bar
    c.pinned = !!section && fits && c.min < 0 && !reduceMotion.matches;
    if (c.pinned) {
      section!.style.setProperty('--pin-dist', `${-c.min}px`);
      section!.classList.add('is-pinned');
      c.offset = 0;
    }
    run();
  };

  let suppressClickUntil = 0;
  vp.addEventListener('click', (e) => {
    if (performance.now() < suppressClickUntil) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  vp.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stop();
    bounds();
    c.down = true; c.dragging = false; c.v = 0; c.pointerId = e.pointerId;
    c.originX = e.clientX; c.startX = e.clientX - c.x;
    c.hist = [[e.clientX, performance.now()]];
  });
  vp.addEventListener('pointermove', (e) => {
    if (!c.down) return;
    // Only take over the pointer once it's clearly a drag, so taps stay normal link clicks.
    if (!c.dragging) {
      if (Math.abs(e.clientX - c.originX) < 6) return;
      c.dragging = true;
      vp.setPointerCapture(c.pointerId);
      vp.classList.add('is-dragging');
    }
    c.hist.push([e.clientX, performance.now()]);
    if (c.hist.length > 6) c.hist.shift();
    apply(rubber(e.clientX - c.startX));
  });
  const end = () => {
    if (!c.down) return;
    c.down = false;
    if (!c.dragging) { goTo(c.x); return; }
    c.dragging = false;
    vp.classList.remove('is-dragging');
    // Swallow the click that follows a drag so the card under the pointer doesn't open.
    suppressClickUntil = performance.now() + 80;
    const h = c.hist;
    let v = 0;
    if (h.length > 1) { const [x0, t0] = h[0], [x1, t1] = h[h.length - 1]; v = ((x1 - x0) / Math.max(1, t1 - t0)) * 1000; }
    if (Math.abs(v) < 60) v = 0;
    const d = 0.998;
    const projected = c.x + ((v / 1000) * d) / (1 - d);
    // A small bounce only after a real flick that lands inside the bounds.
    c.zeta = Math.abs(v) > 400 && clamp(projected) === projected ? 0.8 : 1;
    c.v = v;
    goTo(projected);
  };
  vp.addEventListener('pointerup', end);
  vp.addEventListener('pointercancel', end);

  // Keep keyboard-focused cards in view.
  vp.addEventListener('focusin', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.program-card');
    if (!card) return;
    bounds();
    vp.scrollLeft = 0;
    const vpBox = vp.getBoundingClientRect(), box = card.getBoundingClientRect();
    if (box.left < vpBox.left + 16) goTo(c.x + (vpBox.left + 16 - box.left));
    else if (box.right > vpBox.right - 16) goTo(c.x - (box.right - vpBox.right + 16));
  });

  prev?.addEventListener('click', () => { bounds(); goTo(target() + 394); });
  next?.addEventListener('click', () => { bounds(); goTo(target() - 394); });
  window.addEventListener('scroll', run, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('load', () => { lastW = 0; layout(); }); // card sizes settle once fonts load
  reduceMotion.addEventListener('change', () => { lastW = 0; layout(); });
  layout();
  apply(target());
}
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(initCarousel);

/* ---------- Testimonials: auto-advancing tabs ---------- */
function initTestimonials(section: HTMLElement) {
  const tabs = [...section.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')!)!);
  let i = 0, timer = 0;
  const show = (n: number) => {
    i = n;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === n));
      t.tabIndex = k === n ? 0 : -1;
      // Restart the progress bar animation.
      const fill = t.querySelector<HTMLElement>('.quote-tab__fill');
      if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
    });
    panels.forEach((p, k) => { p.hidden = k !== n; });
  };
  const start = () => { clearInterval(timer); timer = window.setInterval(() => show((i + 1) % tabs.length), 7000); };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => { show(k); start(); });
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = (i + d + tabs.length) % tabs.length;
      show(n); start(); tabs[n].focus();
    });
  });
  // Pause while the user is reading (hover / keyboard focus).
  const pause = () => { clearInterval(timer); section.classList.add('is-paused'); };
  const resume = () => { section.classList.remove('is-paused'); show(i); start(); };
  section.addEventListener('pointerenter', pause);
  section.addEventListener('pointerleave', resume);
  show(0);
  start();
}
document.querySelectorAll<HTMLElement>('[data-testimonials]').forEach(initTestimonials);

/* ---------- Kids level tabs (deep-linkable via #minicubs etc.) ---------- */
const levelTabs = document.querySelector<HTMLElement>('[data-level-tabs]');
if (levelTabs) {
  const tabs = [...levelTabs.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (key: string, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.key === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!)!;
      panel.hidden = !on;
      if (on) panel.classList.add('is-in');
      if (on && focus) t.focus();
    });
  };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => { select(t.dataset.key!); history.replaceState(null, '', '#' + t.dataset.key); });
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(k + d + tabs.length) % tabs.length].dataset.key!, true);
    });
  });
  const fromHash = () => {
    const key = location.hash.slice(1);
    if (tabs.some((t) => t.dataset.key === key)) select(key);
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
}

/* ---------- Timetable filter ---------- */
const ttFilter = document.querySelector<HTMLElement>('[data-tt-filter]');
const ttWeek = document.querySelector<HTMLElement>('[data-tt-week]');
if (ttFilter && ttWeek) {
  const buttons = [...ttFilter.querySelectorAll<HTMLButtonElement>('button')];
  buttons.forEach((b) => b.addEventListener('click', () => {
    const g = b.dataset.group!;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    ttWeek.querySelectorAll<HTMLElement>('.day').forEach((day) => {
      let visible = 0;
      day.querySelectorAll<HTMLElement>('.slot').forEach((s) => {
        const show = g === 'all' || s.dataset.group === g;
        s.hidden = !show;
        if (show) visible++;
      });
      day.querySelector<HTMLElement>('.day__empty')!.hidden = visible > 0;
    });
  }));
}

/* ---------- Booking sheet ---------- */
const sheet = document.getElementById('booking');
const form = sheet?.querySelector<HTMLFormElement>('[data-booking-form]');
let lastFocus: HTMLElement | null = null;
const ENDPOINT = import.meta.env.PUBLIC_BOOKING_ENDPOINT as string | undefined;

function openSheet(cls: string, when: string) {
  if (!sheet || !form) return;
  lastFocus = document.activeElement as HTMLElement;
  sheet.dataset.state = '';
  sheet.querySelector('[data-book-cls]')!.textContent = cls;
  sheet.querySelector('[data-book-when]')!.textContent = when;
  (form.elements.namedItem('class') as HTMLInputElement).value = cls;
  (form.elements.namedItem('when') as HTMLInputElement).value = when;
  setError('');
  setMenu(false);
  root.setAttribute('data-sheet-open', '');
  sheet.setAttribute('aria-hidden', 'false');
  setTimeout(() => (form.elements.namedItem('name') as HTMLInputElement).focus({ preventScroll: true }), 60);
}
function closeSheet() {
  if (!root.hasAttribute('data-sheet-open')) return;
  root.removeAttribute('data-sheet-open');
  sheet?.setAttribute('aria-hidden', 'true');
  lastFocus?.focus({ preventScroll: true });
}
function setError(msg: string) {
  const el = sheet?.querySelector('[data-form-error]');
  if (el) el.textContent = msg;
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const book = t.closest<HTMLElement>('[data-book]');
  if (book) { openSheet(book.dataset.cls!, book.dataset.when!); return; }
  if (t.closest('[data-sheet-close]')) closeSheet();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeSheet(); setMenu(false); }
  // Keep Tab focus inside the open sheet.
  if (e.key === 'Tab' && sheet && root.hasAttribute('data-sheet-open')) {
    const f = [...sheet.querySelectorAll<HTMLElement>('input:not([type=hidden]):not(.hp), button, a[href]')].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
form?.addEventListener('input', () => setError(''));

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const phone = String(data.get('phone') || '');
  if (!name || phone.replace(/\D/g, '').length < 8) {
    setError('Add your name and a phone number so we can confirm.');
    return;
  }
  if (data.get('_gotcha')) return;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  submit.disabled = true;
  try {
    if (ENDPOINT) {
      const res = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
    } else if (!import.meta.env.DEV) {
      throw new Error('No booking endpoint configured');
    } else {
      console.info('[booking] PUBLIC_BOOKING_ENDPOINT not set; simulating success in dev.', Object.fromEntries(data));
    }
    sheet!.querySelector('[data-done-msg]')!.textContent = `Thanks ${name}, we'll call you to confirm ${data.get('class')}, ${data.get('when')}.`;
    sheet!.dataset.state = 'sent';
    form.reset();
    sheet!.querySelector<HTMLElement>('.sheet__done [data-sheet-close]')?.focus();
  } catch {
    setError("We couldn't send that just now. Please call (02) 8969 6703 and we'll book you in.");
  } finally {
    submit.disabled = false;
  }
});
