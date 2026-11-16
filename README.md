# Furnifold

Furnifold is a browser-based space planner. Measure a room, place furniture at its real dimensions, and compare arrangements before buying or moving anything.

## Prototype

Open index.html through a static web server or GitHub Pages. The prototype uses browser-native JavaScript modules and has no build or install step. From a GitHub Codespace, a static server such as `python -m http.server 8000` can serve the repository root.

The prototype starts with a 420 × 360 cm bedroom and two sample alternatives. Try moving the chair away from the wardrobe or open Compare. Use New room to enter your measurements. This version keeps one room and its layouts in browser storage.

The room uses integer millimeters, with its origin at the inside top left, X increasing right and Y increasing down. Item position is the top-left of its rotated footprint. Clockwise rotation uses 90° increments. The prototype fixes the door hinge 200 mm from the left of the bottom wall and places the optional window on the top wall.

## Working from GitHub

This repository is the source of truth for code, assets, and documentation. Read the current branch before making changes and commit completed changes here. Use direct GitHub edits or a cloud environment when a local checkout is undesirable.

- [Product brief](docs/Furnifold_Product_Brief.md)
- `src/model.mjs` defines sample data and fit checks.
- `src/editor.mjs` handles editor state, rendering, and browser persistence.
