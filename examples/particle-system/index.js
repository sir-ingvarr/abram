document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(800, 600, root, true, 60, { adaptiveFrameDelay: false, pauseOnBlur: false });

    const bgColor = new RGBAColor(150,0,0, 150);
    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Context);
    engine.AppendGameObject(camera);

    const gameObject = new ParticleSystemTest(camera, { position: new Vector(0, -100)});
    engine.AppendGameObject(gameObject);

    engine.Start();
});

