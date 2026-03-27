# Debug

Static debug overlay for visual debugging. Provides world-space gizmos (lines, circles, rays) and screen-space drawing (text, rectangles). All draw calls are no-ops when debug is disabled.

Enabled automatically when `Engine` is created with `debug: true`. Also exposes levelled console logging with `[ABRAM]` prefix.

## Enabling

```js
const engine = new Engine(root, { debug: true });

// Or manually:
Debug.Enabled = true;
```

## Log Levels

```js
Debug.Level = LogLevel.Warn; // None, Error, Warn, Info (default)
```

| Method | Level | Output |
|--------|-------|--------|
| `Debug.Log(...)` | Info | `console.log` |
| `Debug.Warn(...)` | Warn | `console.warn` |
| `Debug.Error(...)` | Error | `console.error` |

## World-Space Gizmos

Drawn in world coordinates, respecting camera position and zoom. Non-persistent gizmos are drawn for one frame; set `durationMs > 0` for persistent ones.

| Method | Description |
|--------|-------------|
| `DrawLine(from, to, color?, durationMs?)` | Line between two world points |
| `DrawRay(origin, direction, length?, color?, durationMs?)` | Ray from origin along normalized direction |
| `DrawCircle(center, radius, color?, durationMs?)` | Circle outline at world position |

```js
// One-frame contact point
Debug.DrawCircle(contactPoint, 5, Debug.Colors.contactPoint);

// Persistent velocity ray (500ms)
Debug.DrawRay(pos, velocity, 50, new RGBAColor(255, 0, 0), 500);
```

## Screen-Space Drawing

Drawn in screen coordinates (not affected by camera).

| Method | Description |
|--------|-------------|
| `DrawText(text, x, y, color?, font?, durationMs?)` | Text at screen position (default: 14px monospace) |
| `DrawRect(x, y, width, height, color?, fill?, durationMs?)` | Rectangle (filled by default) |

## Built-in Colors

| Key | Color | Usage |
|-----|-------|-------|
| `Debug.Colors.collider` | Green | Collider outlines |
| `Debug.Colors.spriteBounds` | Pink | Sprite bounding boxes |
| `Debug.Colors.anchorPoint` | Pink | Transform anchor points |
| `Debug.Colors.contactPoint` | Yellow | Collision contact points |
| `Debug.Colors.ray` | Green | Ray casts |

## Other

| Method | Description |
|--------|-------------|
| `Debug.Clear()` | Remove all queued gizmos and screen commands |
