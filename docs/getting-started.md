# Getting Started

## Installation

### npm

```bash
npm install abram-js
```

```typescript
import Engine, { GameObject, Classes } from 'abram-js';
const { Vector, RGBAColor } = Classes;
```

### Browser (script tag)

```html
<script src="path/to/abram.js"></script>
```

All engine classes are available on `window.Abram`:

```javascript
const { Engine, GameObject, Classes: { Vector, RGBAColor } } = window.Abram;
```

## Creating the Engine

```javascript
const root = document.getElementById('root');
const engine = new Engine(root, {
    width: 1280,
    height: 800,
    drawFps: true,
    bgColor: new RGBAColor(30, 30, 30),
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | **required** | Canvas width in pixels |
| `height` | `number` | **required** | Canvas height in pixels |
| `fullscreen` | `boolean` | `false` | Start in fullscreen mode |
| `debug` | `boolean` | `false` | Enable debug overlays (collider outlines, bounding boxes) |
| `drawFps` | `boolean` | `false` | Display FPS counter |
| `bgColor` | `RGBAColor` | transparent | Canvas background color |
| `pauseOnBlur` | `boolean` | `true` | Pause when the browser tab loses focus |
| `canvas` | `HTMLCanvasElement` | `null` | Provide your own canvas instead of creating one |
| `canvasContextAttributes` | `object` | see below | 2D context settings |

Default canvas context attributes:

```javascript
{
    alpha: true,
    willReadFrequently: false,
    desynchronized: false,
    colorSpace: 'srgb',
}
```

## Basic Example

### 1. Define a GameObject

Extend `GameObject` and use lifecycle methods. Register modules in `Start()`, handle logic in `FixedUpdate()` (physics) and `Update()` (rendering/input).

```javascript
class Player extends GameObject {
    Start() {
        const sprite = new Sprite({
            image: new ImageWrapper('./player.png'),
            width: 64, height: 64, layer: 1,
        });
        this.RegisterModule(sprite);

        this.rb = new RigidBody({ useGravity: true, mass: 1 });
        this.RegisterModule(this.rb);
    }

    FixedUpdate() {
        // Physics logic runs at fixed 50Hz
        super.FixedUpdate();
    }

    Update() {
        if (InputSystem.KeyPressed('ArrowRight')) {
            this.rb.AddForce(new Vector(5, 0));
        }
        super.Update();
    }
}
```

### 2. Define a scene

A scene is a function that receives the engine and populates it with game objects.

```javascript
async function GameScene(engine) {
    const player = new Player({ position: new Vector(100, 100), name: 'Player' });
    engine.AppendGameObject(player);
}
```

### 3. Register the scene, start the engine, and load

```javascript
const engine = new Engine(root, { width: 1280, height: 800 });

engine.RegisterScene('game', GameScene);
engine.Start();
await engine.LoadScene('game');
```

Scenes can be swapped at any time -- `LoadScene` tears down the current scene (destroys objects, resets camera, stops audio) and loads the new one. See [Scenes](./scenes.md) for details.

## Adding Game Objects

There are two ways to add game objects to the engine:

### AppendGameObject -- immediate, during scene setup

Takes an already-created instance and registers it into the game loop immediately. Use this in scene functions to set up initial objects.

```javascript
async function GameScene(engine) {
    const player = new Player({ position: new Vector(100, 100) });
    engine.AppendGameObject(player);

    const floor = new Floor({ position: new Vector(0, 400) });
    engine.AppendGameObject(floor);
}
```

### Instantiate -- deferred, during gameplay

Takes a class reference and parameters, queues creation for the start of the next frame, and returns a `Promise` that resolves to the new game object. Use this to spawn objects at runtime (bullets, enemies, effects).

```javascript
// Spawn a bullet from a game object's Update()
const bullet = await engine.Instantiate(Bullet, {
    position: new Vector(500, 100),
});

// Spawn as a child of another object
const child = await engine.Instantiate(ChildObject, {
    position: new Vector(10, 0),
}, parent.transform);
```

The deferred queue is processed at the start of each frame, before physics and rendering. This avoids modifying the game object list mid-update.

## Loading Scripts (Browser)

When working without a bundler, load game scripts before starting the engine:

```javascript
await engine.RegisterGameScript('./player.js');
await engine.RegisterGameScript('./enemy.js');

engine.RegisterScene('game', GameScene);
engine.Start();
await engine.LoadScene('game');
```

Scripts loaded this way share the global scope. Use an `imports.js` file to destructure `window.Abram` once:

```html
<script src="../../build/abram.js"></script>
<script src="imports.js"></script>
<script src="index.js"></script>
```

## Engine Singleton

Only one Engine instance is allowed. Access it from anywhere:

```javascript
const engine = Engine.Instance;
```

## Methods

| Method | Description |
|--------|-------------|
| `Start()` | Wait for scripts, init input, start game loop |
| `RegisterScene(name, fn)` | Register a scene function by name |
| `LoadScene(name)` | Tear down current scene and load the named one |
| `GetRegisteredScenes()` | Returns array of registered scene names |
| `AppendGameObject(go)` | Register an existing GameObject instance immediately |
| `Instantiate(Class, params, parent?)` | Deferred creation queued for next frame, returns `Promise<IGameObject>` |
| `RegisterGameScript(url)` | Load external JS file, returns `Promise<void>` |
| `RequestFullScreen()` | Enter browser fullscreen |
| `ExitFullScreen()` | Exit browser fullscreen |

## Next Steps

- [Architecture](./architecture.md) -- Understand the game loop and rendering pipeline
- [GameObjects & Transforms](./gameobjects.md) -- Scene hierarchy and transforms
- [Modules Overview](./modules.md) -- Attach components like Sprite, RigidBody, and Collider
