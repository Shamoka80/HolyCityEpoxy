# GitHub Repository File Blueprint
## Static-First Epoxy & Concrete Coatings Website
## HTML + CSS + Minimal JavaScript + Netlify

## 1) Document Purpose and Scope
This document defines the production repository blueprint for the Holy City Epoxy website codebase.

It is a **GitHub project documentation artifact** used for implementation control, onboarding, code review consistency, and long-term maintainability.

**This file is not intended to be stored in Netlify runtime storage, deployment outputs, or Netlify configuration-only locations.** It belongs in the repository under `/docs` and is version-controlled with the rest of the project.

Scope includes:
- repository structure and ownership by file/folder
- page-level responsibilities and SEO-safe routing
- shared style and behavior architecture
- estimator logic boundaries (`estimate.js`)
- asset organization standards
- form architecture (Netlify-compatible static forms)
- implementation boundaries and non-negotiable constraints for Codex and contributors

## 2) Project Context (Business + Delivery)
The site serves **Charleston, SC and surrounding communities** for local residential homeowners.

Core business context this repository must preserve:
- Primary services: **garage coatings, porch coatings, pool deck coatings**
- Positioning: **mid-market, quality-first, premium-value local specialist**
- Primary conversion emphasis: **equal priority on phone calls and estimate requests**
- Estimate flow includes **optional photo upload**
- Static-first architecture deployed on Netlify

## 3) Root Repository Structure (Authoritative)
Expected root structure:

```text
/
├── index.html
├── about.html
├── services.html
├── gallery.html
├── estimate.html
├── service-area.html
├── reviews.html
├── contact.html
├── thank-you.html
├── README.md
├── AGENTS.md
├── netlify.toml               # only when needed for deployment config
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   └── estimate.js
│   └── images/
│       ├── gallery/
│       ├── services/
│       ├── branding/
│       └── ...
└── docs/
    └── repository-file-blueprint.md
```

### Structure Rules
1. Marketing pages remain flat at root for simple static routing.
2. Shared assets remain in `/assets` only.
3. Documentation artifacts remain in `/docs`.
4. Netlify functions are excluded unless explicitly required later.

## 4) HTML Pages and Their Responsibilities
Each HTML file is a standalone, crawlable page with semantic structure, local SEO context, and clear CTAs.

- `index.html` (Home)
  - Primary value proposition and trust framing.
  - Fast path to both CTA actions: **Call Now** and **Get Estimate**.

- `about.html` (About)
  - Company story, quality standards, process credibility, and trust reinforcement.

- `services.html` (Services)
  - Service-specific details for garage, porch, and pool deck systems.
  - Scope, outcomes, and homeowner decision support.

- `gallery.html` (Gallery)
  - Visual proof by project type to support conversion.
  - Must remain lightweight and performant.

- `estimate.html` (Estimate)
  - Primary structured intake for a **price range** only.
  - Includes optional image upload and project qualification data.

- `service-area.html` (Service Area)
  - Defines Charleston-area coverage expectations.
  - Explains that a small travel fee may apply outside normal radius.

- `reviews.html` (Reviews)
  - Customer confidence and social proof for residential projects.

- `contact.html` (Contact)
  - General inquiry + scheduling form.
  - Reinforces dual conversion path: call and form.

- `thank-you.html` (Confirmation)
  - Post-submit acknowledgment for form flows.

## 5) Shared CSS and Shared JavaScript Responsibilities
### `/assets/css/styles.css`
Single shared stylesheet for global UI and responsive behavior.

Responsibilities:
- typography scale and spacing rhythm
- layout primitives and grid behavior
- buttons, cards, forms, alerts, section wrappers
- navigation and mobile responsiveness
- accessibility-friendly focus/interaction states

Boundary:
- Avoid page-inline style blocks unless absolutely necessary.
- Keep component patterns reusable across pages.

### `/assets/js/main.js`
Shared behavior script loaded across pages.

Responsibilities:
- global navigation behavior (e.g., mobile menu interactions)
- shared CTA interactions where applicable
- progressive enhancement only (site remains usable without JS)
- page-agnostic interactive utilities

Boundary:
- Do not place estimator pricing logic in `main.js`.
- Keep logic modular and defensive to avoid page-specific breakage.

## 6) `estimate.js` Purpose (Critical Control)
### `/assets/js/estimate.js`
Dedicated estimator script for consultative range guidance on `estimate.html`.

Responsibilities:
- compute **price range only** (never fixed quote)
- read estimator input fields (project type, size preset/custom sqft, indoor/outdoor, condition, finish, timeline, zip)
- maintain hidden estimate fields for Netlify form payload continuity
- show minimum-threshold messaging when computed range falls below project minimum
- surface travel-fee note logic based on service area context
- support optional photo upload as form field (form-level responsibility)

Boundary:
- estimator logic remains isolated from global scripts
- no server dependency by default (client-side JS first)
- no framework conversion or heavy estimator runtime introduction

## 7) Assets and Images Organization
### `/assets/images/`
Holds all image assets used by pages.

