# Gallery GIF Generation (Post-Merge, Local Only)

This repository is PR-safe and does **not** include generated binary GIF files.

Use this workflow locally after merge to generate gallery GIFs from existing before/after image pairs.

## Prerequisites

- PHP CLI 8+
- PHP `gd` extension enabled

Check availability:

```bash
php -m | rg '^gd$'
```

## Input naming rules

Place source images in:

- `assets/images/gallery/`

Use matching pair names:

- `*_before.*`
- `*_after.*`

Examples:

- `garage_before.jpeg` + `garage_after.jpeg` -> `garage.gif`
- `pool_deck_before.png` + `pool_deck_after.png` -> `pool_deck.gif`

## Generate GIFs

Run:

```bash
php scripts/generate-gallery-gifs.php
```

## Output location

Generated files are written to:

- `assets/images/generated/`

Output names are stable and derived from the pair stem:

- `<stem>.gif`

## Runtime behavior in gallery

- Gallery cards try to show generated GIFs at `assets/images/generated/<stem>.gif`.
- If GIFs are missing/unavailable, cards automatically fall back to existing static before/after image pairs.
- If the user has `prefers-reduced-motion: reduce`, animation is disabled and static before/after pairs are shown.

## Notes

- Source images are never overwritten.
- GIF generation is non-destructive.
- You can rerun the script any time to refresh generated outputs.
