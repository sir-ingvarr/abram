# Scene Management

Scenes are setup functions registered by name.

## Usage

```js
// Define a scene — use AppendGameObject for initial setup
async function GameplayScene(engine) {
    const ground = new Ground({ position: new Vector(640, 790) });
    engine.AppendGameObject(ground);

    const player = new Player({ position: new Vector(640, 700) });
    engine.AppendGameObject(player);
}

// Register and load
engine.RegisterScene('gameplay', GameplayScene);
engine.Start();
await engine.LoadScene('gameplay');
```

## Switching Scenes

```js
Engine.Instance.LoadScene('gameplay');
```

Restarting is just reloading the same scene.

## Adding Objects

Use `AppendGameObject` during scene setup to register objects immediately. Use `Instantiate` during gameplay to spawn objects at the start of the next frame (see [Getting Started](./getting-started.md#adding-game-objects) for details).

```js
// Scene setup — immediate
engine.AppendGameObject(new Player({ position: new Vector(100, 100) }));

// Runtime spawning — deferred to next frame
const bullet = await engine.Instantiate(Bullet, { position: spawnPos });
```

## API

| Method | Description |
|--------|-------------|
| `engine.RegisterScene(name, fn)` | Register a scene function |
| `engine.LoadScene(name)` | Clear current world and run the named scene |
| `engine.GetRegisteredScenes()` | Returns registered scene names |

## Notes

- `LoadScene` destroys all game objects, resets camera, stops audio, and flushes render queues before running the scene function
- Audio buffers, collision layer matrix, and keyboard listeners survive scene transitions
