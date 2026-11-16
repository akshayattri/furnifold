# Furnifold Product Brief

**Product** · A browser-based space planning studio for real rooms  
**Working name** · Furnifold  
**Version** · 0.1 · November 2026  
**Purpose** · Product definition, release priorities, and handoff for Codex

## 1. Product definition

Furnifold helps people plan, furnish, and rework their interiors before they spend money or move heavy furniture. Start with a room you can measure or a sample room you can play with. Add furniture at its actual dimensions, arrange it on a to-scale plan, and compare alternatives. Furnifold can suggest arrangements around the pieces and preferences you want to preserve. You can check each option for fit, preview how the room feels, and share it with someone who needs to weigh in.

**Positioning** · Plan what fits. See how it feels.

**Product decision** · Launch as a self-serve consumer web app. Lead with the measurable problem of furnishing a small or awkward room. Reuse the same project model for homeowners, shared households, and eventually independent designers. Make the room editor a place people can experiment even when they have nothing to buy.

### Who uses it and when

| Audience | Trigger | What they need | Priority |
| --- | --- | --- | --- |
| Renters and people moving | A move, new rental, or a cramped room | Fit belongings they own, avoid unsuitable purchases, try changes without touching the property | Launch |
| Homeowners | New furniture, a room refresh, or changing how a room is used | Test alternatives and coordinate rooms over time | Launch with the same room tools |
| Partners and roommates | Shared purchase or disagreement over a setup | Compare options and agree on a layout from a simple link | Sharing follows the editor |
| Interior designers and home organizers | Presenting choices to multiple clients | Repeatable projects, feedback, and presentation exports | Pro expansion |
| Casual creators | They enjoy experimenting with interiors | Open a furnished sample, remix it, and explore quickly | Launch through sample rooms |

The rental angle should show up as defaults and templates. Treat walls, doors, windows, and built-in fixtures as fixed in a layout. Preserve the furniture someone already owns. Avoid introducing a separate renter product or requiring people to identify as renters before they can start.

## 2. What makes it worth using

People should be able to answer five questions in a single project.

1. **Will this fit?** Enter a wardrobe’s real size and see what happens to the door swing, walkway, and usable space in front of it.
2. **What can I do with what I own?** Reuse a bed, desk, or sofa from a project inventory. Lock pieces that must stay where they are and try moving the rest.
3. **How else could I use this room?** Try a study nook, guest setup, or more open arrangement without losing the current version.
4. **How will it feel?** Switch from a measured plan to a furnished top-down view. Later, orbit the same scene in 3D and preview different finishes.
5. **Can we agree on it?** Share two comparable options with clear differences in circulation, pieces used, and estimated spend when prices are known.

### Market context and the proposed wedge

RoomFit already offers measured layouts, clearance checks, arrangement comparisons, and budgeting. RoomSketcher offers 3D walkthroughs, and IKEA Kreativ lets people scan a space and experiment with furnishings. Treat these as evidence of an established category. Furnifold’s proposed focus is the combination of **reuse-first planning, fast experimentation with verified constraints, and a visually polished room view**. The first validation question is whether that combination makes a real furniture decision easier. It is a product hypothesis.

## 3. The core experience

### A room in the first session

1. Home offers **Plan my room** and **Try a sample**. Sample rooms include a compact bedroom, studio living area, and home office. Each includes a furnished option users can duplicate and edit.
2. A short setup asks for room shape, units, and inside measurements. Users can skip door and window placement initially. The editor asks for missing openings when a check or request depends on them.
3. The editor opens at a comfortable zoom with a room outline, dimensions, and an obvious **Add furniture** action. Users add a generic object or enter a custom size from a retail listing or tape measure.
4. As an item moves, the plan shows local warnings for overlap, boundary, door swing, and any configured clearance. Users can inspect a warning and jump to the affected area.
5. Users save the current arrangement, duplicate an option, or request alternatives. The room structure stays shared across layout versions. Each version keeps its own furniture placement and appearance.
6. **Compare** shows two layouts at the same scale and orientation. Users choose a preferred layout and switch it to a furnished view. Sharing can be introduced after local comparison works.

### Reference scenario for the prototype

