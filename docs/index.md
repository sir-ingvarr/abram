# ABRAM Documentation

**ABRAM** (Advanced Browser Rendering Abstraction Module) is a Unity-inspired 2D game engine for browsers. Written in TypeScript with zero dependencies, rendering via Canvas2D.

## Table of Contents

### Core

- [Getting Started](./getting-started.md) -- Installation, setup, and your first project
- [Architecture](./architecture.md) -- Project structure, game loop, coordinate system
- [GameObjects & Transforms](./gameobjects.md) -- Scene hierarchy, transforms, directional getters

### Modules

- [Modules Overview](./modules.md) -- Dependency system, creating custom modules
- [Sprite](./modules/sprite.md) -- Image rendering
- [Animator](./modules/animator.md) -- Frame-based sprite animation
- [RigidBody](./modules/rigidbody.md) -- Physics simulation, forces, sleep
- [Collider2D](./modules/collider.md) -- Collision shapes, detection, layers
- [PhysicsMaterial](./modules/physics-material.md) -- Friction, density, surface properties
- [TrailRenderer](./modules/trail-renderer.md) -- Motion trail effects
- [Camera](./modules/camera.md) -- Viewport, zoom, confiner

### Systems

- [Particle System](./particles.md) -- Emitters, lifetime curves, sub-emitters
- [Math & Utilities](./math.md) -- Vector, Point, RGBAColor, Maths, collections
- [Input & Time](./input.md) -- Keyboard input, deltaTime, timeScale
