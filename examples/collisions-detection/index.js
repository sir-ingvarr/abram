async function CollisionsScene(engine) {
    await engine.Instantiate(CameraMovement, {});
    await engine.Instantiate(Shape, { input: 0, position: new Vector(0, -150), isStatic: true, size: 50, bounciness: 1 });
    await engine.Instantiate(Spawner, { position: new Vector(0, -390), spawnRadius: 50, spawnEvery: 1000, instantiate: engine.Instantiate.bind(engine) });
}

document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const engine = new Engine(root, { width: 1280, height: 800, debug: false, canvasContextAttributes: { alpha: false }, drawFps: true, pauseOnBlur: false });
    await engine.RegisterGameScript('./Shape.js');
    await engine.RegisterGameScript('./camera-movement.js');
    await engine.RegisterGameScript('./spawner.js');

    engine.RegisterScene('collisions', CollisionsScene);
    engine.Start();
    await engine.LoadScene('collisions');
    InputSystem.AddEventListener('Escape', () => engine.LoadScene('collisions'));
});
