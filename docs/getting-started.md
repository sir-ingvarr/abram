# Getting Started

## Installation

### npm

```bash
npm install abram
```

```typescript
import Engine, { GameObject, Classes } from 'abram';
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

```javascript
class Player extends GameObject {
    Start() {
        // Create a sprite
        const sprite = new Sprite({
            image: new ImageWrapper('./player.png'),
            width: 64, height: 64, layer: 1,
        });
        this.RegisterModule(sprite);

        // Add physics
        this.rb = new RigidBody({ useGravity: true, mass: 1 });
        this.RegisterModule(this.rb);
    }

    Update() {
        if (InputSystem.KeyPressed('ArrowRight')) {
            this.rb.AddForce(new Vector(5, 0));
        }
        super.Update();
    }
}
```

### 2. Create the engine and start

```javascript
const engine = new Engine(root, { width: 1280, height: 800 });

// Register the game object
const player = new Player({ position: new Vector(100, 100) });
engine.AppendGameObject(player);

engine.Start();
```

### 3. Async instantiation

For deferred creation (processed at the start of the next frame):

```javascript
const enemy = await engine.Instantiate(Enemy, {
    position: new Vector(500, 100),
});

// With a parent transform
const child = await engine.Instantiate(ChildObject, {
    position: new Vector(10, 0),
}, parent.transform);
```

## Loading Scripts (Browser)

When working without a bundler, load game scripts dynamically:

```javascript
await engine.RegisterGameScript('./player.js');
await engine.RegisterGameScript('./enemy.js');
engine.Start();
```

Scripts loaded this way share the global scope. Use an `imports.js` file per example to destructure `window.Abram` once:

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
| `AppendGameObject(go)` | Register a GameObject into the game loop |
| `Instantiate(Class, params, parent?)` | Async deferred creation, returns `Promise<IGameObject>` |
| `RegisterGameScript(url)` | Load external JS file, returns `Promise<void>` |
| `RequestFullScreen()` | Enter browser fullscreen |
| `ExitFullScreen()` | Exit browser fullscreen |

## Next Steps

- [Architecture](./architecture.md) -- Understand the game loop and rendering pipeline
- [GameObjects & Transforms](./gameobjects.md) -- Scene hierarchy and transforms
- [Modules Overview](./modules.md) -- Attach components like Sprite, RigidBody, and Collider
