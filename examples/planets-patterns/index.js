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

    const planet1 = new Planet({ radius: 25, rotateRadius: 110, speed: 0.001934, color: new RGBAColor(150, 20, 30) });
    engine.AppendGameObject(planet1);

    const planet2 = new Planet({ radius: 30, rotateRadius: 210, speed: 0.000234, color: new RGBAColor(0, 100, 30) });
    engine.AppendGameObject(planet2);

    const planet3 = new Planet({ radius: 15, rotateRadius: 320, speed: 0.000634, color: new RGBAColor(200, 100, 100) });
    engine.AppendGameObject(planet3);

    const planet4 = new Planet({ radius: 10, rotateRadius: 50, speed: 0.0021934, color: new RGBAColor(200, 250, 250) });
    planet3.AppendChild(planet4);

    const lines = new Lines({ planet1, planet2, limit: 7000 });
    engine.AppendGameObject(lines);

    const lines2 = new Lines({ planet1: planet2, planet2: planet3, limit: 7000 });
    engine.AppendGameObject(lines2);

    const lines3 = new Lines({ planet1: planet3, planet2: planet4, limit: 5000 });
    engine.AppendGameObject(lines3);


    engine.Start();
});

