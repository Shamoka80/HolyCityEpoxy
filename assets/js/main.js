// Shared lightweight navigation behavior for mobile layouts.
(function initMobileMenu() {
  const menuButton = document.querySelector('[data-menu-button]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (!menuButton || !siteNav) {
    return;
  }

  menuButton.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
})();
