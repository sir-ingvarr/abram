# Modules

Modules are components that attach to GameObjects via `RegisterModule()`. Each module has the same `Start()` / `Update()` / `Destroy()` lifecycle.

---

## Sprite

Renders an image on screen.

```js
const image = new ImageWrapper('./character.png');
const sprite = new Sprite({
    image: image,
    width: 64,
    height: 64,
    layer: 1,       // higher layers render on top
});
this.RegisterModule(sprite);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `image` | `ImageWrapper` | **required** | The image to render |
| `width` | `number` | `100` | Display width |
| `height` | `number` | `100` | Display height |
| `layer` | `number` | `0` | Render order (z-index) |

---

## ImageWrapper

Loads and caches an image by URL. Pass it to `Sprite` or `Animator`.

```js
const img = new ImageWrapper('./assets/hero.png');
```

The image loads asynchronously. `img.isReady` becomes `true` when loaded. The `Sprite` handles this automatically.

---

## Animator

State machine for frame-based sprite animation.

```js
const sprite = new Sprite({ image: new ImageWrapper('./idle.png'), width: 32, height: 32, layer: 1 });
this.RegisterModule(sprite);

const animator = new Animator({
    frameDelay: 100,        // ms between frames
    state: 'idle',          // initial state
    graphicElement: sprite, // the Sprite to control
    stateMap: {
        idle: ['./idle.png'],
        run: ['./run1.png', './idle.png', './run2.png', './idle.png'],
        jump: ['./jump.png'],
    },
});
this.RegisterModule(animator);

// Switch state
animator.SetState('run');

// Control playback
animator.Stop();
animator.Play();
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `frameDelay` | `number` | `50` | Milliseconds between frames |
| `stateMap` | `{[state]: string[]}` | `{idle: []}` | Map of state names to arrays of image URLs |
| `state` | `string` | `'idle'` | Initial state |
| `graphicElement` | `Sprite` | **required** | The sprite this animator controls |
| `playing` | `boolean` | `true` | Whether animation is playing |

---

## RigidBody

Physics component with gravity, forces, velocity, and drag.

```js
const rb = new RigidBody({
    useGravity: true,
    mass: 2,
    drag: 0.5,
    bounciness: 0.8,
    gravityScale: 1,
});
this.RegisterModule(rb);
```

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mass` | `number` | `1` | Object mass (infinite for static) |
| `velocity` | `Vector` | `Vector(0,0)` | Initial velocity |
| `useGravity` | `boolean` | `true` | Apply gravity each frame |
| `gravityScale` | `number` | `1` | Gravity multiplier |
| `bounciness` | `number` | `1` | Restitution coefficient (0 = no bounce, 1 = full) |
| `drag` | `number` | `0.5` | Linear drag (exponential decay) |
| `angularVelocity` | `number` | `0` | Initial angular velocity |
| `angularDrag` | `number` | `0.5` | Rotational drag |
| `centerOfMass` | `ICoordinates` | `Point(0,0)` | Center of mass for torque |
| `isStatic` | `boolean` | `false` | Static bodies have infinite mass and don't move |

### Methods

| Method | Description |
|--------|-------------|
| `AddForce(force: Vector)` | Apply a linear force |
| `AddTorque(torque: number)` | Apply rotational force |
| `AddForceToPoint(point, force)` | Apply force at a point (generates both linear force and torque) |

### Properties (get/set)

`Velocity`, `Mass`, `Bounciness`, `Drag`, `AngularVelocity`, `AngularDrag`, `UseGravity`, `GravityScale`, `IsStatic`, `InvertedMass` (readonly), `PrevPosition` (readonly).

### Physics Update Order

Each frame (for non-static bodies):
1. Apply gravity
2. Calculate velocity from accumulated forces
3. Translate position by velocity * deltaTime
4. Calculate angular velocity from accumulated torque
5. Apply exponential drag: `velocity *= e^(-drag * dt)`

---

## Collider2D

Circle-based 2D collision detection. Requires a connected `RigidBody`.

```js
const collider = new Collider2D({
    shape: new CircleArea(25, Vector.Zero),   // radius 25, centered on object
    type: Collider2DType.Collider,            // or Collider2DType.Trigger
    parent: this.transform,
    rb: this.rigidBody,
});
this.RegisterModule(collider);
```

### Collider Types

- **Collider** — resolves physics (impulse response, position correction)
- **Trigger** — detects overlap only, no physics response

### Events

Listen for collision events via the event emitter:

```js
collider.On(Collider2DEvent.OnCollision2DEnter, (self, other) => {
    console.log('Collided with', other);
});

collider.On(Collider2DEvent.OnCollision2DLeave, (self, other) => {
    console.log('Stopped colliding with', other);
});

