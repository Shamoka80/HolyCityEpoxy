# Holy City Epoxy Static Site

Lightweight, static-first marketing site for a Charleston, SC residential epoxy and concrete coatings business.

## Stack
- Plain HTML pages for all public routes
- Shared CSS in `assets/css/styles.css`
- Minimal JavaScript in:
  - `assets/js/main.js` (navigation + gallery filtering)
  - `assets/js/estimate.js` (client-side consultative estimate range logic)

## Key Pages
- Home (`index.html`)
- About (`about.html`)
- Services (`services.html`)
- Gallery (`gallery.html`)
- Estimate (`estimate.html`)
- Service Area (`service-area.html`)
- Reviews (`reviews.html`)
- Contact (`contact.html`)
- Thank You (`thank-you.html`)

## Netlify Deployment Notes
- Static publish directory is repository root (`.`), configured in `netlify.toml`.
- `contact.html` and `estimate.html` forms are Netlify Forms compatible (`data-netlify="true"`, hidden `form-name`, honeypot field).
- Both forms submit to `/thank-you.html` for a lightweight confirmation flow.
