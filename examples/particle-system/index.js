document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, { width: 1280, occlusionCulling: true, height: 800, drawFps: true, debug: false, adaptiveFrameDelay: true, pauseOnBlur: false });

    const bgColor = RGBAColor.FromHex('3396FF');

    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);

    const gameObject = new ParticleSystemTest(camera, { position: new Vector(0, -400)});
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ParticleSystemTest2(camera, { position: new Vector(-640, -0)});
    engine.AppendGameObject(gameObject2);

    const counter = new ParticleCounter({}, [gameObject, gameObject2]);
    engine.AppendGameObject(counter);


    engine.Start();
});

