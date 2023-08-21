document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, targetFps: 60, debug: false, drawFps: true, pauseOnBlur: false });

    await engine.RegisterGameScript('./camera-movement.js')
    await engine.RegisterGameScript('./explosion.js');
    await engine.RegisterGameScript('./smoke.js')
    await engine.RegisterGameScript('./rocket.js')
    await engine.RegisterGameScript('./bg.js');

    const camera = new CameraMovement({});
    engine.AppendGameObject(camera);

    const bgSprite = new Sprite({
        height: 800,
        width: 1280,
        image: new ImageWrapper('./assets/nightsky.png'),
        layer: 0,
    });

    const bg = new Bg({sprite: bgSprite, position: new Point()});
    engine.AppendGameObject(bg);

    const colors = [
        new RGBAColor(230),
        new RGBAColor(0, 200),
        new RGBAColor(220, 190, 5),
        new RGBAColor(110, 10, 230),
        new RGBAColor(230, 140, 20),
    ];

    function SpawnTheExplosion(pos) {
        rocket.AppendChild(
            new Explosion({
                position: new Vector(pos.x, pos.y), lifetime: 1000,
                color: Math.random() < 0.35
                    ? () => colors[Maths.RandomRange(0, colors.length - 1, true)]
                    : colors[Maths.RandomRange(0, colors.length - 1, true)],

            })
        );
    }

    const smokeParticles = Smoke;

    const rocket = new Rocket({ position: Vector.Zero, onParticleDestroy: SpawnTheExplosion, childParticleSystemGO: smokeParticles });
    engine.AppendGameObject(rocket);

    engine.Start();
});