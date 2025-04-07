document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { Vector, Maths } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, debug: false, canvasContextAttributes: { alpha: false }, drawFps: true, adaptiveFrameDelay: false, pauseOnBlur: false });
    await engine.RegisterGameScript('./Shape.js');
    await engine.RegisterGameScript('./camera-movement.js');

    engine.Start();

    await engine.Instantiate(CameraMovement, {});

    await engine.Instantiate(Shape,{ input: 1, position: new Vector(Maths.RandomRange(-200, 200), 0)});
    await engine.Instantiate(Shape, { input: 0, position: new Vector(Maths.RandomRange(-200, 200), 0)});

});

