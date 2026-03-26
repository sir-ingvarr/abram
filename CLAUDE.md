# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ABRAM** (Advanced Browser Rendering Abstraction Module) — a Unity-inspired 2D game engine built with TypeScript for browser-based games. Zero runtime dependencies; outputs a single bundled `build/abram.js` that exposes `window.Abram`.

## Build Commands

```bash
npm run build        # Full pipeline: clear → build-ts → bundle
npm run build-ts     # TypeScript compilation only
npm run bundle       # Webpack bundle only
npm run lint         # ESLint on src/
npm run test         # (currently stubbed)
npm run serve        # http-server for particle-system example
npm run pre-commit   # lint → test → build-ts (runs via Husky)
```

## Architecture

### Component-Based Entity System (Unity-like)

- **GameObjects** (`src/engine/Objects/GameObject.ts`) are containers holding **Modules** (components) and child GameObjects
- **Modules** (`src/engine/Modules/`) are reusable behavior components: `Sprite`, `Animator`, `Rigidbody`, `Collider2D`, `Camera`, `TrailRenderer`
- **Transform** (`src/engine/Objects/Transform.ts`) handles position/rotation/scale with full parent-child hierarchy and world coordinate calculation
- **Managers** (`src/engine/Managers/`) coordinate system-wide updates: `GameLoop`, `GameObjectManager`, `SpriteRendererManager`, `CollisionsManager`, `ParticleSystem`

### Key Singletons

- **Engine** (`src/engine/Engine.ts`) — main entry point, creates canvas, manages game loop, only one instance allowed
- **Time** (`src/engine/Globals/Time.ts`) — global deltaTime, unscaledDeltaTime, fixedDeltaTime, totalRuntime, timeScale
- **Camera** (`src/engine/Modules/Camera.ts`) — viewport management
- **InputSystem** (`src/engine/Globals/Input.ts`) — keyboard input tracking

### Lifecycle

Objects follow `Start()` → `FixedUpdate()` (fixed timestep) / `Update()` (per frame) → `Destroy()`. The game loop uses `requestAnimationFrame` with `performance.now()` timing.

### Fixed Timestep

Physics runs on a fixed timestep (default 50Hz, `Time.fixedDeltaTime = 20`ms). The game loop accumulates **unscaled** (real) frame time and runs `FixedUpdate` in fixed-size chunks, capped to prevent spiral of death. This means FixedUpdate always ticks at 50Hz wall clock regardless of `timeScale`. `timeScale` only affects the step size via `Time.FixedDeltaTimeSeconds` (`fixedDeltaTime * timeScale / 1000`). `Update` runs once per frame for rendering/visuals.

- **`FixedUpdate()`** — physics, collision, forces. Uses `Time.FixedDeltaTimeSeconds` (scaled by `timeScale`). Rigidbody, CollisionsManager, and ParticleSystem physics all run here.
- **`Update()`** — rendering, animation, input, UI. Uses `Time.DeltaTimeSeconds` (scaled by `timeScale`).
- **Interpolation** — `RigidBody.InterpolateAll(alpha)` / `RestoreAll()` smooths rendering between physics steps. Opt-in per rigidbody via `interpolate: true` (default `false`). GameLoop handles the calls automatically.
- **Velocity units** — m/s. Position conversion uses `PhysicsMaterial.PixelsPerMeter` (default 100). `velocity += acceleration * fixedDt`, `position += velocity * fixedDt * PixelsPerMeter`.
- **ParticleSystem** — not a Module; users must call both `ps.FixedUpdate()` (physics) and `ps.Update()` (visuals/emission) from their game objects.

### Module System

Modules declare static `dependencies` (array of class refs) and `canBeDuplicated` (boolean). `ExecutableManager.RegisterModule` enforces both — modules with unmet deps stay inactive until deps are registered, duplicates are rejected. `GetModule<T>(ClassRef)` / `GetModules<T>(ClassRef)` for type-safe lookup via `instanceof`.

### Rendering Pipeline

Each frame:
1. Accumulate unscaledDeltaTime; run fixed-timestep loop:
   a. `FixedUpdate` all GameObjects (physics modules)
   b. `CollisionsManager.FixedUpdate` (detection, impulse response, iterative penetration correction)
2. Interpolate rigidbody positions for smooth rendering (only bodies with `interpolate: true`)
3. Clear canvas, draw background
4. `Update` all GameObjects (visuals, input, animation)
5. SpriteRenderer batch-renders sprites by layer (z-order)
6. Restore rigidbody physics positions
7. Optional FPS display

### Entry Points

- `src/global_index.ts` — webpack entry, assigns `window.Abram` global
- `src/index.ts` — ESM export entry
- `src/engine/Classes.ts` — math utilities: `Vector`, `Point`, `RGBAColor`, `Segment`, `Ray`, `BezierCurve`, `Maths` (Lerp, Clamp, RandomRange), collection types

### Camera

Singleton (`Camera.GetInstance()`). Supports position, zoom via `Scale` (applied as a centered DOMMatrix scale in SpriteRenderer), and a `BoundingBox`-based confiner. Call `cam.Confine()` once per frame after setting position and scale to apply bounds.

### Coordinate System

Screen-space: Y-axis points down. `Vector.Up = (0, -1)` is screen-up, `Vector.Down = (0, 1)` is screen-down. Gravity uses `Vector.Down`. `Transform.Right/Left/Up/Down` getters return rotated+flip-aware directional vectors.

### Physics

Impulse-based (not constraint-based), running on fixed timestep (50Hz). Velocity is in m/s; position conversion uses `PhysicsMaterial.PixelsPerMeter` (100). `Rigidbody` handles gravity (`velocity += acceleration * fixedDt`), forces, velocity, drag, mass, `freezeRotation`, `velocityLimit`. `PhysicsMaterial` on rigidbody controls friction, bounciness override, and density (auto-computes mass from collider area). `Collider2D` supports both `CircleArea` and `OBBShape` (oriented bounding box). `CollisionsManager` distinguishes resting contacts (pair-history + velocity threshold) from impacts — resting contacts cancel normal velocity and apply friction; impacts apply full impulse with restitution. Penetration correction runs with 3 iterative passes to resolve competing constraints (e.g. balls squeezed between walls). Grace period of 10 physics frames for collision enter/leave events. 16-layer collision matrix (`CollisionsManager.SetLayerCollision`). Rigidbodies auto-sleep after 15 frames of near-zero displacement and wake on force/impulse or significant penetration correction. `collisionLayer` is on `GameObject` (0-15, default 0). Render interpolation is opt-in per rigidbody (`interpolate: true`).

## Build Configuration

- **TypeScript**: target ES2015, strict mode, CommonJS modules, declarations enabled → `./build`
- **Webpack**: production mode, source maps, outputs `./build/abram.js`
- **ESLint**: TypeScript plugin with recommended rules

## Examples

`examples/` contains usage demos (simple-game, particle-system, collisions-detection, etc.). Each creates an `Engine` instance, appends GameObjects, and calls `engine.Start()`. Examples consume the bundled `build/abram.js` via script tags.
