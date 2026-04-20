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

// Handles lightweight filtering for gallery project cards by category.
(function initGalleryFilters() {
  const filterButtons = document.querySelectorAll('[data-gallery-filter]');
  const galleryCards = document.querySelectorAll('[data-gallery-category]');

  if (!filterButtons.length || !galleryCards.length) {
    return;
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedCategory = button.getAttribute('data-gallery-filter');

      filterButtons.forEach((currentButton) => {
        const isActive = currentButton === button;
        currentButton.classList.toggle('is-active', isActive);
        currentButton.setAttribute('aria-pressed', String(isActive));
      });

      galleryCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-gallery-category');
        const shouldShow = selectedCategory === 'all' || cardCategory === selectedCategory;
        card.setAttribute('data-gallery-hidden', String(!shouldShow));
      });
    });
  });
})();
