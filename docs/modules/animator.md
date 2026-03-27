# Animator

State machine for frame-based sprite animation. Controls a Sprite's image based on the current animation state.

`canBeDuplicated = false`, `dependencies = [Sprite]`.

The Animator automatically finds the Sprite on the same GameObject in `Start()`. You can optionally pass `graphicElement` to override this.

## Usage

```js
const sprite = new Sprite({
    image: new ImageWrapper('./idle.png'),
    width: 32, height: 32, layer: 1,
});
this.RegisterModule(sprite);

// Sprite is found automatically -- no need to pass graphicElement
const animator = new Animator({
    frameDelay: 100,
    state: 'idle',
    stateMap: {
        idle: ['./idle.png'],
        run: ['./run1.png', './idle.png', './run2.png', './idle.png'],
        jump: ['./jump.png'],
    },
});
this.RegisterModule(animator);
```

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frameDelay` | `number` | `50` | Milliseconds between frames |
| `stateMap` | `{[state]: string[]}` | `{idle: []}` | Map of state names to image URL arrays |
| `state` | `string` | `'idle'` | Initial state |
| `graphicElement` | `Sprite` | auto-resolved | Override: manually specify the sprite to control |
| `playing` | `boolean` | `true` | Whether animation is playing on start |

## Methods

| Method | Description |
|--------|-------------|
| `SetState(name)` | Switch to a different animation state |
| `Stop()` | Pause animation on current frame |
| `Play()` | Resume animation |

## Notes

- Each state's image array loops infinitely using an internal iterator
- `SetState` is safe to call every frame -- it only triggers a transition if the state actually changes
- All images in the state map should be pre-loaded via `new ImageWrapper()` before the animator starts
