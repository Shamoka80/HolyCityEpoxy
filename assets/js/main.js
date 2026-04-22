document.addEventListener('DOMContentLoaded', () => {
  initLayoutInteractions();
  initGalleryFilters();
  initValidatedForms();
});

function initLayoutInteractions() {
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
      if (event.target instanceof HTMLAnchorElement) closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', event => {
      const clickTarget = event.target;
      if (!(clickTarget instanceof Node)) return;
      if (!clickTarget.closest('.site-header')) closeMenu();
    });
  }

  const ctaBar = document.createElement('aside');
  ctaBar.className = 'mobile-cta';
  ctaBar.setAttribute('aria-label', 'Quick contact actions');
  ctaBar.innerHTML =
    '<a class="button button-secondary" href="tel:+18437903344">Call Now</a>' +
    '<a class="button button-primary" href="estimate.html">Get Estimate</a>';

  document.body.append(ctaBar);
  document.body.classList.add('has-mobile-cta');
}

function initGalleryFilters() {
  const filterContainer = document.querySelector('[data-gallery-controls]');
  const statusNode = document.querySelector('[data-gallery-status]');
  const galleryCards = Array.from(document.querySelectorAll('[data-gallery-grid] .gallery-card'));

  if (!filterContainer || !statusNode || galleryCards.length === 0) return;

  const filterButtons = Array.from(filterContainer.querySelectorAll('[data-filter]'));

  const updateFilter = filterValue => {
    filterButtons.forEach(button => {
      const isCurrent = button.getAttribute('data-filter') === filterValue;
      button.classList.toggle('is-active', isCurrent);
      button.setAttribute('aria-pressed', String(isCurrent));
    });

    let visibleCount = 0;
    galleryCards.forEach(card => {
      const shouldShow = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) visibleCount += 1;
    });

    const label = filterValue === 'all' ? 'all project categories' : filterValue.replace('-', ' ');
    statusNode.textContent = `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'} for ${label}.`;
  };

  filterContainer.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('button[data-filter]');
    if (!(button instanceof HTMLButtonElement)) return;

    const filterValue = button.getAttribute('data-filter');
    if (filterValue) updateFilter(filterValue);
  });
}

function initValidatedForms() {
  const forms = Array.from(document.querySelectorAll('[data-validate-form]'));
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getErrorNode = input => {
    let errorNode = input.parentElement?.querySelector('.field-error');
    if (!errorNode) {
      errorNode = document.createElement('p');
      errorNode.className = 'field-error';
      errorNode.setAttribute('data-error-for', input.id || input.name);
      input.parentElement?.append(errorNode);
    }
    return errorNode;
  };

  const clearFieldError = input => {
    const errorNode = input.parentElement?.querySelector('.field-error');
    if (errorNode) errorNode.textContent = '';
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  };

  const setFieldError = (input, message) => {
    const errorNode = getErrorNode(input);
    if (errorNode) errorNode.textContent = message;
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
  };

  const validateInput = input => {
    clearFieldError(input);
    const value = input.value.trim();

    if (input.required && !value) {
      setFieldError(input, 'This field is required.');
      return false;
    }

    if (input.type === 'email' && value && !emailRegex.test(value)) {
      setFieldError(input, 'Enter a valid email address.');
      return false;
    }

    if (input.type === 'tel' && value && !/^\d{10}$/.test(value)) {
      setFieldError(input, 'Enter a 10-digit phone number using numbers only.');
      return false;
    }

    if (input.pattern && value) {
      const regex = new RegExp(`^${input.pattern}$`);
      if (!regex.test(value)) {
        setFieldError(input, 'Please follow the required format.');
        return false;
      }
    }

    return true;
  };

  forms.forEach(form => {
    const summary = form.querySelector('[data-form-summary]');
    const successNode = form.querySelector('[data-form-success]');
    const fields = Array.from(form.querySelectorAll('input, select, textarea')).filter(
      input => input.name && input.type !== 'hidden' && input.type !== 'file'
    );

    fields.forEach(input => {
      input.addEventListener('input', () => validateInput(input));
      input.addEventListener('blur', () => validateInput(input));
    });

    form.addEventListener('submit', async event => {
      const invalidFields = fields.filter(input => !validateInput(input));

      if (invalidFields.length) {
        event.preventDefault();
        if (summary) {
          summary.hidden = false;
          summary.textContent = `Please correct ${invalidFields.length} field${invalidFields.length === 1 ? '' : 's'} before submitting.`;
        }
        invalidFields[0].focus();
        return;
      }

      if (summary) {
        summary.hidden = true;
        summary.textContent = '';
      }

      event.preventDefault();
      const formData = new FormData(form);

      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });

        if (!response.ok) throw new Error('Request failed');

        if (successNode) {
          successNode.hidden = false;
          successNode.textContent =
            form.hasAttribute('data-estimate-form')
              ? 'Thanks! Your estimate request was received. Our team will follow up shortly.'
              : 'Thanks! Your message has been sent. We will respond within one business day.';
        }

        form.reset();
      } catch (error) {
        if (summary) {
          summary.hidden = false;
          summary.textContent = 'We could not send your form right now. Please try again or call us directly.';
        }
      }
    });
  });
}
