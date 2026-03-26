# GameObjects & Transforms

## GameObject

`GameObject` is the core building block. It is a container that holds **Modules** (components) and **child GameObjects**, forming a scene hierarchy.

Extend `GameObject` to create your own entities:

```js
class Player extends GameObject {
    constructor(params) {
        super(params);
        this.speed = params.speed || 5;
    }

    Start() {
        // Called once on the first frame. Register modules here.
        this.sprite = new Sprite({
            image: new ImageWrapper('./player.png'),
            width: 64, height: 64, layer: 1,
        });
        this.RegisterModule(this.sprite);
    }

    FixedUpdate() {
        // Called at fixed rate (50Hz). Physics, forces, velocity go here.
        // Always call super.FixedUpdate() to propagate to modules and children.
        super.FixedUpdate();
    }

    Update() {
        // Called every frame. Rendering, input, animation go here.
        // Always call super.Update() to propagate to modules and children.
        super.Update();
    }

    Destroy() {
        // Called when the object is removed. Clean up here.
        super.Destroy();
    }
}
```

### Constructor Parameters

The base constructor accepts `BasicObjectsConstructorParams`:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `position` | `ICoordinates` | `Vector(0,0)` | Local position |
| `scale` | `ICoordinates` | `Vector(1,1)` | Local scale |
| `rotation` | `number` | `0` | Local rotation in radians |
| `rotationDeg` | `number` | — | Local rotation in degrees (overrides `rotation`) |
| `name` | `string` | class name | Object name |
| `active` | `boolean` | `true` | Whether the object is active |
| `collisionLayer` | `number` | `0` | Collision layer (0-15), see [Collider docs](./modules/collider.md#collision-layers) |

### Methods

| Method | Description |
|--------|-------------|
| `RegisterModule(module)` | Attach a Module to this GameObject |
| `GetModule<T>(ClassRef)` | Find first module matching `instanceof ClassRef`, or null |
| `GetModules<T>(ClassRef)` | Find all modules matching `instanceof ClassRef` |
| `GetModuleByName(name)` | Find a module by its name |
| `AppendChild(child)` | Add a child GameObject (returns child ID) |
| `GetChildById(id)` | Find a child by its ID |
| `RemoveChildById(id)` | Remove a child by its ID |
| `Start()` | Lifecycle — called once on first frame |
| `FixedUpdate()` | Lifecycle — called at fixed rate (50Hz), for physics |
| `Update()` | Lifecycle — called every frame, for visuals/input |
| `Destroy()` | Lifecycle — marks for removal |

```js
// Get a specific module by type
const rb = this.GetModule(RigidBody);           // RigidBody | null
const colliders = this.GetModules(Collider2D);  // Collider2D[]
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `transform` | `Transform` | The object's transform |
| `active` | `boolean` | Whether the object is active |
| `name` | `string` | The object's name |
| `Id` | `string` (readonly) | Unique identifier |
| `Context` | `CanvasContext2D` | The canvas 2D rendering context |

---

## Transform

Every `GameObject` has a `Transform` that manages its position, rotation, scale, and parent-child relationships.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `LocalPosition` | `Vector` | Position relative to parent |
| `WorldPosition` | `Vector` (readonly) | Absolute position computed from all ancestors |
| `LocalRotation` | `number` | Rotation in radians |
| `LocalRotationDeg` | `number` | Rotation in degrees |
| `WorldRotation` | `number` (readonly) | Accumulated rotation from all ancestors, accounts for scale flips |
| `LocalScale` | `Vector` | Scale relative to parent |
| `Scale` | `Vector` (readonly) | Accumulated scale from all ancestors |
| `Parent` | `Transform \| null` | Parent transform |
| `Anchors` | `{x, y}` | Pivot point (default `{x: 0.5, y: 0.5}`) |

### Directional Getters

Unit vectors representing the transform's local axes in world space. These account for both `WorldRotation` and scale flips (e.g., when `Scale.x` is negative, `Right` flips direction).

| Property | Type | Description |
|----------|------|-------------|
| `Right` | `Vector` (readonly) | Local X-axis in world space |
| `Left` | `Vector` (readonly) | Negative local X-axis |
| `Up` | `Vector` (readonly) | Local up direction (negative Y in screen space) |
| `Down` | `Vector` (readonly) | Local down direction (positive Y in screen space) |

At rotation 0 with no scale flip: `Right = (1, 0)`, `Up = (0, -1)`, matching `Vector.Right` and `Vector.Up`.

```js
// Fire a bullet in the direction the player is facing
const fireDirection = this.transform.Right;
rigidbody.Velocity = Vector.MultiplyCoordinates(bulletSpeed, fireDirection);
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `Translate(amount)` | `Transform` | Add to local position |
| `Rotate(amountRad)` | `Transform` | Add to rotation in radians (direct, no conversion overhead) |
| `RotateDeg(amount)` | `Transform` | Add to rotation in degrees |
| `LookAt(target)` | `Transform` | Set rotation so `Right` points toward a world-space position |
| `TransformPoint(localPoint)` | `Vector` | Convert a local-space point to world space |
| `InverseTransformPoint(worldPoint)` | `Vector` | Convert a world-space point to local space |

### LookAt

Sets the transform's local rotation so that its `Right` direction points toward the target.

```js
// Turret aims at enemy
this.transform.LookAt(enemy.transform.WorldPosition);
```

### TransformPoint / InverseTransformPoint

Convert points between local and world coordinate spaces, accounting for position, rotation, and scale.

```js
// Where is (10, 0) in local space in the world?
const worldPoint = this.transform.TransformPoint(new Vector(10, 0));

// Where is this world position relative to me?
const localPoint = this.transform.InverseTransformPoint(target.transform.WorldPosition);
// localPoint.x > 0 means it's to my right
// localPoint.y < 0 means it's above me (screen-up)
```

### World Position Calculation

`WorldPosition` walks the parent chain, applying each ancestor's scale, rotation (with flip correction), and position:

```
for each parent (bottom-up):
    position = position * parent.LocalScale
    position = rotate(position, parent.LocalRotation, accounting for scale flip)
    position = position + parent.LocalPosition
```

This means child objects move, rotate, and scale with their parents automatically. When a parent has negative scale on one axis, child rotations are correctly mirrored.

### Example: Nested Hierarchy

```js
const ship = await engine.Instantiate(Ship, { position: new Vector(100, 200) });

// Turret is a child — its position is relative to the ship
const turret = await engine.Instantiate(Turret, {
    position: new Vector(20, -10),
}, ship.transform);

// Barrel is a child of turret — double nesting
const barrel = await engine.Instantiate(Barrel, {
    position: new Vector(15, 0),
}, turret.transform);

// Turret aims at a target in world space
turret.transform.LookAt(targetPosition);
```
