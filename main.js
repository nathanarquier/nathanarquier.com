/* ─── Utils ──────────────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;
const isDesktop = window.matchMedia('(pointer: fine)').matches;

/* ─── Nav: glass on scroll ───────────────────────────────────────────────── */
const nav = document.getElementById('nav');

const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Custom cursor ──────────────────────────────────────────────────────── */
const cursor     = document.getElementById('cursor');
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = -100, mouseY = -100;
let curX   = -100, curY   = -100;
let glowX  = -200, glowY  = -200;

if (isDesktop) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  /* Links and buttons: size up only */
  document.querySelectorAll('a, button, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });

  /* Cards and boxes: size up + glow halo */
  document.querySelectorAll('.card, .contact__block').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hovering', 'is-card-hovering');
      if (cursorGlow) cursorGlow.classList.add('is-active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hovering', 'is-card-hovering');
      if (cursorGlow) cursorGlow.classList.remove('is-active');
    });
  });
}

/* ─── Scene: blob parallax + hero content mouse drift + scroll parallax ──── */
const heroGradient = document.getElementById('heroGradient');
const blobs        = heroGradient ? heroGradient.querySelectorAll('.hero__blob') : [];
const bgBlobs      = document.querySelectorAll('.bg-blob');
const bgBlobsEl    = document.querySelector('.bg-blobs');
const heroContent  = document.querySelector('.hero__content');

let blobTargetX = 0, blobTargetY = 0, blobX = 0, blobY = 0;
let hueTarget = 0, hueCurrent = 0;
let contentTargetX = 0, contentTargetY = 0, contentX = 0, contentY = 0;
let heroScrollY = 0;

if (isDesktop) {
  document.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth)  - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;

    /* Blobs drift toward cursor */
    blobTargetX = nx * 80;
    blobTargetY = ny * 50;

    /* Subtle hue shift with cursor X */
    hueTarget = nx * 20;

    /* Hero text drifts very gently with cursor (depth illusion) */
    contentTargetX = nx * 14;
    contentTargetY = ny *  8;
  }, { passive: true });
}

window.addEventListener('scroll', () => {
  heroScrollY = window.scrollY;
}, { passive: true });

/*
 * Single rAF loop drives both the cursor follower and the scene parallax.
 * Two independent loops each get their own callback slot in the same frame
 * budget for no benefit — both need to run every frame anyway — so merging
 * them removes the redundant scheduling overhead of a second rAF callback.
 */
const tick = () => {
  if (isDesktop) {
    curX  = lerp(curX,  mouseX, 0.25);  /* fast — near-instant feel */
    curY  = lerp(curY,  mouseY, 0.25);
    glowX = lerp(glowX, mouseX, 0.07);  /* slow — trails behind for halo */
    glowY = lerp(glowY, mouseY, 0.07);

    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';

    if (cursorGlow) {
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top  = glowY + 'px';
    }

    blobX      = lerp(blobX,      blobTargetX,    0.05);
    blobY      = lerp(blobY,      blobTargetY,    0.05);
    hueCurrent = lerp(hueCurrent, hueTarget,      0.04);
    contentX   = lerp(contentX,   contentTargetX, 0.06);
    contentY   = lerp(contentY,   contentTargetY, 0.06);

    blobs.forEach((blob, i) => {
      const depth       = (i + 1) * 0.4;
      const scrollShift = heroScrollY * (i + 1) * 0.05;
      blob.style.transform = `translate(${blobX * depth}px, ${blobY * depth - scrollShift}px)`;
    });

    bgBlobs.forEach((blob, i) => {
      const depth = (i + 1) * 0.25;
      blob.style.transform = `translate(${blobX * depth}px, ${blobY * depth}px)`;
    });

    if (heroGradient) heroGradient.style.filter = `hue-rotate(${hueCurrent}deg)`;
    if (bgBlobsEl) bgBlobsEl.style.filter = `hue-rotate(${hueCurrent}deg)`;

    if (heroContent) {
      const scrollPull = heroScrollY * 0.12;
      heroContent.style.transform = `translate(${contentX}px, ${contentY - scrollPull}px)`;
    }
  } else {
    /* Mobile: scroll parallax only */
    if (heroContent) {
      heroContent.style.transform = `translateY(${-heroScrollY * 0.10}px)`;
    }
  }

  requestAnimationFrame(tick);
};
tick();

/* ─── Scroll reveals: Intersection Observer ──────────────────────────────── */
/*
 * will-change is set here, not in CSS, so the promotion hint only exists
 * while an element is actually mid-transition — dozens of permanently
 * promoted .reveal layers would waste compositor memory for elements that
 * are done animating (or haven't started) for the rest of the page's life.
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.willChange = 'opacity, transform';
        el.addEventListener('transitionend', () => {
          el.style.willChange = '';
        }, { once: true });
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Bg-blobs: pause once scrolled past #work, resume on scroll back up ── */
const workSection = document.getElementById('work');
if (workSection && bgBlobsEl) {
  const bgBlobsPauseObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        /* Not intersecting + above the viewport (negative top) means we've
           scrolled past it, rather than not having reached it yet. */
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        bgBlobsEl.classList.toggle('is-paused', scrolledPast);
      });
    },
    { threshold: 0 }
  );
  bgBlobsPauseObserver.observe(workSection);
}

/* ─── Positioning cards: JS-driven expand (per-card, not CSS :hover) ─────── */
document.querySelectorAll('.edge-card').forEach(card => {
  card.addEventListener('mouseenter', () => card.classList.add('is-expanded'));
  card.addEventListener('mouseleave', () => card.classList.remove('is-expanded'));
});

/* ─── Lumen: live user count badge (via get_lumen_user_count RPC) ───────── */
(async () => {
  const badge = document.getElementById('lumenUserBadge');
  if (!badge) return;

  const SUPABASE_URL      = 'https://inmxnwerojearlnyvbyy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubXhud2Vyb2plYXJsbnl2Ynl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMDIxNzUsImV4cCI6MjA5MjY3ODE3NX0.r6JBYFRaCweofjbPxMcD_9xmowWR6tuzai1lOUpb26M';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_lumen_user_count`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });

    if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
    const data = await res.json();

    if (typeof data !== 'number' || !Number.isFinite(data)) throw new Error('Unexpected RPC response shape');

    /* get_lumen_user_count runs COUNT(DISTINCT user_id) via SECURITY DEFINER,
       so a real 0 is a valid result here — only errors hide the badge. */
    badge.textContent = `${data} early users`;
    badge.hidden = false;
  } catch (err) {
    console.warn('Lumen user count unavailable:', err);
    badge.hidden = true; /* fail silently in the UI — never show a broken badge */
  }
})();
