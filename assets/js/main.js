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
    '<a class="button button-secondary" href="tel:+18437903344">Call Now</a>' +
    '<a class="button button-primary" href="estimate.html">Get Estimate</a>';

  document.body.append(ctaBar);
  document.body.classList.add('has-mobile-cta');
})();

// Lightweight category filtering for the gallery page.
(function initGalleryFilters() {
  const filterContainer = document.querySelector('[data-gallery-controls]');
  const statusNode = document.querySelector('[data-gallery-status]');
  const galleryCards = Array.from(document.querySelectorAll('[data-gallery-grid] .gallery-card'));

  if (!filterContainer || !statusNode || galleryCards.length === 0) {
    return;
  }

  const filterButtons = Array.from(filterContainer.querySelectorAll('[data-filter]'));

  const updateFilter = filterValue => {
    filterButtons.forEach(button => {
      const isCurrent = button.getAttribute('data-filter') === filterValue;
      button.classList.toggle('is-active', isCurrent);
      button.setAttribute('aria-pressed', String(isCurrent));
    });

    let visibleCount = 0;

    galleryCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const shouldShow = filterValue === 'all' || category === filterValue;

      card.classList.toggle('is-hidden', !shouldShow);

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    const label = filterValue === 'all' ? 'all project categories' : filterValue.replace('-', ' ');
    statusNode.textContent = `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'} for ${label}.`;
  };

  filterContainer.addEventListener('click', event => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof HTMLButtonElement)) {
      return;
    }

    const filterValue = clickTarget.getAttribute('data-filter');
    if (!filterValue) {
      return;
    }

    updateFilter(filterValue);
  });
})();
