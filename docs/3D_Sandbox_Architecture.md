# Furnifold 3D sandbox architecture

## Engine decision

Use Three.js (MIT) for the editor. Its renderer, OrbitControls, and Raycaster give us the camera and picking capabilities we need while letting the app own dimensions, snapping, constraints, and editing history. Babylon.js (Apache 2.0) is a credible alternative with ArcRotateCamera and built-in drag behavior. It makes sense if we want a broader engine and its surrounding editor tooling. Both can render an apartment at real scale. CesiumJS has a geospatial engine designed for globes and 3D Tiles. Furnifold needs the camera gestures, with a local scene measured in metres.

- [Three.js and MIT license](https://github.com/mrdoob/three.js)
- [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)
- [Raycaster](https://threejs.org/docs/pages/Raycaster.html)
- [Babylon.js and Apache 2.0 license](https://github.com/BabylonJS/Babylon.js)
- [CesiumJS](https://cesium.com/platform/cesiumjs/)

## One plan in two views

Store source geometry in integer millimetres. The SVG view reads plan X/Y directly. Three.js maps plan X/Y to world X/Z and uses world Y for height. Keep furniture dimensions and orientation in the document. Raycast from the cursor to a horizontal floor plane, convert to plan coordinates, snap to 50 mm, and clamp the rotated footprint to the room. The same placement record feeds both views. The current implementation edits the active room layout, so a user's alternative layout stays independent.

On empty canvas, primary drag orbits, wheel zooms, and secondary drag pans. On a movable object, primary drag repositions it. Camera controls pause during object drag and resume on release or cancel. Catalog drag and click-to-place use the same placement logic. Fit checks for furniture collisions and clearance remain in the room editor. The 3D sandbox currently enforces the room boundary during placement and movement.

## Production plan and geometry

1. Replace rectangle-only rooms with vertex and edge IDs, shared wall segments, wall thickness, per-storey elevation, and openings anchored to wall offsets. Closing a loop defines a room. Use polygon operations for irregular boundaries and footprint intersections. Calculate occupied space from the union of footprints clipped to the room, and track collision and clearance separately. Evaluate [polygon-clipping](https://github.com/mfogel/polygon-clipping) for booleans. Wall adjacency, snapping, and openings still need an editor-specific graph.
2. Add shared selection, transform handles, configuration of wall height and openings, and undo/redo across both canvas views. Add cutaway, top-down, and walk-through camera presets. Preserve source dimensions through drag, rotation, and view changes.
3. Create measured furniture assets in [Blender](https://www.blender.org/about/license/) and ship curated GLB files with pivot, footprint, and license metadata. Use [glTF](https://www.khronos.org/gltf/) and [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html). Ship neutral procedural objects as fallbacks. Source textures or props with explicit redistribution rights, such as [Poly Haven CC0 assets](https://polyhaven.com/license), and retain provenance beside each asset. Use lazy loads and shared materials before adding mesh or texture compression as the catalog grows.
4. Move to TypeScript and a pinned [Vite](https://vite.dev/guide/) build so dependencies can be served with the app. Browser delivery is static for this vertical slice and lazy-loads pinned Three.js modules. Use GitHub for source and assets.
5. Add real authentication and private project storage using an open-source backend such as Supabase with Postgres. Enforce owner-scoped policies on project rows and asset buckets. Store revisions with each save, test that another signed-in user cannot read or mutate projects, and support explicit migration of demo projects. Software license costs and infrastructure costs are separate.
6. Verify desktop and touch gestures, view parity, reload persistence, locked furniture, overlapping rooms, UI behavior with WebGL disabled, low GPU memory, and project export. Use smoke tests in headless browsers and a manual review on hardware with WebGL.

## Visual direction

Use the navigation and project-gallery hierarchy of [OpenArt Studio](https://openart.ai/suite/home). Keep navigation, cards, inspector, and catalog white with quiet neutral borders. Use a neutral canvas background and reserve material color for the model and floor plan.
