# Holy City Epoxy Static Website

Lightweight, static-first marketing site for a Charleston, SC residential epoxy and concrete coatings business.

## Stack
- Plain HTML5 pages
- Custom CSS (no UI framework)
- Minimal vanilla JavaScript
- Netlify static hosting + Netlify Forms

## Site map
- `index.html` (Home)
- `about.html`
- `services.html`
- `gallery.html`
- `estimate.html`
- `service-area.html`
- `reviews.html`
- `contact.html`
- `thank-you.html`

## Project structure
- `assets/css/styles.css` shared responsive styles
- `assets/js/main.js` shared lightweight navigation + gallery behavior
- `assets/js/estimate.js` estimate range calculator logic
- `assets/images/` static image assets
- `netlify.toml` minimal publish configuration

## Netlify deployment notes
- Both forms are native HTML forms with Netlify attributes (`data-netlify`, `netlify`, honeypot, and hidden `form-name`).
- Form submissions post to `/thank-you`, which resolves to `thank-you.html` via Netlify pretty URLs.
- The estimate form supports optional photo upload via `multipart/form-data`.

## Local preview
Run a simple local server from repository root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
