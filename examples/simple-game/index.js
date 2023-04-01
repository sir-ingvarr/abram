document.addEventListener('DOMContentLoaded', async function() {
    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const root = document.getElementById('root');
    const bgColor = new RGBAColor(150,0,0, 150);
    const engine = new Engine(root, { width: 1280, occlusionCulling: true, bgColor, height: 800, drawFps: true, debug: true, adaptiveFrameDelay: true, pauseOnBlur: false });

    await engine.RegisterGameScript('./man.js');
    await engine.RegisterGameScript('./man2.js');
    await engine.RegisterGameScript('./camera-movement.js');


    const camera = new CameraMovement({ position: Vector.Zero});
    engine.AppendGameObject(camera);

    const gameObject = new Man({
        position: new Vector(-5, 0), name: 'Man', layer: 1, scale: Vector.Left.Add(Vector.Up)
    }, camera);
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ManTwo({
        position: new Vector(5, 0), name: 'Man2', layer: 3, scale: Vector.One
    });
    engine.AppendGameObject(gameObject2);

    engine.Start();
});

