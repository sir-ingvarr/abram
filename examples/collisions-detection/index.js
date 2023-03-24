document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector, Maths } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, debug: false, canvasContextAttributes: { alpha: false }, drawFps: true, adaptiveFrameDelay: false, pauseOnBlur: false });

    const bgColor = new RGBAColor(0,0,255, 140);
    engine.SetBackgroundColor(bgColor);
    const camera = new CameraMovement({}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);
    camera.cam.CenterTo(new Point(640, 400));

    engine.AppendGameObject(new Shape({ input: 1, position: new Vector(Maths.RandomRange(-200, 200), 0)}));
    engine.AppendGameObject(new Shape({ input: 0, position: new Vector(Maths.RandomRange(-200, 200), 0)}));

    engine.Start();
});