Recommended sub-organization:
- `assets/images/gallery/` → before/after and showcase images
- `assets/images/services/` → service-specific supporting visuals
- `assets/images/branding/` → logos, marks, identity assets
- additional folders by content domain, not by random upload date

Rules:
- use descriptive, SEO-friendly filenames
- prefer modern optimized formats when feasible
- preserve alt-text relevance in page markup
- avoid dumping images in root or mixed with scripts/styles

## 8) README.md and AGENTS.md Purposes
### `README.md`
Public technical onboarding guide for contributors.

Must cover:
- project purpose and architecture summary
- local development instructions
- deployment notes (Netlify static hosting)
- high-level file map and behavior overview
- form submission model and thank-you routing

### `AGENTS.md`
Execution policy and implementation constraints for autonomous coding agents (including Codex).

Must enforce:
- static-first architecture rules
- business constraints for estimator and service positioning
- quality gates (accessibility, responsiveness, SEO structure)
- prohibited frameworks/dependencies unless explicitly approved

## 9) Netlify Files: When Required vs Not Required
### `netlify.toml` (Only if needed)
Include only for explicit deployment configuration needs such as:
- publish directory definition
- redirects/headers
- function directory mapping

If defaults are sufficient and no custom behavior is needed, keep configuration minimal.

### `/netlify/functions` (Only if later required)
Do not create by default.

Allowed future use cases (if approved):
- lightweight server-side validation/enrichment
- webhook handling or secure tokenized integrations
- minimal backend logic not feasible client-side

Constraints:
- keep functions small, isolated, and purpose-specific
- do not migrate core site rendering to dynamic runtime
- maintain static-first rendering and routing behavior

## 10) File Interaction and Load Map
### Global interaction model
- HTML pages load shared CSS from `/assets/css/styles.css`.
- Most pages load shared JS from `/assets/js/main.js`.
- `estimate.html` additionally loads `/assets/js/estimate.js` for estimator-specific logic.

### Script load expectations
- `index.html` → `main.js`
- `about.html` → `main.js`
- `services.html` → `main.js`
- `gallery.html` → `main.js`
- `estimate.html` → `main.js` + `estimate.js`
- `service-area.html` → `main.js`
- `reviews.html` → `main.js`
- `contact.html` → `main.js`
- `thank-you.html` → `main.js`

### Runtime separation rule
- Shared behaviors in `main.js`
- Estimator-only behaviors in `estimate.js`
- No business pricing logic in HTML templates

## 11) Form Architecture (Two Primary Forms)
The repository maintains two primary Netlify-compatible forms:

1. **Estimate Request Form**
   - Location: `estimate.html`
   - Purpose: gather project details and return consultative range context.
   - Includes optional photo upload.

2. **Contact Form**
   - Location: `contact.html`
   - Purpose: general homeowner inquiries, scheduling, and follow-up requests.

Form standards:
- use static HTML form markup with Netlify-compatible attributes
- include honeypot field and hidden form name
- submit to `thank-you.html` confirmation route
- preserve accessibility and clear validation messages

## 12) Coding Rules by File Type
### HTML
- semantic landmarks (`header`, `main`, `section`, `footer`)
- accessible labels and heading hierarchy
- SEO-focused metadata per page
- clear, equal-emphasis CTAs (call + estimate)

### CSS
- centralized in shared stylesheet(s)
- mobile-first responsive patterns
- descriptive class naming and predictable structure
- no framework utility dependency injection

### JavaScript
- minimal, purposeful, progressive enhancement
- isolate page-specific logic in dedicated files
- comment non-trivial estimator logic clearly
- avoid unnecessary libraries

### Documentation
- keep operational docs in `/docs`
- write implementation boundaries in enforceable language
- update docs when structure/responsibilities change

## 13) Codex Implementation Boundaries (Must Not Introduce)
Codex and contributors must **not** introduce, unless explicitly approved later:
- React, Next.js, Vue, Nuxt, Astro, Svelte, Angular
- Tailwind, Bootstrap, or heavy UI frameworks
- bundler-first or SPA-only architecture rewrites
- unnecessary runtime dependencies or package sprawl
- backend/database coupling for baseline estimate flow

Codex must preserve:
- static-first architecture
- HTML + CSS + minimal JavaScript delivery model
- Netlify static deployment compatibility
- local Charleston-area business messaging and residential focus

## 14) Change-Control Checklist for Future Commits
Before merge, confirm:
1. Root structure remains consistent with this blueprint.
2. Script responsibilities are not blurred (`main.js` vs `estimate.js`).
3. Both primary forms remain functional and Netlify-compatible.
4. Call + estimate CTA parity is preserved across key pages.
5. No unapproved framework or heavy dependency was introduced.
6. Documentation stays in GitHub repository paths (`/docs`) and not in Netlify deployment-only locations.

---
**Owner:** Repository maintainers and implementation agents.

**Enforcement intent:** Keep this website lean, production-ready, maintainable, and aligned with Holy City Epoxy's Charleston-area residential growth strategy.
