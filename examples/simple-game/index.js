async function GameScene(engine) {
    const camera = new CameraMovement({});
    engine.AppendGameObject(camera);

    const gameObject = new Man({
        position: new Vector(10, -50), name: 'Man', layer: 1,
        instantiate: engine.Instantiate.bind(engine),
    }, camera);
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ManTwo({
        position: new Vector(60, -50), name: 'Man2', layer: 3
    });
    engine.AppendGameObject(gameObject2);

    engine.AppendGameObject(new Floor({
        position: new Vector(0, 55), floorWidth: 2000, floorHeight: 40
    }));
}

document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');
    const bgColor = new RGBAColor(150,0,0, 150);
    const engine = new Engine(root, { width: 1280, height: 800, bgColor, drawFps: true, debug: false });

    await engine.RegisterGameScript('./floor.js')
    await engine.RegisterGameScript('./bullet.js')
    await engine.RegisterGameScript('./man.js')
    await engine.RegisterGameScript('./man2.js');
    await engine.RegisterGameScript('./camera-movement.js')

    engine.RegisterScene('game', GameScene);
    engine.Start();
    await engine.LoadScene('game');
    InputSystem.AddEventListener('Escape', () => engine.LoadScene('game'));
});