A renter moves into a 4,200 × 3,600 mm bedroom with a desk, bed, and wardrobe. The desk stays near the window. The wardrobe needs space in front for its doors, and a hinged room door opens inward. Start with a deliberately awkward arrangement. Show the wardrobe clearance issue on the plan, generate or select an alternate, compare both options, then open the furnished preview. Include a second example where keeping an oversized piece makes a request infeasible. When building the sample, store actual wall, opening, and furniture dimensions and verify both scenarios through the geometry checks.

## 4. Feature scope and release order

| Release | Include | Why |
| --- | --- | --- |
| **V0 · Codex prototype** | Sample rooms, manual setup, 2D edit, owned furniture, measurements, fit checks, layout duplication, compare, furnished top-down view, local persistence | Validate the end-to-end workflow with real interactions and minimal operating cost |
| **V1 · Public beta** | Accounts and sync, room lists within a project, reuse furniture across rooms via inventory, verified layout suggestions, private view links, PNG export, mobile viewing | Make the workflow practical for real moves, purchases, and repeat use |
| **V1.1 · Visual expansion** | Simple orbitable 3D from the same scene, material swaps, budget and candidate purchase list, comments on shared layouts | Help users picture the result and make a joint decision |
| **Later experiments** | Traced floor plan imports, L-shaped/custom rooms, optional photo style previews, multi-room overview and accurate apartment geometry, planner workspaces, guest approval, moving-path checks | Pursue when observed user behavior supports the added complexity |

### Room creation and navigation

- **V0 room setup:** rectangular shape, metric and imperial display, one floor, editable doors and windows snapped to walls. The editor starts with resizing through numeric inputs. Users can update a room after furnishing it. Show which layouts need review after structural edits.
- **Project model:** a project represents a home or client job. A project owns its rooms and inventory. A room can have several layout options. Support viewing one room at a time in V0. In V1, provide a room gallery and quick room switcher. A whole-home plan depends on explicit room geometry and connections.
- **Experiment mode:** start from a real room or remix a template. Duplicate a layout before changing it. A **Current setup** option can act as the baseline. A **Preferred** label belongs to one layout per room.

### Editor and furniture

- Drag, rotate in 90° steps, snap to grid, duplicate, delete, lock, and use keyboard nudging. Numeric size and position controls give a precise alternative to dragging. Use undo and redo for edits in the current session.
- Start with a small set of useful categories such as beds, sofas, desks, chairs, tables, storage, and rugs. Each item has editable width and depth, with optional height for future 3D. A custom item can be a simple outline with a user-defined name.
- Keep the states **Owned**, **Considering**, and **Purchased** for purchase planning. V0 can treat these as item attributes and V1.1 can attach manual prices, retail links, currency, and a list of remaining purchases. Show known costs and items missing a price separately.
- In V1, inventory items can be placed in competing layouts of the same room freely. A preferred plan should flag when the same owned piece is allocated to two rooms. It should support explicitly tracking two identical items.

### Viewing and sharing

- **Plan** shows outlines, dimensions, openings, selection, and issues. **Furnished** uses the same geometry and scale with top-down furniture, floor finishes, and a cleaner presentation. **3D** is a later orbitable scene derived from the same data, with adjustable camera and basic materials.
- **Compare** preserves camera scale and shows a concise summary of warnings, locked items kept, and any missing furniture per option. Add price comparisons when budget data exists. Clicking a warning shows its location.
- For V1 sharing, create a revocable view-only snapshot link for specific chosen options. Display the snapshot date. Editing the source project should leave the shared snapshot stable until the owner updates it. Allow recipients to switch layouts on mobile. Add commenting and named approvals separately.

### Feature bets to test after launch

| Idea | Problem it addresses | Earliest useful form |
| --- | --- | --- |
| Furniture fit test | A listing looks good but may be too large | Paste a product link as a reference and enter the dimensions yourself |
| Day and night layouts | One room doubles as a workspace or guest room | Save two options that reuse the same owned inventory |
| Rental refresh | You can change furnishings and finishes within practical limits | Copy a room and explore rugs, textiles, and movable lighting |
| Layout review | Partners need to decide without learning the editor | Link to two options with a short vote or comment |
| Move-in planning | You need to decide what to keep across rooms | Assign owned items to preferred layouts and list pieces still unplaced |
| Delivery path check | A sofa may fit the room but fail at the entrance | Later experiment using measured doorway, corridor, lift, and package geometry |

