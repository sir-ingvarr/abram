# Collider2D

2D collision detection and response. Supports circle and OBB (oriented bounding box) shapes. Only one per GameObject (`canBeDuplicated = false`), requires a RigidBody (`dependencies = [RigidBody]`).

## Usage

```js
// Circle collider
this.collider = new Collider2D({
    shape: new CircleArea(25, Vector.Zero),
    type: Collider2DType.Collider,
    parent: this.transform,
    rb: this.rigidBody,
});

// Rect collider (OBB -- supports rotation)
this.collider = new Collider2D({
    shape: new OBBShape(width, height),
    type: Collider2DType.Collider,
    parent: this.transform,
    rb: this.rigidBody,
});

this.RegisterModule(this.collider);
```

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `shape` | `CircleArea \| OBBShape` | `CircleArea(10)` | Collision shape |
| `type` | `Collider2DType` | `.Collider` | Collider or Trigger |
| `parent` | `ITransform` | **required** | Parent transform |
| `rb` | `RigidBody` | **required** | Connected rigidbody |

## Collider Types

- **Collider** -- resolves physics (impulse, friction, position correction)
- **Trigger** -- detects overlap only, no physics response

## Shape Types

### CircleArea

```js
new CircleArea(radius, center, offset?)
```

- `radius` -- collision radius
- `center` -- local center point (usually `Vector.Zero`)
- `Area` getter -- `pi * r^2`

### OBBShape

```js
new OBBShape(width, height)
```

- Automatically syncs rotation from parent `WorldRotation` each frame
- `Area` getter -- `width * height`
- Supports full rotation -- not axis-aligned

## Events

```js
collider.On(Collider2DEvent.OnCollision2DEnter, (self, other) => {
    console.log('Hit:', other.connectedRigidbody.gameObject.name);
});

collider.On(Collider2DEvent.OnCollision2DLeave, (self, other) => {
    console.log('Separated from:', other);
});

// For triggers:
collider.On(Collider2DEvent.OnTriggerEnter, (self, other) => { });
collider.On(Collider2DEvent.OnTriggerExit, (self, other) => { });
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `IsColliding` | `boolean` (readonly) | `true` if any active contacts exist |
| `shape` | `ColliderShape` | The collision shape |
| `connectedRigidbody` | `RigidBody` | The connected physics body |

## Collision Layers

GameObjects have a `collisionLayer` property (0-15, default 0). Configure which layers interact:

```js
// Define layers
const LAYER_PLAYER = 1;
const LAYER_ENEMY = 2;
const LAYER_BULLET = 3;

// Assign on construction
const player = new Player({ collisionLayer: LAYER_PLAYER });

// Configure matrix (default: all collide with all)
CollisionsManager.SetLayerCollision(LAYER_PLAYER, LAYER_BULLET, false);
CollisionsManager.SetLayerCollision(LAYER_BULLET, LAYER_BULLET, false);

// Check
CollisionsManager.GetLayerCollision(LAYER_PLAYER, LAYER_BULLET); // false
```

The matrix is symmetric -- `SetLayerCollision(1, 3, false)` also sets `(3, 1)`.

## Notes

- When the RigidBody has a `PhysicsMaterial` with `density`, mass is auto-calculated from the collider shape area.
- Collider outlines render when `debug: true` is set on the Engine.
