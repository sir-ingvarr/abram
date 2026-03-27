# RigidBody

Physics body with gravity, forces, velocity, drag, and angular motion. Only one per GameObject (`canBeDuplicated = false`).

## Usage

```js
this.rb = new RigidBody({
    useGravity: true,
    mass: 1,
    drag: 0.5,
    bounciness: 0.8,
    material: new PhysicsMaterial({ friction: 0.6, density: 2 }),
});
this.RegisterModule(this.rb);
```

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mass` | `number` | `1` | Body mass (infinite for static) |
| `velocity` | `Vector` | `(0,0)` | Initial velocity |
| `useGravity` | `boolean` | `true` | Apply gravity each frame |
| `gravityScale` | `number` | `1` | Gravity multiplier |
| `bounciness` | `number` | `1` | Restitution (0 = no bounce, 1 = full) |
| `drag` | `number` | `0.5` | Linear drag (exponential decay) |
| `angularVelocity` | `number` | `0` | Initial spin |
| `angularDrag` | `number` | `0.5` | Rotational drag |
| `centerOfMass` | `ICoordinates` | `(0,0)` | Center of mass for torque |
| `isStatic` | `boolean` | `false` | Static = infinite mass, no movement |
| `freezeRotation` | `boolean` | `false` | Block all angular velocity and torque |
| `velocityLimit` | `Vector` | `null` | Clamp velocity per-axis. `null` = no limit |
| `material` | `PhysicsMaterial` | `null` | Surface properties (friction, density, bounciness override) |
| `interpolate` | `boolean` | `false` | Smooth rendering between physics steps (lerp prev→current position) |

## Methods

| Method | Description |
|--------|-------------|
| `AddForce(force)` | Accumulate a force (applied in physics update, divided by mass) |
| `AddImpulse(impulse)` | Instant velocity change (multiplied by inverse mass) |
| `AddTorque(torque)` | Add angular velocity (blocked by `freezeRotation`) |
| `AddForceToPoint(point, force)` | Force at a point -- generates both linear force and torque |
| `AddImpulseAtPoint(point, impulse)` | Impulse at a point -- generates both velocity change and torque |
| `Wake()` | Wake a sleeping body |
| `Sleep()` | Put body to sleep (zeroes all velocity) |
| `ApplyDensityFromArea(area)` | Recalculate mass from material density and collider area |

## Properties (get/set)

| Property | Type | Description |
|----------|------|-------------|
| `Velocity` | `Vector` | Current velocity |
| `Mass` | `number` | Body mass |
| `Bounciness` | `number` | Restitution (material overrides if set) |
| `Drag` | `number` | Linear drag |
| `AngularVelocity` | `number` | Current spin rate |
| `AngularDrag` | `number` | Rotational drag |
| `UseGravity` | `boolean` | Gravity enabled |
| `GravityScale` | `number` | Gravity multiplier |
| `IsStatic` | `boolean` | Static body flag |
| `FreezeRotation` | `boolean` | Rotation lock (setting `true` zeroes angular velocity) |
| `VelocityLimit` | `Vector \| null` | Per-axis velocity clamp |
| `IsSleeping` | `boolean` (readonly) | Whether the body is asleep |
| `InvertedMass` | `number` (readonly) | `1 / mass` (0 for static) |
| `PrevPosition` | `ICoordinates` (readonly) | Position from previous physics step |

## Notes

- Physics runs in `FixedUpdate` at 50Hz. Static and sleeping bodies are skipped.
- Velocity is in **meters/second**. Conversion to pixels uses `PhysicsMaterial.PixelsPerMeter` (default 100).
- `interpolate: true` lerps positions between physics steps for smoother rendering.
- Bodies auto-sleep after sustained near-zero movement. They wake on force, impulse, or collision.
