document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, debug: false, drawFps: true, adaptiveFrameDelay: false, pauseOnBlur: false });

    const bgColor = new RGBAColor(0,0,150, 220);
    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);

    function SpawnTheExplosion(pos) {
        // engine.Instantiate(Explosion.constructor,{ position: new Vector(pos.x, pos.y), lifetime: 5000 });
        engine.AppendGameObject(new Explosion({ position: new Vector(pos.x, pos.y), lifetime: 5000 }));
    }

    const smokeParticles = Smoke;

    const rocket = new Rocket({ position: Vector.Zero, onParticleDestroy: SpawnTheExplosion, childParticleSystemGO: smokeParticles });
    engine.AppendGameObject(rocket);

    engine.Start();
});