// For triggers:
collider.On(Collider2DEvent.OnTriggerEnter, (self, other) => { });
collider.On(Collider2DEvent.OnTriggerExit, (self, other) => { });
```

### Collision Response

The engine uses impulse-based resolution:
- Calculates relative velocity along the collision normal
- Applies impulse scaled by restitution (average of both bodies' bounciness)
- Corrects overlapping positions to prevent sinking

---

## GraphicPrimitive

Renders geometric shapes (circles, rectangles, lines, polygonal chains).

```js
const circle = new GraphicPrimitive({
    type: PrimitiveType.Circle,
    shape: new Circle(20, new Point(0, 0)),
    parent: this.transform,
    drawMethod: ShapeDrawMethod.Fill,
    layer: 2,
    options: {
        fillStyle: new RGBAColor(255, 0, 0).ToHex(),
    },
});
this.RegisterModule(circle);
```

### PrimitiveType

`Circle`, `Rect`, `Line`, `Lines`, `Chain`

### ShapeDrawMethod

`Fill`, `Stroke`

### Options (`CtxOptions`)

`fillStyle`, `strokeStyle`, `lineWidth`, `lineCap`, `lineJoin`, `dash`, plus shadow options.

---

## TrailRenderer

Creates motion trails behind a moving object.

```js
const trail = new TrailRenderer({
    gameObject: this,
    layer: 2,
    initialColor: new RGBAColor(255, 100, 50),
    initialWidth: 10,
    lifeTime: 2000,                          // ms before segments fade
    newSegmentEachMS: 30,                    // segment spawn rate
    widthOverTrail: (factor, initial) => initial * (1 - factor),
    colorOverTrail: (factor, initial) => {
        const c = initial.Copy();
        c.Alpha = Math.floor(255 * (1 - factor));
        return c;
    },
});
this.RegisterModule(trail);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `gameObject` | `GameObject` | **required** | The object to trail |
| `lifeTime` | `number` | `100` | Segment lifetime in ms |
| `initialColor` | `RGBAColor` | white | Starting trail color |
| `initialWidth` | `number` | `2` | Starting trail width |
| `layer` | `number` | `1` | Render layer |
| `newSegmentEachMS` | `number` | `10` | Spawn rate in ms |
| `widthOverTrail` | `(factor, initial) => number` | linear fade | Width curve (factor: 0..1) |
| `colorOverTrail` | `(factor, initial) => RGBAColor` | alpha fade | Color curve (factor: 0..1) |

---

## Camera

Singleton camera controlling the viewport.

```js
// First call creates the instance
const cam = Camera.GetInstance({ width: 1280, height: 800, position: new Point(0, 0) });

// Subsequent calls return the same instance
const cam = Camera.GetInstance({});
```

### Constructor Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | `1280` | Viewport width |
| `height` | `number` | `800` | Viewport height |
| `position` | `Vector` | `Vector(0,0)` | Initial position |
| `confiner` | `BoundingBox` | `null` | Bounds the camera cannot leave (see Confiner below) |

### Properties (get/set)

| Property | Type | Description |
|----------|------|-------------|
| `Position` | `ICoordinates` | Camera position (top-left corner) |
| `Center` | `ICoordinates` | Set position so this point is centered |
| `Scale` | `ICoordinates` | Zoom level (default `Vector(1,1)`) — values > 1 zoom in, < 1 zoom out |
| `Confiner` | `BoundingBox \| null` | Confiner bounds (set to `null` to disable) |

### Zoom

Setting `Scale` applies a zoom transform centered on the canvas midpoint. Higher values zoom in (objects appear larger, viewport covers less world space).

```js
// Zoom in to 2x
cam.Scale = Vector.Of(2, 2);

// Zoom out to half
cam.Scale = Vector.Of(0.5, 0.5);
```

### Confiner

The confiner restricts the camera so its visible edges never go outside a `BoundingBox`. This is useful for preventing the camera from showing empty space beyond level boundaries.

```js
const cam = Camera.GetInstance({
    width: 1280, height: 800,
    confiner: new BoundingBox(new Point(-500, -300), new Point(500, 300)),
});

// Or set/change later:
cam.Confiner = new BoundingBox(new Point(-1000, -600), new Point(1000, 600));

// Remove confiner:
cam.Confiner = null;
```

The confiner accounts for zoom — when zoomed in, the visible area shrinks, so the camera can move closer to the edges. If the viewport is larger than the confiner (e.g. when zoomed out far), the camera centers within the confiner instead of oscillating.

**Important:** Call `cam.Confine()` once per frame, after setting both position/center and scale. This avoids double-clamping when position and scale change in the same frame.

```js
Update() {
    cam.Center = targetPosition;
    cam.Scale = Vector.Of(zoomLevel, zoomLevel);
    cam.Confine();  // apply bounds after all changes
}
```

### Methods

| Method | Description |
|--------|-------------|
| `Confine()` | Clamp position to confiner bounds. Call once per frame after setting position and scale. |
| `ResetCenterPoint(width, height?)` | Update the viewport dimensions used for center and confiner calculations |
