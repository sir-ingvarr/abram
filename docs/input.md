# Input

## InputSystem

Static class for keyboard input. Automatically initialized when `engine.Start()` is called.

### Checking Key State

```js
if (InputSystem.KeyPressed('KeyW')) {
    // W is currently held down
}

if (InputSystem.KeyPressed('Space')) {
    // Spacebar is held
}
```

Key codes follow the [`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) standard. Common codes:

| Key | Code |
|-----|------|
| W, A, S, D | `KeyW`, `KeyA`, `KeyS`, `KeyD` |
| Arrow keys | `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| Space | `Space` |
| Shift | `ShiftLeft`, `ShiftRight` |
| Control | `ControlLeft`, `ControlRight` |
| Enter | `Enter` |
| Escape | `Escape` |

### Event Listeners

Register callbacks for specific key presses:

```js
// Permanent listener
InputSystem.AddEventListener('Space', () => {
    player.jump();
});

// One-time listener
InputSystem.AddEventListener('KeyE', () => {
    openInventory();
}, true);  // once = true
```

### API Reference

| Method | Description |
|--------|-------------|
| `KeyPressed(code)` | Returns `true` if the key is currently held down |
| `AddEventListener(code, handler, once?)` | Register a keydown callback. Listeners survive scene transitions. |

## CursorInputSystem

Static class for mouse input on the canvas. Automatically initialized when `engine.Start()` is called. Events are scoped to the canvas element — not the whole document.

### Position

```js
// Screen-space position relative to canvas top-left (pixels)
const canvasPos = CursorInputSystem.CanvasPosition;

// World-space position (inverse camera transform, accounts for zoom and pan)
const worldPos = CursorInputSystem.WorldPosition;
```

`WorldPosition` is recalculated on access, so it stays correct even when the camera moves between mouse events.

### Button State

```js
// Held down right now
if (CursorInputSystem.ButtonHeld(MouseButton.Left)) { ... }

// Pressed this frame only (cleared each frame)
if (CursorInputSystem.ButtonDown(MouseButton.Left)) { ... }

// Released this frame only (cleared each frame)
if (CursorInputSystem.ButtonUp(MouseButton.Left)) { ... }
```

| Button | Value |
|--------|-------|
| `MouseButton.Left` | `0` |
| `MouseButton.Middle` | `1` |
| `MouseButton.Right` | `2` |

### Scroll

```js
const scroll = CursorInputSystem.ScrollDelta;  // wheel deltaY, reset each frame
```

### Event Listeners

```js
CursorInputSystem.AddEventListener('click', () => {
    shoot();
});

CursorInputSystem.AddEventListener('mousemove', () => {
    const pos = CursorInputSystem.CanvasPosition;
    updateCrosshair(pos);
});

// One-time listener
CursorInputSystem.AddEventListener('mousedown', handler, true);

// Remove listener
CursorInputSystem.RemoveEventListener('click', handler);
```

### Available Events

`mousedown`, `mouseup`, `mousemove`, `click`, `dblclick`, `wheel`, `mouseenter`, `mouseleave`

### Notes

- Right-click context menu is suppressed on the canvas
- All buttons are cleared on `mouseleave` to prevent stuck state
- `ButtonDown` / `ButtonUp` / `ScrollDelta` are per-frame — automatically cleared by the game loop

## Time

Static class providing frame timing. Updated automatically each frame.

```js
// Milliseconds since last frame (affected by timeScale)
const dt = Time.deltaTime;

// Seconds since last frame (affected by timeScale)
const dtSec = Time.DeltaTimeSeconds;

// Total runtime in milliseconds
const total = Time.totalRuntime;

// Sine of total runtime (useful for oscillation)
const sine = Time.SineTime;

// Slow motion (0.5 = half speed, 2 = double speed)
Time.timeScale = 0.5;
```

| Property | Type | Description |
|----------|------|-------------|
| `deltaTime` | `number` | Ms since last frame, scaled by `timeScale` |
| `unscaledDeltaTime` | `number` | Ms since last frame, real wall-clock time |
| `DeltaTimeSeconds` | `number` | `deltaTime / 1000` |
| `FixedDeltaTimeSeconds` | `number` | Fixed timestep in seconds, scaled by `timeScale` (`fixedDeltaTime * timeScale / 1000`) |
| `fixedDeltaTime` | `number` | Fixed timestep in ms (default `20`, i.e. 50Hz) |
| `totalRuntime` | `number` | Unscaled total runtime in ms |
| `SineTime` | `number` | `Math.sin(totalRuntime)` |
| `timeScale` | `number` | Time multiplier (default `1`) |

**timeScale** affects both `deltaTime` (in `Update`) and `FixedDeltaTimeSeconds` (in `FixedUpdate`). `FixedUpdate` always ticks at 50Hz — `timeScale` controls how much happens per tick.
