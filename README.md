# Furnifold Studio

A floor-planning prototype for apartments, houses, and individual rooms. Open the repository through a static server. From a GitHub Codespace, run `python -m http.server 8000` and open the forwarded port.

1. Enter the demo workspace.
2. Create a project or explore the furnished sample apartment.
3. Set the rectangular floor envelope and add rooms. Drag them in the 2D plan or enter precise positions.
4. Open a room editor to add and size furniture. The whole-floor 3D preview uses the same furniture dimensions and placement.
5. Return to the floor plan and open the 3D preview. Rotate to see four angles.

The prototype uses a demo session and browser storage. Production authentication and cloud storage are pending. The floor envelope is a planning boundary. Assigned room area sums the room rectangles. Furniture footprint totals sum solid items, including any overlaps or out-of-bounds placements flagged by the room editor. The 3D preview uses simplified furniture volumes.

The [original product brief](docs/Furnifold_Product_Brief.md) describes the single-room editor that this prototype extends. Use GitHub for source, assets, and documentation.
