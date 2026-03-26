# PhysicsMaterial

Defines physical surface properties. Attach to a RigidBody to control friction, bounciness, and density-based mass.

## Usage

```js
const material = new PhysicsMaterial({
    friction: 0.6,
    bounciness: 0.3,
    density: 2.0,
});

this.rb = new RigidBody({
    material: material,
    useGravity: true,
});
```

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `friction` | `number` | `0.4` | Surface friction coefficient |
| `bounciness` | `number` | `null` | Overrides RigidBody.Bounciness when set |
| `density` | `number` | `null` | Mass = density * collider area |

## Friction

Applied during collision response as a tangential impulse opposing sliding motion.

Combined between two bodies using **geometric mean**:

```
combinedFriction = sqrt(frictionA * frictionB)
```

A body with no material has friction `0`. Two bodies with friction `0.5` each produce combined friction `0.5`. A body with friction `1.0` hitting one with friction `0.25` produces `0.5`.

## Bounciness Override

When set, overrides the `bounciness` value from the RigidBody constructor. This allows sharing a material across multiple bodies while controlling bounce from one place.

```js
// Material bounciness takes priority
const rubber = new PhysicsMaterial({ bounciness: 0.9, friction: 0.8 });
const rb = new RigidBody({ bounciness: 0.5, material: rubber });
// Effective bounciness in collisions: 0.9
```

When `null` (default), the RigidBody's own bounciness is used.

## Density

When a Collider2D is created with a RigidBody that has a material with density, mass is automatically computed:

```
mass = density * colliderArea
```

| Shape | Area Formula |
|-------|-------------|
| CircleArea | `pi * radius^2` |
| OBBShape | `width * height` |

```js
// A 50x50 OBB with density 2.0 → mass = 2.0 * 2500 = 5000
const material = new PhysicsMaterial({ density: 2.0 });
const rb = new RigidBody({ material });
const collider = new Collider2D({
    shape: new OBBShape(50, 50),
    rb: rb, parent: this.transform,
    type: Collider2DType.Collider,
});
```

## Static Methods

| Method | Description |
|--------|-------------|
| `PhysicsMaterial.CombineFriction(matA, matB)` | Geometric mean of two materials' friction |
| `PhysicsMaterial.CombineBounciness(matA, defaultA, matB, defaultB)` | Average bounciness, using material override or default |
| `PhysicsMaterial.CalculateMassFromDensity(density, area)` | Returns `density * area` |