## 5. AI and geometry

### Launch behavior

Give users guided goals such as **Keep desk by window**, **Open up the walkway**, and **Keep all owned furniture**. An optional plain-language request can be mapped to supported goals. Show the interpreted requirements before applying them. The user can distinguish a strict constraint from a preference.

Generate candidates with a bounded placement search. Start with wall-adjacent placements, several sensible rotations, and zones derived from anchors such as windows. Validate geometry, rank feasible results against preferences, and return up to three distinct options. Every candidate can be opened as an editable draft. Keep the current layout intact.

Example output · “This option keeps the desk by the window and leaves 76 cm in front of the wardrobe. Your target was 70 cm.” Derive these numbers from the model. Keep text templates available for the guided mode. If a language model is added later, use it to interpret goals or summarize measured results through a structured schema. Geometry remains the source of truth.

### Rules and edge cases

- Use strict checks for objects outside room bounds, collision between solid items, collision with a door’s swing area, and changes to locked placements. Support decorative underlays such as rugs.
- For a given item, distinguish its footprint from its usable area. Store configurable clearance zones such as wardrobe front clearance. Treat the check as a geometric test against the saved target. Show the target and measured result.
- Treat missing measurements as **Unverified**. A photo can inform style exploration later. Keep any generated style preview labeled as illustrative and separate from the measured plan.
- For infeasible requests, say which constraint could not be satisfied where the solver can establish that. If the bounded search merely found no result, explain that it found no eligible option with the current settings. Never present an invalid candidate as a successful fit.
- Preview suggestions before adding them. Cancel or ignore stale generation results if geometry changes mid-run. Use clear loading, retry, and no-result states. Manual editing remains usable throughout.
- A retail fit check covers the modeled placement and specified clearances. Delivery access and regulatory or accessibility compliance require their own inputs and checks.

## 6. Interaction and visual direction

Use OpenArt’s clear tool entry points and visual project browsing as references. Give Furnifold its own calm, architectural identity. Let the homepage express variety through large room thumbnails, and let the editor focus on the actual room.

| Surface | Layout |
| --- | --- |
| Home | Compact rail for Home, Projects, and Templates. One primary create action, a short row of sample rooms, then recent projects |
| Room setup | Brief form with a live outline preview, unit selector, and dimensions |
| Project | Room cards with plan thumbnails, last opened layout, and clear add-room action |
| Editor | Room breadcrumb and view switch in the top bar. Canvas dominates. Compact toolbar for placement and measure. Contextual panel for selected furniture, issues, or suggestions |
| Compare | Two equal-size canvases, synchronized views by default, and compact summaries |
| Shared review | Mobile-friendly plan or furnished preview with option switching and a concise summary |

**Brand direction** · Use a Furnifold wordmark and evolve the open-doorway symbol from the earlier concept. Start with warm limestone `#F6F3EC`, evergreen `#173A32`, ink `#252A27`, and terracotta `#D78C72` for warning surfaces. Pair warning backgrounds with a darker foreground and an icon or text. Use Instrument Sans for UI with IBM Plex Mono reserved for measurements. Choose restrained borders and a quiet grid. Use original room imagery and consistent top-down orientation. Keep labels precise and avoid ornamental AI indicators.

**Responsive behavior** · Build desktop editing first. On narrow screens prioritize opening projects, reviewing alternatives, and viewing shared layouts. Give toolbar controls accessible names and keyboard focus. Offer direct numeric edits for key actions. Preserve warning meaning without color.

## 7. Codex implementation handoff

### Build the first vertical slice

