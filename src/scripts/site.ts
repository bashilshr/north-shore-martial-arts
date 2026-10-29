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

/* ---------- Programs carousel (drag + flick with spring settle) ---------- */
function initCarousel(vp: HTMLElement) {
  const track = vp.querySelector<HTMLElement>('[data-car-track]')!;
  const prev = document.querySelector<HTMLButtonElement>('[data-car-prev]');
  const next = document.querySelector<HTMLButtonElement>('[data-car-next]');
  const c = { x: 0, min: 0, down: false, dragging: false, startX: 0, originX: 0, pointerId: 0, hist: [] as [number, number][], raf: 0 };

  const bounds = () => { c.min = Math.min(0, vp.clientWidth - track.scrollWidth); };
  const apply = (x: number) => { c.x = x; track.style.transform = `translate3d(${x}px,0,0)`; };
  const rubber = (x: number) => {
    const k = 0.55, dim = vp.clientWidth || 800;
    if (x > 0) return (x * dim * k) / (dim + k * x);
    if (x < c.min) { const o = c.min - x; return c.min - (o * dim * k) / (dim + k * o); }
    return x;
  };
  const spring = (target: number, v0: number, zeta: number) => {
    cancelAnimationFrame(c.raf);
    if (reduceMotion.matches) { apply(target); return; }
    const w = (2 * Math.PI) / 0.4;
    let x = c.x, v = v0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000); last = now;
      const dx = x - target;
      v += (-w * w * dx - 2 * zeta * w * v) * dt;
      x += v * dt;
      if (Math.abs(dx) < 0.3 && Math.abs(v) < 5) { apply(target); return; }
      apply(x);
      c.raf = requestAnimationFrame(step);
    };
    c.raf = requestAnimationFrame(step);
  };
  let suppressClickUntil = 0;
  vp.addEventListener('click', (e) => {
    if (performance.now() < suppressClickUntil) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  const clamp = (x: number) => Math.max(c.min, Math.min(0, x));
  const by = (dir: number) => { bounds(); spring(clamp(c.x - dir * 394), 0, 1); };

  vp.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cancelAnimationFrame(c.raf);
    bounds();
    c.down = true; c.dragging = false; c.pointerId = e.pointerId;
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
    if (!c.dragging) { if (c.x > 0 || c.x < c.min) spring(clamp(c.x), 0, 1); return; }
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
    const target = clamp(projected);
    // A small bounce only after a real flick that lands inside the bounds.
    const zeta = Math.abs(v) > 400 && target === projected ? 0.8 : 1;
    spring(target, v, zeta);
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
    if (box.left < vpBox.left + 16) spring(clamp(c.x + (vpBox.left + 16 - box.left)), 0, 1);
    else if (box.right > vpBox.right - 16) spring(clamp(c.x - (box.right - vpBox.right + 16)), 0, 1);
  });

  prev?.addEventListener('click', () => by(-1));
  next?.addEventListener('click', () => by(1));
  window.addEventListener('resize', () => { bounds(); apply(clamp(c.x)); });
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
