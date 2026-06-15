/* ─── Utils ──────────────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;
const isDesktop = window.matchMedia('(pointer: fine)').matches;

/* ─── Nav: glass on scroll ───────────────────────────────────────────────── */
const nav = document.getElementById('nav');

const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Custom cursor ──────────────────────────────────────────────────────── */
if (isDesktop) {
  const cursor = document.getElementById('cursor');
  let mouseX = -100, mouseY = -100;
  let curX    = -100, curY   = -100;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const tickCursor = () => {
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(tickCursor);
  };
  tickCursor();

  /* Scale up on interactive elements */
  document.querySelectorAll('a, button, .card, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
}

/* ─── Gradient blobs: lerped cursor parallax + hue-rotate shift ──────────── */
if (isDesktop) {
  const heroGradient = document.getElementById('heroGradient');
  const blobs = heroGradient ? heroGradient.querySelectorAll('.hero__blob') : [];

  let blobTargetX = 0, blobTargetY = 0;
  let blobX = 0, blobY = 0;
  let hueTarget = 0, hueCurrent = 0;

  document.addEventListener('mousemove', (e) => {
    /* Blobs move toward cursor — offset from centre scaled to ±40/25px */
    blobTargetX = ((e.clientX / window.innerWidth)  - 0.5) * 80;
    blobTargetY = ((e.clientY / window.innerHeight) - 0.5) * 50;

    /* Subtle hue-rotate: cursor X maps to ±10 degrees */
    hueTarget = ((e.clientX / window.innerWidth) - 0.5) * 20;
  }, { passive: true });

  const tickBlobs = () => {
    blobX      = lerp(blobX,      blobTargetX, 0.05);
    blobY      = lerp(blobY,      blobTargetY, 0.05);
    hueCurrent = lerp(hueCurrent, hueTarget,   0.04);

    blobs.forEach((blob, i) => {
      const depth = (i + 1) * 0.4;
      blob.style.transform = `translate(${blobX * depth}px, ${blobY * depth}px)`;
    });

    if (heroGradient) {
      heroGradient.style.filter = `hue-rotate(${hueCurrent}deg)`;
    }

    requestAnimationFrame(tickBlobs);
  };
  tickBlobs();
}

/* ─── Scroll reveals: Intersection Observer ──────────────────────────────── */
/*
 * CSS handles direction (data-dir="left"|"right") and the spring curve.
 * JS just toggles .is-visible once the element enters the viewport.
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
