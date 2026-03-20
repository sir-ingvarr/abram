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
- **Time** (`src/engine/Globals/Time.ts`) — global deltaTime, totalRuntime, timeScale
- **Camera** (`src/engine/Modules/Camera.ts`) — viewport management
- **InputSystem** (`src/engine/Globals/Input.ts`) — keyboard input tracking

### Lifecycle

Objects follow `Start()` → `Update()` (per frame) → `Destroy()`. The game loop uses `requestAnimationFrame` with `performance.now()` timing.

### Rendering Pipeline

1. Clear canvas and draw background
2. Update all GameObjects (calls each module's `Update()`)
3. SpriteRenderer batch-renders sprites by layer (z-order)
4. CollisionsManager runs physics (broad-phase AABB → narrow-phase circle intersection → impulse response)
5. Optional FPS display

### Entry Points

- `src/global_index.ts` — webpack entry, assigns `window.Abram` global
- `src/index.ts` — ESM export entry
- `src/engine/Classes.ts` — math utilities: `Vector`, `Point`, `RGBAColor`, `Segment`, `Ray`, `BezierCurve`, `Maths` (Lerp, Clamp, RandomRange), collection types

### Camera

Singleton (`Camera.GetInstance()`). Supports position, zoom via `Scale` (applied as a centered DOMMatrix scale in SpriteRenderer), and a `BoundingBox`-based confiner. Call `cam.Confine()` once per frame after setting position and scale to apply bounds.

### Physics

Impulse-based (not constraint-based). `Rigidbody` handles gravity, forces, velocity, drag, mass. `Collider2D` uses circle shapes. `CollisionsManager` resolves penetration and applies restitution.

## Build Configuration

- **TypeScript**: target ES2015, strict mode, CommonJS modules, declarations enabled → `./build`
- **Webpack**: production mode, source maps, outputs `./build/abram.js`
- **ESLint**: TypeScript plugin with recommended rules

## Examples

`examples/` contains usage demos (simple-game, particle-system, collisions-detection, etc.). Each creates an `Engine` instance, appends GameObjects, and calls `engine.Start()`. Examples consume the bundled `build/abram.js` via script tags.
