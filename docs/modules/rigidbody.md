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

## Physics Update Order

Runs in `FixedUpdate` at fixed timestep (default 50Hz, 20ms). Skipped for static and sleeping bodies:

1. Check sleep (displacement-based, comparing position to previous step)
2. Apply gravity: `velocity += gravityScale * 9.82 * Vector.Down * fixedDt`
3. Calculate velocity from accumulated forces: `velocity += (force / mass) * fixedDt`
4. Clamp to `velocityLimit` if set
5. Translate position by `velocity * fixedDt * PixelsPerMeter` (default 100 px/m)
6. Calculate angular velocity from torque
7. Apply exponential drag: `velocity *= e^(-drag * fixedDt)`

Velocity is in **meters/second**. Conversion to pixels uses `PhysicsMaterial.PixelsPerMeter`.

## Interpolation

Opt-in per rigidbody via `interpolate: true` (default `false`). When enabled, positions are lerped between the previous and current physics step for smooth rendering. `RigidBody.InterpolateAll(alpha)` and `RigidBody.RestoreAll()` are called automatically by the GameLoop before and after rendering; bodies with `interpolate: false` are skipped.

## Sleep

Bodies auto-sleep after **15 consecutive fixed-update steps** with net displacement below threshold (0.01 px). Sleeping bodies:

- Skip physics updates entirely
- Are skipped in collision pairs only when both bodies are sleeping
- Wake automatically on `AddForce`, `AddImpulse`, `AddTorque`
- Wake on significant penetration correction (> 0.1 px) from another body
- Wake on non-resting collision impact

## Collision Response

CollisionsManager distinguishes **resting contacts** from **impacts**:

- **Resting**: pair was active in previous frames AND relative velocity along normal < 0.5 m/s. Normal velocity is cancelled, friction is applied to tangential velocity, penetration correction is 100% with no slop.
- **Impact**: first contact OR high relative velocity. Full impulse with restitution (bounciness), 80% penetration correction with slop.

Penetration correction runs **3 iterative passes** after the main collision pass to resolve competing constraints (e.g. balls squeezed between walls).
