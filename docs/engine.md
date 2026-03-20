# Engine

The `Engine` class is the main entry point. It creates the canvas, manages the game loop, and coordinates all systems. Only one instance is allowed.

## Constructor

```js
const engine = new Engine(rootElement, options);
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `rootElement` | `HTMLElement` | DOM element to append the canvas to |
| `options` | `EngineConfigOptions` | Configuration object |

### EngineConfigOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | **required** | Canvas width in pixels |
| `height` | `number` | **required** | Canvas height in pixels |
| `fullscreen` | `boolean` | `false` | Start in fullscreen mode |
| `debug` | `boolean` | `false` | Enable debug mode |
| `drawFps` | `boolean` | `false` | Display FPS counter overlay |
| `bgColor` | `RGBAColor` | `RGBAColor(0,0,0,0)` | Canvas background color |
| `pauseOnBlur` | `boolean` | `true` | Pause the loop when the window loses focus |
| `canvas` | `HTMLCanvasElement` | `null` | Provide your own canvas element instead of creating one |
| `canvasContextAttributes` | `CanvasContext2DAttributes` | see below | 2D context settings |

Default `canvasContextAttributes`:
```js
{
    alpha: true,
    willReadFrequently: false,
    desynchronized: false,
    colorSpace: 'srgb',
}
```

## Methods

### `engine.Start()`

Waits for all registered game scripts to load, initializes the input system, and starts the game loop.

```js
await engine.RegisterGameScript('./player.js');
await engine.RegisterGameScript('./enemy.js');
engine.Start();
```

### `engine.AppendGameObject(gameObject)`

Registers a `GameObject` into the game loop. It will receive `Start()` and `Update()` calls.

```js
const player = new Player({ position: new Vector(100, 50) });
engine.AppendGameObject(player);
```

### `engine.Instantiate(GameObjectClass, params, parent?, callback?)`

Creates a `GameObject` asynchronously via the instantiation queue (processed at the start of the next frame). Returns a `Promise<IGameObject>`.

```js
const enemy = await engine.Instantiate(Enemy, {
    position: new Vector(200, 0),
    health: 100,
});

// With a parent transform (child will inherit parent's transforms)
const bullet = await engine.Instantiate(Bullet, {
    position: new Vector(10, 0),
}, player.transform);
```

### `engine.RegisterGameScript(url)`

Loads an external JavaScript file via a `<script>` tag. Returns a `Promise<void>` that resolves when the script is loaded. All registered scripts are awaited in `Start()`.

```js
await engine.RegisterGameScript('./camera-movement.js');
```

### `engine.RequestFullScreen()` / `engine.ExitFullScreen()`

Toggle browser fullscreen on the canvas element.

### `Engine.Instance`

Static getter to access the singleton engine instance from anywhere.

```js
const engine = Engine.Instance;
```

## Game Loop Order

Each frame, the engine executes in this order:

1. Process the instantiation queue (deferred `Instantiate` calls)
2. Update `Time` (deltaTime, totalRuntime)
3. Clear canvas and draw background
4. Call `Update()` on all registered GameObjects (which updates their modules and children)
5. Batch-render all sprites and graphic primitives by layer
6. Run collision detection and response
7. Draw FPS overlay (if `drawFps: true`)
