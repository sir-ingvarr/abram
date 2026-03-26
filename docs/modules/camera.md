# Camera

Singleton camera controlling the viewport. Created via `Camera.GetInstance()`.

## Usage

```js
// First call creates the instance
const cam = Camera.GetInstance({
    width: 1280,
    height: 800,
    position: new Point(0, 0),
    confiner: new BoundingBox(new Point(-500, -300), new Point(500, 300)),
});

// Subsequent calls return the same instance
const cam = Camera.GetInstance({});
```

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number` | `1280` | Viewport width |
| `height` | `number` | `800` | Viewport height |
| `position` | `Vector` | `(0,0)` | Initial camera position |
| `confiner` | `BoundingBox` | `null` | Bounds the camera cannot leave |

## Properties (get/set)

| Property | Type | Description |
|----------|------|-------------|
| `Position` | `ICoordinates` | Camera position (top-left corner of viewport) |
| `Center` | `ICoordinates` | Set position so this world point is centered in the viewport |
| `Scale` | `ICoordinates` | Zoom level (default `(1,1)`) |
| `Confiner` | `BoundingBox \| null` | Camera bounds (set `null` to disable) |

## Zoom

`Scale` applies a transform centered on the canvas midpoint. Values greater than 1 zoom in (objects appear larger), values less than 1 zoom out.

```js
cam.Scale = Vector.Of(2, 2);    // 2x zoom
cam.Scale = Vector.Of(0.5, 0.5); // half zoom
```

## Confiner

Restricts the camera so its visible edges never exceed a `BoundingBox`. Useful for preventing the camera from showing empty space beyond level boundaries.

```js
cam.Confiner = new BoundingBox(
    new Point(-1000, -600),
    new Point(1000, 600),
);

// Remove confiner
cam.Confiner = null;
```

The confiner accounts for zoom -- when zoomed in, the visible area shrinks, so the camera can move closer to the edges. If the viewport is larger than the confiner (zoomed out far), the camera centers within the bounds instead of oscillating.

**Important:** Call `Confine()` once per frame, after setting both position/center and scale:

```js
Update() {
    cam.Center = playerPosition;
    cam.Scale = Vector.Of(zoomLevel, zoomLevel);
    cam.Confine();  // apply bounds after all changes
}
```

## Methods

| Method | Description |
|--------|-------------|
| `Confine()` | Clamp position to confiner bounds. Call once per frame after setting position and scale |
| `ResetCenterPoint(width, height?)` | Update viewport dimensions for center and confiner calculations |
