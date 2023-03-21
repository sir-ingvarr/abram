document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root,{ targetFps: 60, width: 1280, height: 800, adaptiveFrameDelay: false, pauseOnBlur: false });

    const bgColor = new RGBAColor(0,0,255, 140);
    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);

    const gameObject = new ParticleSystemTest(camera, { position: new Vector(0, 0)});
    engine.AppendGameObject(gameObject);

    engine.Start();
});

