# ABRAM

**Advanced Browser Rendering Abstraction Module** — a Unity-inspired 2D game engine for the browser, built with TypeScript. Zero runtime dependencies.

<p align="center">
  <img src="./logo.png" alt="ABRAM logo" width="200" />
</p>

## Features

- **Component-based architecture** — GameObjects hold Modules (Sprite, Rigidbody, Collider, Animator, TrailRenderer, etc.)
- **Parent-child transforms** — nested position, rotation, and scale with world coordinate propagation
- **Impulse-based physics** — gravity, forces, drag, collision detection and response with OBB and circle colliders
- **Particle system** — emit over time/distance/burst, pooling, sub-emitters, lifetime curves, occlusion culling
- **Sprite animation** — state machine animator with frame-based transitions
- **Trail rendering** — configurable width/color over trail lifetime
- **Input** — keyboard tracking via InputSystem, mouse/cursor tracking via CursorInputSystem
- **Camera** — position, zoom/scale, center tracking, bounding box confiner
- **Audio** — Web Audio API manager with preloading, volume control, and playback handles
- **UI system** — screen-space text and rect elements, independent of camera
- **Math utilities** — Vector, Point, Polar coordinates, Bezier curves, color interpolation

## Installation

### Browser (script tag)

```html
<script src="path/to/abram.js"></script>
```

### npm

```bash
npm install abram-js
```

## Usage

### 1. Create the engine

#### Browser

```js
const { Engine, GameObject, Classes: { Vector, RGBAColor } } = window.Abram;

const root = document.getElementById('root');
const engine = new Engine(root, {
    width: 1280,
    height: 800,
    bgColor: new RGBAColor(30, 30, 30),
    drawFps: true,
});
```

#### ES modules

```js
import Engine, { GameObject, Classes } from 'abram-js';
const { Vector, RGBAColor } = Classes;

const root = document.getElementById('root');
const engine = new Engine(root, {
    width: 1280,
    height: 800,
    bgColor: new RGBAColor(30, 30, 30),
});
```

### 2. Define a scene

A scene is a function that receives the engine and populates it with game objects.

```js
async function MainScene(engine) {
    const player = new Player({ position: new Vector(100, 200), name: 'Player' });
    engine.AppendGameObject(player);

    const floor = new Floor({ position: new Vector(0, 400) });
    engine.AppendGameObject(floor);
}

engine.RegisterScene('main', MainScene);
```

### 3. Create game objects

Extend `GameObject` and use the lifecycle methods. Register modules in `Start()`, handle logic in `Update()` and `FixedUpdate()`.

```js
class Player extends GameObject {
    Start() {
        const sprite = new Sprite({
            image: new ImageWrapper('./player.png'),
            width: 64, height: 64, layer: 1,
        });
        this.RegisterModule(sprite);

        this.rb = new RigidBody({ useGravity: true, mass: 1, drag: 0.5 });
        this.RegisterModule(this.rb);

        this.collider = new Collider2D({
            shape: new OBBShape(64, 64),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rb,
        });
        this.RegisterModule(this.collider);
    }

    FixedUpdate() {
        // Physics logic runs at fixed 50Hz
        super.FixedUpdate();
    }

    Update() {
        // Runs every frame — input, visuals, animation
        if (InputSystem.KeyPressed('ArrowRight')) {
            this.rb.AddForce(new Vector(5, 0));
        }
        super.Update();
    }
}
```

### 4. Start the engine and load a scene

```js
engine.Start();
await engine.LoadScene('main');
```

Scenes can be swapped at any time — `LoadScene` tears down the current scene and loads the new one.

## Lifecycle

Every `GameObject` and `Module` follows the lifecycle:

**Start()** (once, on registration) &rarr; **FixedUpdate()** (fixed 50Hz timestep, physics) &rarr; **Update()** (every frame, rendering/input) &rarr; **Destroy()** (on removal)

## Build

```bash
npm run build       # full pipeline: clear -> tsc -> webpack
npm run build-ts    # TypeScript only
npm run bundle      # webpack only
npm run lint        # ESLint
```

## Examples

The `examples/` directory contains working demos. Open any example's `index.html` in a browser after running `npm run build`.

| Example | Description |
|---------|-------------|
| `simple-game` | Character movement with sprites, animation, physics, and input |
| `collisions-detection` | OBB collider physics with spawning |
| `particle-system` | Particle effects with lifetime curves |
| `particle-collisions` | Particles with collision physics |
| `fireworks-particle` | Fireworks with sub-emitters and time scaling |
| `planets-patterns` | Orbital mechanics with trail renderers |
| `galton-board` | Galton board physics simulation |
| `turret-defense` | Turret defense game demo |
| `bezier-curve` | Bezier curve visualization |
| `colors` | RGBAColor manipulation and gradients |

## Documentation

Full documentation is in the [`docs/`](./docs/index.md) folder:

- [Getting Started](./docs/getting-started.md) — installation, configuration, first project
- [Architecture](./docs/architecture.md) — project structure, game loop, coordinate system
- [Scenes](./docs/scenes.md) — scene registration, loading, and switching
- [GameObjects & Transforms](./docs/gameobjects.md) — scene hierarchy, transforms, directional getters
- [Modules Overview](./docs/modules.md) — dependency system, creating custom modules
  - [Sprite](./docs/modules/sprite.md) | [Animator](./docs/modules/animator.md) | [RigidBody](./docs/modules/rigidbody.md) | [Collider2D](./docs/modules/collider.md) | [PhysicsMaterial](./docs/modules/physics-material.md) | [TrailRenderer](./docs/modules/trail-renderer.md) | [Camera](./docs/modules/camera.md)
- [Particle System](./docs/particles.md) — emitters, lifetime curves, sub-emitters
- [Input & Time](./docs/input.md) — keyboard/mouse handling, deltaTime, timeScale
- [UI](./docs/ui.md) — screen-space text and rect elements
- [Audio](./docs/modules/audio.md) — sound loading, playback, volume control
- [Math & Utilities](./docs/math.md) — Vector, Point, RGBAColor, Maths, collections
- [Debug](./docs/modules/debug.md) — debug overlays and gizmos

## License

[MIT](./LICENSE)
