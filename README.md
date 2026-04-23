# Holy City Epoxy Static Site

Lightweight, static-first marketing site for a Charleston, SC residential epoxy and concrete coatings business.

## Stack
- Plain HTML pages for all public routes
- Shared CSS in `assets/css/styles.css`
- Minimal JavaScript in:
  - `assets/js/main.js` (navigation + gallery filtering)
  - `assets/js/estimate.js` (client-side consultative estimate range logic)
- On-page SEO remains static and framework-free (unique title tags, meta descriptions, canonical URLs, and Open Graph metadata per page)

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

## Structure
- `*.html`: semantic, accessible page templates with shared header/footer patterns.
- `assets/css/styles.css`: global responsive styles, form/layout components, and lightweight utility patterns.
- `assets/js/main.js`: shared mobile navigation, mobile CTA bar, and gallery filtering behavior.
- `assets/js/estimate.js`: client-side estimator range logic and hidden-field sync for Netlify form submissions.
- `scripts/generate-gallery-gifs.php`: local-only generator for before/after gallery GIFs (writes to `assets/images/generated/`).
- `netlify.toml`: publish configuration for static deployment at repository root.

## Gallery GIF Workflow (PR-safe)
- Generated GIF binaries are intentionally **not** committed in this repository workflow.
- Gallery supports generated GIFs when present, with static before/after fallback if GIFs do not exist.
- See `docs/gif-generation-workflow.md` for prerequisites, naming rules, commands, output path, and fallback behavior.

## Netlify Deployment Notes
- Static publish directory is repository root (`.`), configured in `netlify.toml`.
- `contact.html` and `estimate.html` forms are Netlify Forms compatible (`data-netlify="true"`, hidden `form-name`, honeypot field).
- Both forms submit to `/thank-you.html` for a lightweight confirmation flow.
- No build step is required. Deploy directly to Netlify as a static site.
