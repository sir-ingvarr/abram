async function PlanetsScene(engine) {
    await engine.Instantiate(CameraMovement, {});

    const bgSprite = new Sprite({
        height: 800,
        width: 1280,
        image: new ImageWrapper('./assets/background.png'),
        layer: 0,
    });

    await engine.Instantiate(Bg, { sprite: bgSprite, position: new Point() })
    await engine.Instantiate(Planet, { name: 'sun', radius: 40, spritePath: './assets/sun.png', selfRotationSpeed: 1 });

    const planet1 = await engine.Instantiate(Planet, { radius: 15, rotateRadius: 110, speed: -0.001034, color: new RGBAColor(150, 20, 30), spritePath: './assets/planet1.png' });
    const planet2 = await engine.Instantiate(Planet, { radius: 18, rotateRadius: 210, speed: 0.000334, color: new RGBAColor(0, 100, 30), spritePath: './assets/planet2.png' });
    const planet3 = await engine.Instantiate(Planet, { radius: 10, rotateRadius: 280, speed: -0.000734, color: new RGBAColor(200, 100, 100), spritePath: './assets/planet3.png' });
    const satellitePlanet3 = await engine.Instantiate(Planet, { radius: 7, rotateRadius: 30, speed: 0.0038934, color: new RGBAColor(200, 250, 250), spritePath: './assets/sattelite.png' }, planet3.transform);
    const planet4 = await engine.Instantiate(Planet, { radius: 12, rotateRadius: 360, speed: 0.000534, color: new RGBAColor(200, 100, 100), spritePath: './assets/planet2.png' });
    const planet4Satellite = await engine.Instantiate(Planet, { radius: 9, rotateRadius: 45, speed: -0.004234, color: new RGBAColor(200, 100, 100), spritePath: './assets/planet1.png' }, planet4.transform);
    const planet5 = await engine.Instantiate(Planet, { radius: 5, rotateRadius: 35, speed: 0.005634, color: new RGBAColor(200, 100, 100), spritePath: './assets/sun.png' }, planet4Satellite.transform);
    const planet6 = await engine.Instantiate(Planet, { radius: 3, rotateRadius: 15, speed: -0.009634, color: new RGBAColor(200, 100, 100), spritePath: './assets/sun.png' }, planet5.transform);

    await engine.Instantiate(Lines, { planet1, planet2: planet2, limit: 8000, color: new RGBAColor(255, 180, 100, 15) });
    await engine.Instantiate(Lines, { planet1: planet2, planet2: planet3, limit: 8000, color: new RGBAColor(100, 200, 255, 15) });
    await engine.Instantiate(Lines, { planet1: planet1, planet2: planet4, limit: 8000, color: new RGBAColor(200, 130, 255, 15) });
}

document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const engine = new Engine(root, {
        width: 1280, height: 800,
        debug: false, drawFps: true,
        pauseOnBlur: true
    });

    await engine.RegisterGameScript('./camera-movement.js')
    await engine.RegisterGameScript('./planet.js');
    await engine.RegisterGameScript('./lines.js')
    await engine.RegisterGameScript('./bg.js');

    engine.RegisterScene('planets', PlanetsScene);
    engine.Start();
    await engine.LoadScene('planets');
    InputSystem.AddEventListener('Escape', () => engine.LoadScene('planets'));

    document.addEventListener('click', async (e) => {
        await engine.RequestFullScreen();
    })
});
