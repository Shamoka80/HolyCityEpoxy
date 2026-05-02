# Poplar Christian Learning Academy Website Rebuild

A lightweight, static website rebuild for Poplar Christian Learning Academy (PCLA), designed for GitHub Pages deployment using semantic HTML, responsive CSS, and minimal vanilla JavaScript.

## Project Structure

```
.
├── README.md
├── index.html
├── about.html
├── programs.html
├── locations.html
├── parent-resources.html
├── contact.html
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── main.js
    ├── images/
    │   ├── logo/
    │   ├── home/
    │   ├── about/
    │   ├── programs/
    │   └── locations/
    └── docs/
```

## Local Preview

Because this is a static site, you can open `index.html` directly in a browser, or run a lightweight local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## GitHub Pages Hosting

This project is GitHub Pages friendly: all links are relative, and there are no build steps or external runtime dependencies.

## Current Implementation Status

- ✅ Home page fully implemented with required content sections and CTAs.
- ✅ Shared global header/footer and responsive mobile navigation in place.
- ✅ Placeholder shells created for About, Programs, Locations, Parent Resources, and Contact.
- 🔜 Next build recommendation: fully implement `programs.html` with complete curriculum and age-group details.
