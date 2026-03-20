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
| `AddEventListener(code, handler, once?)` | Register a key press callback |
| `SetPressedKey(code)` | Mark a key as pressed (called internally) |
| `RemovePressedKey(code)` | Mark a key as released (called internally) |
| `HandleEvents(code)` | Fire registered handlers for a key (called internally) |
| `SetEventListeners()` | Attach `keydown`/`keyup` to `document` (called by `engine.Start()`) |

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
| `DeltaTimeSeconds` | `number` | `deltaTime / 1000` |
| `totalRuntime` | `number` | Unscaled total runtime in ms |
| `SineTime` | `number` | `Math.sin(totalRuntime)` |
| `timeScale` | `number` | Time multiplier (default `1`) |
