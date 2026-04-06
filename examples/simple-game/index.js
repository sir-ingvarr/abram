async function GameScene(engine) {
    // Collision layers: 0=floor, 1=player, 2=enemies, 3=player bullets, 4=enemy bullets
    CollisionsManager.SetLayerCollision(1, 3, false);
    CollisionsManager.SetLayerCollision(2, 4, false);
    CollisionsManager.SetLayerCollision(3, 4, false);
    CollisionsManager.SetLayerCollision(1, 2, false);

    const camera = new CameraMovement({});
    engine.AppendGameObject(camera);

    const bg = new InfiniteBackground({
        imageSrc: './assets/city.png',
        width: 1440,
        height: 900,
        layer: 0,
        position: new Vector(0, -50),
    });
    engine.AppendGameObject(bg);

    const floor = new InfiniteFloor({
        position: new Vector(0, 320),
        floorWidth: 1280,
        floorHeight: 80,
    });
    engine.AppendGameObject(floor);

    const instantiate = engine.Instantiate.bind(engine);

    const player = new Man({
        position: new Vector(10, 250), name: 'Man', layer: 2,
        instantiate,
    }, camera);
    engine.AppendGameObject(player);

    const spawner = new EnemySpawner({ player, instantiate });
    engine.AppendGameObject(spawner);

    const hud = new HUD({ player, instantiate });
    engine.AppendGameObject(hud);
}

document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');
    const bgColor = new RGBAColor(30, 30, 50, 255);
    const engine = new Engine(root, { width: 1280, height: 800, bgColor, drawFps: true, debug: false });

    await engine.RegisterGameScript('./floor.js')
    await engine.RegisterGameScript('./bullet.js')
    await engine.RegisterGameScript('./man.js')
    await engine.RegisterGameScript('./man2.js')
    await engine.RegisterGameScript('./camera-movement.js')
    await engine.RegisterGameScript('./infinite-background.js')
    await engine.RegisterGameScript('./enemy-spawner.js')
    await engine.RegisterGameScript('./hud.js')

    engine.RegisterScene('game', GameScene);
    engine.Start();
    await engine.LoadScene('game');
    InputSystem.AddEventListener('Escape', () => engine.LoadScene('game'));
});
