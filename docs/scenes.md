# Scene Management

Scenes are setup functions registered by name.

## Usage

```js
// Define a scene
async function GameplayScene(engine) {
    await engine.Instantiate(Ground, { position: new Vector(640, 790) });
    await engine.Instantiate(Player, { position: new Vector(640, 700) });
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

## API

| Method | Description |
|--------|-------------|
| `engine.RegisterScene(name, fn)` | Register a scene function |
| `engine.LoadScene(name)` | Clear current world and run the named scene |
| `engine.GetRegisteredScenes()` | Returns registered scene names |

## Notes

- `LoadScene` destroys all game objects, resets camera, stops audio, and flushes render queues before running the scene function
- Audio buffers, collision layer matrix, and keyboard listeners survive scene transitions
