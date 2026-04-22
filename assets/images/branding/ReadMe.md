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

## Required dimensions

Use these exact dimensions so branding remains consistent when logo assets are wired into templates:

- `holy-city-epoxy-logo-primary.svg` / `.png`: **320 × 64 px** (header and footer lockup)
- `holy-city-epoxy-logo-stacked.svg` / `.png`: **200 × 200 px** (square lockup for tight layouts)
- `holy-city-epoxy-logo-mark.svg` / `.png`: **64 × 64 px** (icon only)
- `favicon-32x32.png`: **32 × 32 px**
- `favicon-16x16.png`: **16 × 16 px**
- `apple-touch-icon.png`: **180 × 180 px**

## Application locations

- Header brand area on every page (`a.brand` in page headers).
- Footer brand block on every page (site footer first section).
- Browser/tab/app icon references in `<head>` (favicon and touch icon links).

## Notes

- Keep filenames lowercase with hyphens.
- Keep artwork source files outside production deploy paths when possible (for example, `docs/branding-source/`).
- Prefer SVG for fast load and responsive clarity.
