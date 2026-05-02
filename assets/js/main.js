// Mobile navigation toggle for smaller screens.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-navigation');

if (menuButton && nav) {
  const navLinks = nav.querySelectorAll('a');

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 820) {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  });
}
