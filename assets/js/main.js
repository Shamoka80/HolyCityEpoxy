// Shared lightweight navigation behavior and mobile CTA pattern.
(function initLayoutInteractions() {
  const menuButton = document.querySelector('[data-menu-button]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    const closeMenu = () => {
      siteNav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.addEventListener('click', event => {
      if (event.target instanceof HTMLAnchorElement) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    document.addEventListener('click', event => {
      const clickTarget = event.target;
      if (!(clickTarget instanceof Node)) {
        return;
      }

      const clickedInsideHeader = clickTarget.closest('.site-header');
      if (!clickedInsideHeader) {
        closeMenu();
      }
    });
  }

  // Mobile-only persistent CTA keeps call and estimate actions accessible.
  const ctaBar = document.createElement('aside');
  ctaBar.className = 'mobile-cta';
  ctaBar.setAttribute('aria-label', 'Quick contact actions');
  ctaBar.innerHTML =
    '<a class="button button-secondary" href="tel:+18435550199">Call Now</a>' +
    '<a class="button button-primary" href="estimate.html">Get Estimate</a>';

  document.body.append(ctaBar);
  document.body.classList.add('has-mobile-cta');
})();
