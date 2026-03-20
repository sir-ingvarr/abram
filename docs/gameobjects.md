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

    Update() {
        // Called every frame. Game logic goes here.
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

### Methods

| Method | Description |
|--------|-------------|
| `RegisterModule(module)` | Attach a Module to this GameObject |
| `GetModuleByName(name)` | Find a module by its name |
| `AppendChild(child)` | Add a child GameObject (returns child ID) |
| `GetChildById(id)` | Find a child by its ID |
| `RemoveChildById(id)` | Remove a child by its ID |
| `Start()` | Lifecycle — called once on first frame |
| `Update()` | Lifecycle — called every frame |
| `Destroy()` | Lifecycle — marks for removal |

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
| `WorldRotation` | `number` (readonly) | Accumulated rotation from all ancestors |
| `LocalScale` | `Vector` | Scale relative to parent |
| `Scale` | `Vector` (readonly) | Accumulated scale from all ancestors |
| `Parent` | `Transform \| null` | Parent transform |
| `Anchors` | `{x, y}` | Pivot point (default `{x: 0.5, y: 0.5}`) |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `Translate(amount)` | `Transform` | Add to local position |
| `RotateDeg(amount)` | `Transform` | Add to rotation in degrees |

### World Position Calculation

`WorldPosition` walks the parent chain, applying each ancestor's scale and rotation:

```
for each parent (bottom-up):
    position = position * parent.LocalScale
    position = rotate(position, parent.LocalRotation)
    position = position + parent.LocalPosition
```

This means child objects move, rotate, and scale with their parents automatically.

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
```
