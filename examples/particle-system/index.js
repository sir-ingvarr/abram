document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, debug: false, drawFps: true, adaptiveFrameDelay: false, pauseOnBlur: false });

    const bgColor = new RGBAColor(0,0,255, 220);
    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);

    const gameObject = new ParticleSystemTest(camera, { position: new Vector(0, -190)});
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ParticleSystemTest2(camera, { position: new Vector(-300, -0)});
    engine.AppendGameObject(gameObject2);

    const counter = new ParticleCounter({}, [gameObject, gameObject2]);
    engine.AppendGameObject(counter);


    engine.Start();
});

