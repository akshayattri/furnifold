# Furnifold Studio

A floor-planning prototype for apartments, houses, and individual rooms. Open the repository through a static server. From a GitHub Codespace, run `python -m http.server 8000` and open the forwarded port.

1. Enter the demo workspace.
2. Draw a measured plan, import a reference image, or open the furnished sample from Templates.
3. Drag a room tile onto the 2D plan or click it to enter exact dimensions and position. Select an existing room to move it or open its layout editor.
4. Open a room editor to add and size furniture. The whole-floor 3D preview uses the same furniture dimensions and placement.
5. Return to the floor plan and open **3D sandbox**. Drag the canvas to orbit, scroll to zoom, and right-drag to pan. Drag furniture from the catalog into a room or select an item and click to place it.

The prototype uses a demo session and browser storage. Production authentication and cloud storage are pending. The floor envelope is a planning boundary. Assigned room area sums the room rectangles. Furniture footprint totals sum solid items, including any overlaps or out-of-bounds placements flagged by the room editor. The 3D sandbox uses procedural furniture and loads a pinned Three.js dependency. It requires WebGL and a network connection for the module import.

The [original product brief](docs/Furnifold_Product_Brief.md) describes the single-room editor that this prototype extends. Use GitHub for source, assets, and documentation.

[3D sandbox architecture and research](docs/3D_Sandbox_Architecture.md)

[Project flow and visual system](docs/Project_Flow_and_Visual_System.md)

## Shared walls, doors and windows

Touching room edges now form shared wall segments, including partial edges. Select a room (or leave the whole floor selected) and use **Walls & openings → Add door / Add window** in either view. Pick a segment, set its offset and dimensions, and save. Offsets run left-to-right or top-to-bottom along the chosen segment. Doors support either hinge and swing direction; windows support sill height. Select the symbol in 2D, the frame or leaf in 3D, or its inspector button to edit or delete it.

Both views derive walls from the same rectangular footprints. Walls are 120 mm thick, centred on room boundaries, and 2.7 m high. Openings leave 100 mm at segment ends and between neighbours. Moving/resizing rooms or adding an adjacent room is rejected if it changes a segment carrying an opening; delete that opening first and recreate it on the resulting segment. Review furniture in each layout after structural changes. The room editor displays floor openings and checks door swings against furniture; edit shared structure from the floor plan. Legacy standalone rooms and their original door/window annotations are preserved.

Projects keep the existing `furnifold.studio.v1` storage key and room-layout keys. Optional `openings` and `structureRevision` fields are additive; older projects derive walls on load and need no destructive migration. Project data remains in browser storage, never in the repository.

## Validation

Run geometry and compatibility checks with `node --test tests/structure.test.mjs` (no dependencies). For browser checks, install Playwright as a development-only tool (`npm install --no-save --package-lock=false playwright@1.62.1` and `npx playwright install chromium`), serve the app on port 8000, and run `node tests/browser-smoke.cjs`. `FURNIFOLD_URL` overrides the URL and `CHROMIUM_PATH` selects a Chromium executable. The smoke test uses synthetic legacy projects in an isolated browser context and checks opening creation, editing, reload, real WebGL rendering, embedded room opening, layout preservation, orphan protection, and deletion.
