# Camera

Singleton camera controlling the viewport. Created via `Camera.GetInstance()`.

## Usage

```js
// First call creates the instance
const cam = Camera.GetInstance({
    width: 1280,
    height: 800,
    position: new Point(0, 0),
    confiner: { minX: -500, maxX: 500, minY: -300, maxY: 300 },
});

// Subsequent calls return the same instance
const cam = Camera.GetInstance({});
```

When `GetInstance` is called on an existing instance, any explicitly provided properties (`confiner`, `position`, `width`, `height`) are applied to the instance. Properties omitted from the call are left unchanged. This allows reconfiguring the camera after creation -- for example, setting a confiner in a scene's `Start()` even if the camera was created earlier by the engine.

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number` | `1280` | Viewport width |
| `height` | `number` | `800` | Viewport height |
| `position` | `Vector` | `(0,0)` | Initial camera position |
| `confiner` | `CameraConfiner \| BoundingBox` | `null` | Bounds the camera cannot leave |

## Properties (get/set)

| Property | Type | Description |
|----------|------|-------------|
| `Position` | `ICoordinates` | Camera position (top-left corner of viewport) |
| `Center` | `ICoordinates` | Set position so this world point is centered in the viewport |
| `Scale` | `ICoordinates` | Zoom level (default `(1,1)`) |
| `Confiner` | `CameraConfiner \| null` | Camera bounds (set `null` to disable) |

## Zoom

`Scale` applies a transform centered on the canvas midpoint. Values greater than 1 zoom in (objects appear larger), values less than 1 zoom out.

```js
cam.Scale = Vector.Of(2, 2);    // 2x zoom
cam.Scale = Vector.Of(0.5, 0.5); // half zoom
```

## Confiner

Restricts the camera so its visible edges stay within bounds. Supports per-axis constraints -- set only the axes you need.

```js
// Constrain both axes
cam.Confiner = { minX: -1000, maxX: 1000, minY: -600, maxY: 600 };

// Constrain only Y
cam.Confiner = { maxY: 400 };

// BoundingBox still works
cam.Confiner = new BoundingBox(new Point(-1000, -600), new Point(1000, 600));

// Remove confiner
cam.Confiner = null;
```

Each bound is optional. Omitted bounds leave that direction unconstrained. When both min and max are set for an axis and the viewport is larger than the range, the camera centers within the bounds instead of oscillating.

The confiner accounts for zoom -- when zoomed in, the visible area shrinks, so the camera can move closer to the edges.

Confining is applied automatically each frame as part of the camera's `Update()` cycle -- no manual call needed.

## Tracking

Follow a game object's transform with an optional dead zone and damping.

```js
cam.Track(player.transform, {
    deadZone: new Vector(100, 50),
    damping: 5,
    updateMode: 'update',
});
```

**Dead zone** -- the maximum offset (half-width, half-height in world units) the target is allowed from the camera center before the camera corrects. The camera stays still while the target moves within this region, and only starts moving once the target exceeds the boundary. Set to `Vector.Zero` (the default) to follow every movement.

**Damping** -- when the camera corrects, it lerps toward the target using `damping * dt`. Higher values correct faster. Set to `0` (the default) to snap instantly.

**Update mode** -- controls when tracking runs:

- `'update'` (default) -- tracking runs every frame using `Time.DeltaTimeSeconds`. Reads interpolated positions. Best for visual/UI-driven cameras.
- `'fixedUpdate'` -- tracking runs at 50Hz using `Time.FixedDeltaTimeSeconds`. Reads true physics positions, avoiding interpolation jitter at dead zone edges. Best for physics-driven games.

Confining always runs per-frame in `Update()` regardless of the tracking update mode.

```js
// Physics-driven tracking — stable with rigidbody interpolation
cam.Track(player.transform, {
    deadZone: new Vector(100, 50),
    damping: 5,
    updateMode: 'fixedUpdate',
});
```

To stop tracking:

```js
cam.Untrack();
```

The game loop calls both `camera.FixedUpdate()` (in the fixed timestep loop) and `camera.Update()` (per frame) automatically.

### Tracking Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deadZone` | `ICoordinates` | `(0,0)` | Max allowed offset from camera center in world units |
| `softEdge` | `number` | `0` | 0-1 coefficient for inner dead zone boundary. 0 = entire zone is damped, 1 = entire zone is hard |
| `damping` | `number` | `0` | Correction speed (0 = snap, higher = faster lerp) |
| `updateMode` | `'fixedUpdate' \| 'update'` | `'update'` | When tracking runs: per-frame or at fixed 50Hz |

## Methods

| Method | Description |
|--------|-------------|
| `Update()` | Per-frame: runs tracking (if mode is `'update'`), then confining. Called automatically by the game loop |
| `FixedUpdate()` | Fixed 50Hz: runs tracking (if mode is `'fixedUpdate'`). Called automatically by the game loop |
| `Track(target, options?)` | Follow a transform with optional dead zone, damping, and update mode |
| `Untrack()` | Stop following the tracked target |
| `ResetCenterPoint(width, height?)` | Update viewport dimensions for center and confiner calculations |
