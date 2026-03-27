# Modules

Modules are reusable components that attach to GameObjects via `RegisterModule()`. Each module follows the `Start()` / `FixedUpdate()` / `Update()` / `Destroy()` lifecycle.

- **`FixedUpdate()`** — called at a fixed rate (default 50Hz). Use for physics, forces, velocity manipulation.
- **`Update()`** — called once per frame. Use for rendering, input, animation, UI.

## Available Modules

| Module | Description | Docs |
|--------|-------------|------|
| Sprite | Image rendering | [sprite.md](./modules/sprite.md) |
| Animator | Frame-based sprite animation | [animator.md](./modules/animator.md) |
| RigidBody | Physics simulation | [rigidbody.md](./modules/rigidbody.md) |
| Collider2D | Collision detection (circle + OBB) | [collider.md](./modules/collider.md) |
| PhysicsMaterial | Surface properties (friction, density) | [physics-material.md](./modules/physics-material.md) |
| TrailRenderer | Motion trail effect | [trail-renderer.md](./modules/trail-renderer.md) |
| Camera | Viewport control and zoom | [camera.md](./modules/camera.md) |
| Debug | Visual debug overlay and logging | [debug.md](./modules/debug.md) |
| AudioManager | Sound loading and playback | [audio.md](./modules/audio.md) |

## Dependencies & Duplication

Modules can declare static **dependencies** on other module types and control whether they can be **duplicated** on the same GameObject.

```js
class MyModule extends Module {
    static dependencies = [RigidBody];    // requires RigidBody
    static canBeDuplicated = false;       // only one allowed
}
```

**Dependency behavior:**
- If a module is registered before its dependencies, it stays **inactive** and won't receive `Start()` or `Update()` calls
- A warning is logged listing the missing dependencies
- When the missing dependency is later registered, the pending module automatically activates

**Duplication behavior:**
- If `canBeDuplicated = false` and a duplicate exists, registration is rejected with a warning
- Default is `true`

**Built-in constraints:**

| Module | canBeDuplicated | dependencies |
|--------|----------------|--------------|
| Sprite | false | none |
| Animator | false | Sprite |
| RigidBody | false | none |
| Collider2D | false | RigidBody |

## Creating Custom Modules

Extend `Module` and override lifecycle methods:

```js
class Health extends Module {
    static canBeDuplicated = false;

    constructor() {
        super({ name: 'Health' });
        this.hp = 100;
    }

    Start() {
        super.Start();
        // Initialize after all modules are registered
    }

    FixedUpdate() {
        // Called at fixed rate (50Hz) — use for physics
    }

    Update() {
        // Called every frame — use for visuals, input
        if(this.hp <= 0) this.gameObject.Destroy();
    }

    TakeDamage(amount) {
        this.hp -= amount;
    }
}
```

## Module Lookup

Find modules on a GameObject by type:

```js
const rb = this.GetModule(RigidBody);           // RigidBody | null
const colliders = this.GetModules(Collider2D);  // Collider2D[]
const health = this.GetModule(Health);           // Health | null
```
