document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, {
        width: 1280, occlusionCulling: true, height: 800, targetFps: 60,
        drawFps: true, debug: false, adaptiveFrameDelay: true,
        pauseOnBlur: false, bgColor: new RGBAColor(50, 50, 50)
    });

    await engine.RegisterGameScript('./particle-system.js')
    await engine.RegisterGameScript('./particle-system-2.js');
    await engine.RegisterGameScript('./camera-movement.js')
    await engine.RegisterGameScript('./particle-counter.js');

    const camera = new CameraMovement({});
    engine.AppendGameObject(camera);

    const gameObject = new ParticleSystemTest(camera, { position: new Vector(0, -400)});
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ParticleSystemTest2(camera, { position: new Vector(-640, -0)});
    engine.AppendGameObject(gameObject2);

    const counter = new ParticleCounter({context: engine.Canvas.Context2D}, [gameObject, gameObject2]);
    engine.AppendGameObject(counter);


    engine.Start();
});

