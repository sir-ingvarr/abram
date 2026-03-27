const WIDTH = 1280;
const HEIGHT = 800;

async function GameplayScene(engine) {
    const instantiate = engine.Instantiate.bind(engine);

    await engine.Instantiate(Ground, {
        position: new Vector(WIDTH / 2, HEIGHT - 10),
        groundWidth: WIDTH, groundHeight: 20,
        collisionLayer: 3,
    });

    const gm = await engine.Instantiate(GameManager, {
        instantiate,
        canvasWidth: WIDTH,
        canvasHeight: HEIGHT,
    });

    await engine.Instantiate(Turret, {
        position: new Vector(WIDTH / 2, HEIGHT - 50),
        instantiate,
        onHit: () => gm.addScore(),
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');
    const bgColor = new RGBAColor(20, 20, 35);
    const engine = new Engine(root, { width: WIDTH, height: HEIGHT, bgColor, drawFps: true, debug: false });

    await engine.RegisterGameScript('./ground.js');
    await engine.RegisterGameScript('./bullet.js');
    await engine.RegisterGameScript('./enemy.js');
    await engine.RegisterGameScript('./turret.js');
    await engine.RegisterGameScript('./game-manager.js');

    engine.RegisterScene('gameplay', GameplayScene);
    engine.Start();
    await engine.LoadScene('gameplay');
});
