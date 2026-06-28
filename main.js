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
  const cursor     = document.getElementById('cursor');
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = -100, mouseY = -100;
  let curX   = -100, curY   = -100;
  let glowX  = -200, glowY  = -200;

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

  const tickCursor = () => {
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

    requestAnimationFrame(tickCursor);
  };
  tickCursor();
}

/* ─── Scene: blob parallax + hero content mouse drift + scroll parallax ──── */
const heroGradient = document.getElementById('heroGradient');
const blobs        = heroGradient ? heroGradient.querySelectorAll('.hero__blob') : [];
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

const tickScene = () => {
  if (isDesktop) {
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

    if (heroGradient) heroGradient.style.filter = `hue-rotate(${hueCurrent}deg)`;

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

  requestAnimationFrame(tickScene);
};
tickScene();

/* ─── Scroll reveals: Intersection Observer ──────────────────────────────── */
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
