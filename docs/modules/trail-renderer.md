# TrailRenderer

Creates motion trails behind a moving GameObject by spawning line segments between the previous and current position.

## Usage

```js
const trail = new TrailRenderer({
    gameObject: this,
    layer: 2,
    initialColor: new RGBAColor(255, 100, 50),
    initialWidth: 10,
    lifeTime: 2000,
    newSegmentEachMS: 30,
    widthOverTrail: (factor, initial) => initial * (1 - factor),
    colorOverTrail: (factor, initial) => {
        const color = initial.Copy();
        color.Alpha = Math.floor(255 * (1 - factor));
        return color;
    },
});
this.RegisterModule(trail);
```

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `gameObject` | `GameObject` | **required** | The object to trail |
| `lifeTime` | `number` | `100` | Segment lifetime in ms |
| `initialColor` | `RGBAColor` | white | Starting trail color |
| `initialWidth` | `number` | `2` | Starting trail width in pixels |
| `layer` | `number` | `1` | Render layer |
| `newSegmentEachMS` | `number` | `10` | Time between new segments in ms |
| `widthOverTrail` | `(factor, initialWidth) => number` | linear fade | Width curve (`factor`: 0 = newest, 1 = oldest) |
| `colorOverTrail` | `(factor, initialColor) => RGBAColor` | alpha fade | Color curve |

## How It Works

- Each segment is a line from the previous position to the current position
- Segments are spawned at the rate defined by `newSegmentEachMS`
- Each frame, existing segments age and are updated by `widthOverTrail` and `colorOverTrail` curves
- Segments that exceed `lifeTime` are removed
- The first position is captured lazily on the first update frame (not in `Start`), avoiding incorrect (0,0) initial segments

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `WidthOverTrail` | `function` (readonly) | Current width curve |
| `ColorOverTrail` | `function` (readonly) | Current color curve |

## Notes

- Segments iterate backwards during update to avoid index-skipping when removing expired segments
- Each segment renders as a `GraphicPrimitive` line with `disrespectParent: true` (world-space positions)
- Trail works correctly with nested parent transforms since it reads `WorldPosition`
