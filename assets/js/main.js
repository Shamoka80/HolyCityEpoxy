// Handles the mobile menu toggle for lightweight navigation.
(function initMobileNavigation() {
  const menuButton = document.querySelector('[data-menu-button]');
  const navigation = document.querySelector('[data-primary-nav]');

  if (!menuButton || !navigation) {
    return;
  }

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
})();
