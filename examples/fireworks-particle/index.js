document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, debug: false, drawFps: true, adaptiveFrameDelay: false, pauseOnBlur: false });

    const bgColor = new RGBAColor(30,0,130);
    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);

    // const bgSprite = new Sprite({
    //     height: 800,
    //     width: 1280,
    //     image: new ImageWrapper('./assets/nightsky.png'),
    //     layer: 1,
    // });
    //
    // const bg = new Bg({sprite: bgSprite, position: new Point()});
    // engine.AppendGameObject(bg);

    const colors = [
        new RGBAColor(255),
        new RGBAColor(0, 255),
        new RGBAColor(252, 235, 3),
        new RGBAColor(140, 3, 252),
        new RGBAColor(250, 170, 20),
    ];

    function SpawnTheExplosion(pos) {
        engine.AppendGameObject(
            new Explosion({
                position: new Vector(pos.x, pos.y), lifetime: 5000,
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

