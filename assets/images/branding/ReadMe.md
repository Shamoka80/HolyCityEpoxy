# Branding Asset Guide

Use this folder for all Holy City Epoxy identity files (logos, marks, and favicon sources).

## Recommended file naming

- `holy-city-epoxy-logo-primary.svg` (full horizontal lockup for header and footer)
- `holy-city-epoxy-logo-stacked.svg` (stacked lockup for tighter spaces)
- `holy-city-epoxy-logo-mark.svg` (icon/mark only)
- `holy-city-epoxy-logo-primary-dark.svg` (for dark backgrounds)
- `holy-city-epoxy-logo-primary-light.svg` (for light backgrounds)

## Optional raster fallbacks

If SVG is not available from the source artwork, include:

- `holy-city-epoxy-logo-primary.png` (2x export)
- `holy-city-epoxy-logo-mark.png` (2x export)

## Intended placement

- **Header (`.brand` link in each page):** primary horizontal logo.
- **Footer heading area:** primary logo or stacked variant.
- **Browser/tab branding:** favicon and app icon set generated from the mark.

## Notes

- Keep filenames lowercase with hyphens.
- Keep artwork source files outside production deploy paths when possible (for example, `docs/branding-source/`).
- Prefer SVG for fast load and responsive clarity.
