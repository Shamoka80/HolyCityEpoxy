# Holy City Epoxy Static Website Scaffold

This repository contains the initial static-first scaffold for a Charleston, SC epoxy and concrete coatings marketing website.

## Tech Stack
- Plain HTML5 pages
- Custom CSS (no framework)
- Minimal vanilla JavaScript

## Site Map
- `index.html` (Home)
- `about.html`
- `services.html`
- `gallery.html`
- `estimate.html`
- `service-area.html`
- `reviews.html`
- `contact.html`

## Project Structure
- `assets/css/styles.css` shared responsive styles
- `assets/js/main.js` shared lightweight behavior
- `assets/js/estimate.js` estimator placeholder script
- `assets/images/` image directory placeholder

## Notes
- Shared header, primary navigation, and footer are scaffolded across all pages.
- Forms are scaffolded for Netlify static form handling (`data-netlify="true"`).
- Estimator logic intentionally remains placeholder-only in this phase.

## Local Preview
Because this is a static site, any simple local server works:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
