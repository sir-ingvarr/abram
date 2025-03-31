document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, targetFps: 60, debug: false, drawFps: true, pauseOnBlur: false });

    await engine.RegisterGameScript('./camera-movement.js')
    await engine.RegisterGameScript('./explosion.js');
    await engine.RegisterGameScript('./smoke.js')
    await engine.RegisterGameScript('./rocket.js')
    await engine.RegisterGameScript('./bg.js');
    await engine.RegisterGameScript('./golden_sparks.js');

    engine.Start();

    await engine.Instantiate(CameraMovement, {})

    const bgSprite = new Sprite({
        height: 800,
        width: 1280,
        image: new ImageWrapper('./assets/fireworks_bg.jpg'),
        layer: 0,
    });

    await engine.Instantiate(Bg, {sprite: bgSprite, position: new Point()});

    const colors = [
        new RGBAColor(230),
        new RGBAColor(0, 200),
        new RGBAColor(220, 190, 5),
        new RGBAColor(110, 10, 230),
        new RGBAColor(230, 140, 20),
    ];

    function SpawnTheSparks(pos) {
        if(Math.random() < 0.05) {
            engine.Instantiate(GoldenSparks, {
                position: new Vector(pos.x, pos.y),
                lifetime: 3000,
            })
        }
    }


    function SpawnTheExplosion(pos) {
        const isColorful = Math.random() < 0.35;
        engine.Instantiate(Explosion, {
            position: new Vector(pos.x, pos.y),
            lifetime: 1200,
            color: isColorful
                ? () => colors[Maths.RandomRange(0, colors.length - 1, true)]
                : colors[Maths.RandomRange(0, colors.length - 1, true)],
            onParticleDestroy: pos => isColorful ? SpawnTheSparks(pos) : null,
        })
    }
    await engine.Instantiate(Rocket, { position: Vector.Zero, onParticleDestroy: SpawnTheExplosion, childParticleSystemGO: Smoke });
    await engine.RequestFullScreen();
});
