const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const siteHeader = document.querySelector('.site-header');
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const sectionLinks = new Map(
  navLinks.map((link) => [link.getAttribute('href').slice(1), link]),
);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function scrollToTarget(target) {
  const contentStart = target.querySelector('.section-kicker') || target;
  const headerHeight = siteHeader?.getBoundingClientRect().height || 0;
  const gap = window.innerWidth <= 760 ? 16 : 24;
  const top = contentStart.getBoundingClientRect().top + window.scrollY - headerHeight - gap;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
  });
}

function closeNav({ returnFocus = false } = {}) {
  if (!navToggle || !mainNav) return;

  mainNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation');
  document.body.classList.remove('nav-open');

  if (returnFocus) navToggle.focus({ preventScroll: true });
}

function openNav() {
  if (!navToggle || !mainNav) return;

  mainNav.classList.add('is-open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close navigation');
  document.body.classList.add('nav-open');
  mainNav.querySelector('a')?.focus({ preventScroll: true });
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav.classList.contains('is-open')) {
      closeNav({ returnFocus: true });
    }
  });

  document.addEventListener('click', (event) => {
    if (
      mainNav.classList.contains('is-open') &&
      !mainNav.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeNav();
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);

    if (!target) return;

    event.preventDefault();
    closeNav();
    scrollToTarget(target);
    history.replaceState(null, '', `#${id}`);
  });
});

window.addEventListener('load', () => {
  const id = window.location.hash.slice(1);
  const target = id ? document.getElementById(id) : null;

  if (target) {
    requestAnimationFrame(() => scrollToTarget(target));
  }
});

if ('IntersectionObserver' in window && sectionLinks.size > 0) {
  const observedSections = [...sectionLinks.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => link.removeAttribute('aria-current'));
      sectionLinks.get(visible.target.id)?.setAttribute('aria-current', 'true');
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.6] },
  );

  observedSections.forEach((section) => observer.observe(section));
}
