# Particle System

`ParticleSystem` is a manager that spawns and updates particles. It attaches to a parent `GameObject` and supports emission modes, lifetime curves, pooling, and sub-emitters.

## Basic Usage

```js
class FireEffect extends GameObject {
    Start() {
        this.ps = new ParticleSystem({
            parent: this,
            params: {
                layer: 3,
                maxParticles: 500,
                emitOverTime: 20,
                emitEachTimeFrame: 100,      // ms between emission bursts
                lifeTime: () => Maths.RandomRange(500, 1500),
                initialVelocity: () => new Vector(
                    Maths.RandomRange(-50, 50),
                    Maths.RandomRange(-200, -100),
                ),
                initialSize: () => Maths.RandomRange(5, 15),
                initialColor: new RGBAColor(255, 150, 0),
                gravityForceScale: 0.1,
            },
        });
    }

    Update() {
        super.Update();
        this.ps.Update();   // must be called manually
    }
}
```

## Constructor

```js
new ParticleSystem({ parent, modules?, params })
```

`parent` is the `GameObject` that owns this system. `params` is a `ParticleSystemOptions` object.

## ParticleSystemOptions

All value parameters accept either a static value or a function that returns a value. Functions are called per-particle at spawn time, enabling randomization.

### Emission

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxParticles` | `number` | `10` | Maximum alive particles |
| `emitOverTime` | `number \| () => number` | `10` | Particles per emission burst |
| `emitEachTimeFrame` | `number \| () => number` | `0.2` | Seconds between emission bursts |
| `emitOverDistance` | `number \| () => number` | `0` | Particles per unit of emitter movement |
| `burstEmit` | `object \| () => object` | — | Burst emission config (see below) |
| `isPlaying` | `boolean` | `true` | Whether emission is active |

### Burst Emission

```js
burstEmit: {
    repeat: true,       // keep bursting
    every: 2000,        // ms between bursts
    emit: 50,           // particles per burst (can be a function)
    skipFirst: false,    // skip burst on creation
}
```

### Particle Properties

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lifeTime` | `number \| () => number` | `5000` | Particle lifetime in ms |
| `initialVelocity` | `Vector \| () => Vector` | `Vector(0,0)` | Starting velocity |
| `initialPosition` | `Vector \| () => Vector` | random near emitter | Starting offset from emitter |
| `initialRotation` | `number \| () => number` | random 0-360 | Starting rotation in degrees |
| `initialColor` | `RGBAColor \| () => RGBAColor` | white | Starting color |
| `initialSize` | `number \| () => number` | random -10 to 10 | Starting size |
| `gravityForceScale` | `number \| () => number` | `1` | Gravity multiplier per particle |
| `drag` | `number \| () => number` | `0` | Particle drag |

### Rendering

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `graphic` | `ImageWrapper \| IGraphicPrimitive \| () => ...` | `null` | Visual for each particle |
| `layer` | `number` | **required** | Render layer |
| `renderingStyle` | `RenderingStyle` | `Local` | `Local` (relative to emitter) or `World` (absolute) |

### Lifetime Curves

Functions called every frame per particle. `factor` goes from `0` (spawn) to `1` (death).

| Option | Signature | Description |
|--------|-----------|-------------|
| `colorOverLifeTime` | `(initialColor, factor) => RGBAColor` | Animate color |
| `velocityOverLifeTime` | `(factor) => Vector` | Add velocity over time |
| `rotationOverLifeTime` | `(factor) => number` | Set rotation over time |
| `scaleOverLifeTime` | `(factor) => {x, y}` | Multiply initial scale |

### Callbacks

| Option | Signature | Description |
|--------|-----------|-------------|
| `onParticleCollision` | `(self, other) => void` | Called when a particle collides |
| `onParticleDestroy` | `(position) => void` | Called when a particle dies |

### Advanced

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `particleBuffering` | `boolean` | `false` | Pool and reuse dead particles |
| `particleBufferSize` | `number` | `maxParticles + 50` | Pool size |
| `occlusionCulling` | `boolean` | `true` | Skip rendering off-screen particles |
| `inheritVelocity` | `boolean` | `false` | Particles inherit emitter velocity |
| `particleFollowers` | `GameObject[] \| () => GameObject[]` | — | GameObjects instantiated at each particle |
| `subEmitter` | `ParticleSystem` | — | Sub-system spawned per particle |

## Methods

| Method | Description |
|--------|-------------|
| `Update()` | Process emission and update particles (call in your `Update()`) |
| `Play()` | Resume emission |
| `Pause()` | Stop emission (existing particles continue) |
| `TotalParticles` | (getter) Current alive particle count |

## Example: Fireworks

```js
// Graphic can be a function — called per particle for variety
graphic: () => new GraphicPrimitive({
    type: PrimitiveType.Rect,
    shape: new Rect(new Point(), new Point(10, 10)),
    parent: this.transform,
    drawMethod: ShapeDrawMethod.Fill,
}),

// Color fades out
colorOverLifeTime: (initial, factor) => {
    const c = initial.Copy();
    c.Alpha = Math.floor(255 * (1 - factor));
    return initial.LerpTo(c, factor);
},

// Scale shrinks
scaleOverLifeTime: (factor) => ({
    x: 1 - factor,
    y: 1 - factor,
}),

// Explode outward from center
initialVelocity: () => new PolarCoordinates({
    r: Maths.RandomRange(50, 350),
    angle: Maths.RandomRange(0, 2 * Math.PI),
}).ToCartesian().ToVector(),
```
