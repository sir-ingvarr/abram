document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector, Point } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, targetFps: 60, debug: false, drawFps: true, adaptiveFrameDelay: false, pauseOnBlur: false });

    const bgColor = new RGBAColor(30,0,130);
    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);

    const bgSprite = new Sprite({
        height: 800,
        width: 1280,
        image: new ImageWrapper('./assets/nightsky.png'),
        layer: 0,
    });

    const bg = new Bg({sprite: bgSprite, position: new Point()});
    engine.AppendGameObject(bg);

    const sun = new Planet({ radius: 40, color: new RGBAColor(200, 200, 0) });
    engine.AppendGameObject(sun);

    const planet1 = new Planet({ radius: 25, rotateRadius: 150, speed: 0.002, color: new RGBAColor(150, 20, 30) });
    engine.AppendGameObject(planet1);

    const planet2 = new Planet({ radius: 30, rotateRadius: 350, speed: 0.0004, color: new RGBAColor(0, 100, 30) });
    engine.AppendGameObject(planet2);

    const lines = new Lines({ planet1, planet2, limit: 10000 });
    engine.AppendGameObject(lines);


    engine.Start();
});

