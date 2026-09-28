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

// Track interactions in one place so links added later are covered too.
document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  const control = target?.closest('a[href], button');
  if (!control || typeof window.gtag !== 'function') return;

  let elementArea = 'page';
  if (control.closest('header')) elementArea = 'header';
  else if (control.closest('footer')) elementArea = 'footer';
  else {
    elementArea = control.closest('section')?.getAttribute('aria-labelledby')?.replace(/-title$/, '') || 'page';
  }

  let elementType = 'link';
  if (control.matches('.main-nav a')) elementType = 'menu_item';
  else if (control.tagName === 'BUTTON') elementType = 'button';
  else if (control.matches('.btn')) elementType = 'button_link';

  let label = control.getAttribute('aria-label') || control.textContent;
  if (control === navToggle) {
    label = control.getAttribute('aria-expanded') === 'true' ? 'Open navigation' : 'Close navigation';
  }

  const parameters = {
    element_area: elementArea,
    element_type: elementType,
    element_label: label.replace(/↗/g, '').replace(/\s+/g, ' ').trim(),
  };

  if (control.tagName === 'A') {
    const href = control.getAttribute('href');
    if (href.startsWith('#')) parameters.destination = href;
    else if (href.startsWith('mailto:')) parameters.destination = 'email';
    else if (href.startsWith('tel:')) parameters.destination = 'phone';
    else parameters.destination = control.hostname || 'other';
  }

  window.gtag('event', 'portfolio_click', parameters);
});
