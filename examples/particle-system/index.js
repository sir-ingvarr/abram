document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const bgColor = RGBAColor.FromHex('3396FF');

    const engine = new Engine(root, { width: 1280, occlusionCulling: true, bgColor, height: 800, drawFps: true, debug: false, adaptiveFrameDelay: true, pauseOnBlur: false });

    await engine.RegisterGameScript('./particle-system.js');
    await engine.RegisterGameScript('./particle-system-2.js');
    await engine.RegisterGameScript('./camera-movement.js');
    // await engine.RegisterGameScript('./particle-counter.js');


    const camera = new CameraMovement({ position: Vector.Zero});
    engine.AppendGameObject(camera);

    const gameObject = new ParticleSystemTest(camera, { position: new Vector(0, -400)});
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ParticleSystemTest2(camera, { position: new Vector(-640, -0)});
    engine.AppendGameObject(gameObject2);

    // const counter = new ParticleCounter({}, [gameObject, gameObject2]);
    // engine.AppendGameObject(counter);


    engine.Start();
});

