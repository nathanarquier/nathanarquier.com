/* ─── Nav: add .scrolled class on scroll ─────────────────────────────────── */
const nav = document.getElementById('nav');

const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Gradient: cursor parallax ─────────────────────────────────────────── */
const heroGradient = document.getElementById('heroGradient');
const blobs = heroGradient ? heroGradient.querySelectorAll('.hero__blob') : [];

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let rafId = null;

const lerp = (a, b, t) => a + (b - a) * t;

const animateBlobs = () => {
  currentX = lerp(currentX, targetX, 0.06);
  currentY = lerp(currentY, targetY, 0.06);

  blobs.forEach((blob, i) => {
    const depth = (i + 1) * 0.4; // each blob moves at a different depth
    const x = currentX * depth;
    const y = currentY * depth;
    blob.style.transform = `translate(${x}px, ${y}px)`;
  });

  rafId = requestAnimationFrame(animateBlobs);
};

document.addEventListener('mousemove', (e) => {
  // offset from center, mapped to ±30px range
  targetX = ((e.clientX / window.innerWidth) - 0.5) * 60;
  targetY = ((e.clientY / window.innerHeight) - 0.5) * 40;
}, { passive: true });

// Only run cursor parallax on desktop
if (window.matchMedia('(pointer: fine)').matches) {
  animateBlobs();
}

/* ─── Scroll reveals: Intersection Observer ─────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));
