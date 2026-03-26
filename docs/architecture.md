# Architecture

## Project Structure

```
src/engine/
├── Canvas/
│   ├── Canvas.ts                  # Canvas wrapper
│   ├── Context2d.ts               # 2D rendering context abstraction
│   └── GraphicPrimitives/
│       ├── GraphicPrimitive.ts    # Shape rendering (circle, rect, line)
│       └── Shapes.ts             # Rect, Circle, CircleArea, BoundingBox, OBB
├── Collision/
│   └── CollisionDetection.ts     # Circle-circle, circle-OBB, OBB-OBB detection
├── Objects/
│   ├── GameObject.ts             # Core entity container
│   ├── BasicObject.ts            # Base class with transform
│   ├── Transform.ts              # Position, rotation, scale hierarchy
│   └── Particle.ts               # Particle entity
├── Modules/
│   ├── Module.ts                 # Abstract base (dependencies, lifecycle)
│   ├── Sprite.ts                 # Image rendering
│   ├── Animator.ts               # State machine animation
│   ├── Rigidbody.ts              # Physics body
│   ├── Collider.ts               # Collision shapes + events
│   ├── PhysicsMaterial.ts        # Surface properties
│   ├── Camera.ts                 # Viewport singleton
│   ├── TrailRenderer.ts          # Motion trails
│   ├── ImageWrapper.ts           # Image loading/caching
│   └── EventEmitterModule.ts     # Event system base
├── Managers/
│   ├── GameLoop.ts               # requestAnimationFrame loop
│   ├── ExecutableManager.ts      # Module registry with dependency system
│   ├── GameObjectManager.ts      # GameObject lifecycle
│   ├── SpriteRendererManager.ts  # Render orchestration
│   ├── SpriteRenderer.ts         # Batch rendering with affine transforms
│   ├── CollisionsManager.ts      # Collision pairs, layers, response
│   └── ParticleSystem.ts         # Particle emission and simulation
├── Globals/
│   ├── Time.ts                   # deltaTime, totalRuntime, timeScale
│   └── Input.ts                  # Keyboard tracking
├── Debug/
│   └── FpsProvider.ts            # FPS measurement
└── Engine.ts                     # Main entry point, singleton
```

## Coordinate System

Screen-space with Y-axis pointing down:

| Direction | Vector | Screen |
|-----------|--------|--------|
| `Vector.Up` | `(0, -1)` | Upward on screen |
| `Vector.Down` | `(0, 1)` | Downward on screen |
| `Vector.Right` | `(1, 0)` | Right |
| `Vector.Left` | `(-1, 0)` | Left |

Gravity uses `Vector.Down`. Transform directional getters (`Right`, `Up`, etc.) account for rotation and scale flips.

## Game Loop

Each frame executes in this order:

1. **Instantiation queue** -- process deferred `Instantiate` calls
2. **Time update** -- `Time.FrameRendered()` computes deltaTime
3. **Bounding box cache invalidation** -- for occlusion culling
4. **Clear and draw background**
5. **Update all GameObjects** -- calls `Update()` on each module and child
6. **Camera sync** -- pass camera position and scale to SpriteRenderer
7. **Batch render** -- sprites and primitives drawn by layer order
8. **Collision detection and response** -- impulse, friction, penetration correction
9. **FPS overlay** -- if `drawFps: true`

## Module System

Modules attach to GameObjects via `RegisterModule()`. Each follows the `Start` / `Update` / `Destroy` lifecycle.

**Registration flow:**

1. Check `canBeDuplicated` -- reject if duplicate of non-duplicable type
2. Check `dependencies` -- if missing, module is registered but stays inactive
3. Register in `ExecutableManager` modules map
4. Call `PostModuleRegister` -- triggers `Start()` if active
5. Check pending modules -- activate any whose dependencies are now met

**Type-safe lookup:**

```js
const rb = gameObject.GetModule(RigidBody);        // RigidBody | null
const colliders = gameObject.GetModules(Collider2D); // Collider2D[]
```

## Rendering Pipeline

`SpriteRenderer.RenderElement` computes a combined affine matrix per graphic:

```
T(canvasCenter) * S(cameraScale) * T(-canvasCenter) * T(worldOffset) * S(objectScale) * R(rotation) * T(-anchor)
```

This is computed as raw `setTransform(a,b,c,d,e,f)` -- no DOMMatrix allocation.

Static direction constants (`Vector.Zero`, `Vector.One`, etc.) are `Object.freeze`'d singletons. Use `Vector.ZeroMutable` / `Vector.OneMutable` when you need a modifiable instance.

## Build

```bash
npm run build       # clear + tsc + webpack
npm run build-ts    # TypeScript only
npm run bundle      # webpack only
npm run lint        # ESLint with --fix
```

- TypeScript compiles to `./build` (ES2015, CommonJS, strict mode, declarations)
- Webpack bundles to `./build/abram.js` (production, source maps)
- Exposes `window.Abram` global for browser usage
