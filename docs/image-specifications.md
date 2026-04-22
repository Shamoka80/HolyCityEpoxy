# Image and Logo Specification Matrix

This document lists exact image/logo dimensions currently required by the site placeholders and the estimate upload flow.

## 1) Branding logos

| Asset name | Exact dimensions | Format | Used in app |
| --- | ---: | --- | --- |
| `holy-city-epoxy-logo-primary` | 320 × 64 px | SVG (preferred), PNG fallback | Header brand area (`a.brand`) and footer branding block on all pages |
| `holy-city-epoxy-logo-stacked` | 200 × 200 px | SVG (preferred), PNG fallback | Footer or compact brand placements |
| `holy-city-epoxy-logo-mark` | 64 × 64 px | SVG (preferred), PNG fallback | Icon-only uses and social/avatar contexts |
| `favicon-32x32` | 32 × 32 px | PNG | Browser tab icon |
| `favicon-16x16` | 16 × 16 px | PNG | Browser tab icon fallback |
| `apple-touch-icon` | 180 × 180 px | PNG | iOS home screen icon |

## 2) Gallery photos (before/after placeholders)

All gallery placeholders are rendered at **1200 × 800 px** (3:2 ratio):

- `garage_before`
- `garage_after`
- `garage_workbench_before`
- `garage_workbench_after`
- `porch_before`
- `porch_after`
- `back_porch_before`
- `back_porch_after`
- `pool_deck_before`
- `pool_deck_after`
- `pool_lounge_before` *(still flagged by placeholder note in gallery)*
- `pool_lounge_after` *(still flagged by placeholder note in gallery)*

Used in:
- `gallery.html` gallery card figures
- `index.html` featured project proof cards

## 3) Service map graphics

| Asset name | Exact dimensions | Format | Used in app |
| --- | ---: | --- | --- |
| `service-area-map` | 1200 × 800 px | SVG preferred, PNG fallback | `service-area.html` and `index.html` service-area map sections |

## 4) User-uploaded estimate photo

| Upload field | Accepted formats | Recommended dimensions | Where uploaded |
| --- | --- | ---: | --- |
| `project_photo` (`#photo`) | JPG/JPEG, PNG | 1200 × 800 px (3:2) | Estimate page form (`estimate.html`) |

Notes:
- Upload is optional.
- Form now communicates accepted formats and preferred dimensions directly under the upload control.
