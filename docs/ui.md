# UI System

Screen-space game objects rendered on a separate layer array, independent of the camera transform. UI elements always render on top of world content.

## Overview

UI elements extend `UIElement` (which extends `BasicObject`). They participate in the standard game loop lifecycle (`Start`, `Update`, `Destroy`) and are instantiated like any game object. Their position is in screen pixels, unaffected by camera position or zoom.

The UI rendering pipeline maintains its own layer array, separate from the world sprite layers. Within the UI layer array, lower numbers render first (back to front).

## UIText

Renders text at a screen position.

```js
const label = await engine.Instantiate(UIText, {
    position: new Vector(640, 30),
    text: 'Score: 0',
    font: '20px monospace',
    color: new RGBAColor(255, 255, 255),
    textAlign: 'center',
    textBaseline: 'middle',
    layer: 0,
});

// Update at runtime
label.text = 'Score: 42';
label.color = new RGBAColor(255, 200, 0);
```

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `position` | `ICoordinates` | `(0,0)` | Screen position |
| `text` | `string` | `''` | Text content |
| `font` | `string` | `'16px monospace'` | CSS font string |
| `color` | `RGBAColor` | white | Text color |
| `textAlign` | `CanvasTextAlign` | `'left'` | Horizontal alignment relative to position |
| `textBaseline` | `CanvasTextBaseline` | `'top'` | Vertical alignment relative to position |
| `layer` | `number` | `0` | UI layer (higher = rendered later) |

### Runtime Properties

All constructor parameters are public and can be modified at runtime: `text`, `font`, `color`, `textAlign`, `textBaseline`.

## UIRect

Renders a rectangle at a screen position.

```js
const healthBar = await engine.Instantiate(UIRect, {
    position: new Vector(20, 20),
    width: 200, height: 20,
    color: new RGBAColor(50, 200, 50),
    fill: true,
    layer: 0,
});

// Update at runtime
healthBar.width = 120;
healthBar.color = new RGBAColor(200, 50, 50);
```

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `position` | `ICoordinates` | `(0,0)` | Screen position (top-left corner) |
| `width` | `number` | `100` | Rectangle width |
| `height` | `number` | `100` | Rectangle height |
| `color` | `RGBAColor` | white | Fill or stroke color |
| `fill` | `boolean` | `true` | `true` = filled, `false` = stroked outline |
| `layer` | `number` | `0` | UI layer (higher = rendered later) |

### Runtime Properties

All constructor parameters are public: `width`, `height`, `color`, `fill`.

## Visibility

Toggle UI elements with the `active` property:

```js
gameOverScreen.active = false;  // hidden, skips Update entirely
gameOverScreen.active = true;   // visible again
```

## Layering

UI layers are separate from world sprite layers. Within the UI system:

- Layer 0 renders first (background UI)
- Higher layers render on top
- All UI renders after all world content

```js
// Background panel
await engine.Instantiate(UIRect, { layer: 0, ... });
// Text on top of panel
await engine.Instantiate(UIText, { layer: 1, ... });
```

## Transform

UI elements have a `transform` with `LocalPosition` and `LocalScale`. Position is in screen pixels. Scale can be used for uniform scaling effects.

```js
// Animate scale for a bounce effect in Update()
this.transform.LocalScale = new Vector(pulse, pulse);
```

## Creating Custom UI Elements

Extend `UIElement` and implement `createRenderable()`:

```js
class UICircle extends UIElement {
    constructor(params) {
        super(params);
        this.radius = params.radius || 20;
        this.color = params.color || new RGBAColor(255, 255, 255);
    }

    createRenderable() {
        const pos = this.transform.LocalPosition;
        const radius = this.radius;
        const color = this.color.ToHex();
        return {
            layer: this.uiLayer,
            Render(ctx) {
                ctx.translate(pos.x, pos.y);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        };
    }
}
```
