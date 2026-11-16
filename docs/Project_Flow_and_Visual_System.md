# Furnifold project flow and visual system

## Whole home to room

1. Enter the workspace and open a project or choose a starting point.
2. **Draw a floor plan** starts with the measured floor envelope. **Import a floor plan** places a raster image under that same measured envelope. Crop the scan to its outside edges before importing and enter the real width and depth. **Use a template** opens a furnished example you can edit.
3. In **2D plan**, drag a room-type tile onto its intended top-left position. Clicking a tile opens the same setup with numerical coordinates. Name the room and enter its width and depth. The editor prevents overlaps and placement outside the envelope. Existing rooms can be moved on the canvas or edited through their dimensions.
4. Select a room from the plan or room list. Use **Edit room layout** for its furniture, dimensions, fit checks, and alternatives. Return to the project to see the room in context.
5. In **3D sandbox**, select a room and use **Focus in 3D** to bring it into view. Orbit to inspect the whole home, or drag furniture into the room to change its active layout. Edits appear in 2D. Use **Reset view** to refit the whole floor.

The current release supports one rectangular floor and rectangular room footprints. Imported images serve as tracing references. Future structural steps are irregular boundaries, shared walls, openings, and multiple storeys. Automatic vectorization is a separate workflow.

## OpenArt review

- [Studio Home](https://openart.ai/suite/home) and the [tool gallery](https://openart.ai/suite/home/ui) group destinations in a vertical rail and use distinct visual entries for creation actions.
- [Image](https://openart.ai/suite/image), [World](https://openart.ai/suite/world), and [Director](https://openart.ai/suite/director) give common navigation a consistent position while different workflows take over the main area.
- [Templates](https://openart.ai/suite/templates), Media, and Director Projects distinguish starting material and reusable assets from current work. The public routes do not expose every signed-in state or provide a complete design-token specification.

## Furnifold visual system

| Element | Treatment |
| --- | --- |
| Typeface | Inter for titles, labels, and values, with a system sans fallback. Chosen as a readable approximation of the reference. |
| Surfaces | White workspace and cards, near-white navigation and canvas, subtle neutral borders. The floor drawing and materials carry the color. |
| Text | Near-black primary, visible muted secondary. Dashboard heading 36 px minimum at desktop, helper text 14 px, labels 13–14 px. |
| Controls | Near-black primary buttons, neutral secondary buttons, visible focus ring, quiet filled active states. |
| Icons | Consistent 24-unit outline geometry, rounded caps and joins, original room symbols, accompanied by visible labels. |
| Layout | Product rail split into Workspace, Create, and Library. Dashboard offers three entry tiles and project previews. Room tiles are a compact two-column bank beside the 2D canvas. |
