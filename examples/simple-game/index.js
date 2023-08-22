document.addEventListener('DOMContentLoaded', async function() {
    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const root = document.getElementById('root');
    const bgColor = new RGBAColor(150,0,0, 150);
    const engine = new Engine(root, { width: 1280, height: 800, bgColor, drawFps: true, debug: true, adaptiveFrameDelay: false });

    await engine.RegisterGameScript('./man.js')
    await engine.RegisterGameScript('./man2.js');
    await engine.RegisterGameScript('./camera-movement.js')


    const camera = new CameraMovement({});
    engine.AppendGameObject(camera);

    const gameObject = new Man({
        position: new Vector(10, 20), name: 'Man', layer: 1
    }, camera);
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ManTwo({
        position: new Vector(30, 30), name: 'Man2', layer: 3
    });
    engine.AppendGameObject(gameObject2);

    engine.Start();
});