1. Inspect the target repository and follow existing conventions. For a greenfield build, use React and TypeScript with an SVG-based 2D scene. Use transforms for pan and zoom and shared coordinates for room and object hit testing. Separate editor state from rendering.
2. Define a versioned project schema and seed one complete reference room. Use integer millimeters as the canonical unit. Derive metric and imperial display values through conversion. Coordinate convention should specify origin, axes, rotation direction, and wall-relative openings.
3. Build room setup and the editor with furniture manipulation, accessible numeric inputs, undo, save, and warnings. Persist the V0 data locally. Handle refresh, invalid input, storage failure, and schema upgrades.
4. Add two validated example alternatives, editable layout duplication, a synchronized compare view, and a furnished view rendered from the same scene. Keep seeded alternatives labeled as sample layouts until real generation exists.
5. Implement suggestions as a separate step after the manual workflow passes. Keep geometry, candidate generation, persistence, and view rendering independently testable. Use the same validation for manual edits and generated placements.
6. After the public beta needs accounts, introduce owner-scoped projects on the backend and narrowly scoped share tokens. Validate permissions server-side. Private room plans and any future room images stay private by default. Define deletion and retention before adding uploads.

### Data model

| Record | Key fields |
| --- | --- |
| Project | ID, owner when signed in, title, display units, rooms, inventory, schema version |
| Room | ID, project ID, name, shape, interior dimensions, openings, optional fixed obstacles, structure revision |
| Opening | ID, wall ID, wall offset, width, type, hinge side and swing direction when applicable |
| Inventory item | ID, name, category, width, depth, optional height, ownership status, quantity, optional clearance targets and price |
| Layout | ID, room ID, name, room structure revision, preferred flag, placements, optional goal settings |
| Placement | ID, item ID, position, rotation, locked state, optional appearance overrides |
| Issue | Issue type, affected geometry and items, target and actual values if known; derive from the current scene |
| Shared snapshot | Snapshot ID, chosen options, frozen scene data, created date, token and revocation state |

### Acceptance criteria for V0

- A first-time visitor can open the sample or make a rectangular room and add a custom-size item without creating an account.
- The data round-trips after refresh. Editing layout B preserves placements in layout A. Reset or delete actions are explicit.
- A piece overlapping a door swing triggers a warning. Moving it clear removes the warning. A rug beneath a bed is allowed. The sample wardrobe demonstrates a separate clearance warning.
- Switching units preserves model dimensions. Rotation changes the footprint correctly. Missing door data yields an unverified door check.
- Selecting a warning highlights the relevant area. A user can make a precise furniture move using keyboard-accessible inputs.
- Plan and furnished views show the same arrangement. Compare presents both options at consistent scale. Empty projects and rooms have a clear next action.
- Layout variants remain editable. Seeded examples are visibly samples. Once generation is built, locked pieces never move in a suggested result and no-result states preserve the original layout.

## 8. Product validation and business model

Start by observing renters and homeowners who are about to buy furniture or rearrange a room. Ask them to complete the workflow using their own measurements. Watch where they hesitate, whether they trust a warning, and whether the furnished preview changes their decision. Show the baseline and an alternative and ask them what they would actually do next.

Track time to the first furnished plan, percentage of projects that reach a saved layout, warning resolution, compare use, and later share-link opens. For suggestions, track acceptance and which changes users make after applying them. For repeat use, distinguish a second room or a return to the same project from casual template browsing. These are proposed measures.

**Monetization hypothesis** · Keep one useful planning experience available to try. Test a one-time move or furnishing pass for households that need premium exports, additional alternatives, or richer visualization for a short project. Test subscriptions with designers only once repeat workflows such as multiple active projects, client reviews, and branded exports are useful. Keep costs observable before introducing paid image generation.

**Build decision** · Begin with the local-first V0 around one measured room. Once the flow works in the browser, use its screens, component states, and real interaction decisions as the source for the Figma case study. Furnifold is a working name. Trademark and domain availability remain unverified.

## References

- OpenArt · [Creator Studio home](https://openart.ai/suite/home/ui)
- RoomFit · [Room Layout Planner feature listing](https://apps.apple.com/us/app/roomfit-room-layout-planner/id6816595633)
- RoomSketcher · [Live 3D walkthroughs](https://www.roomsketcher.com/features/live-3d-floor-plans/)
- IKEA · [IKEA Kreativ overview](https://www.ikea.com/in/en/customer-service/knowledge/articles/ec8c6ace-ef3d-428c-be25-fdb1e6fa75be.html)