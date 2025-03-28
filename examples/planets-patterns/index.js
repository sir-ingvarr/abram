document.addEventListener('DOMContentLoaded', async function() {
	const root = document.getElementById('root');

	const { Engine, Classes: { RGBAColor, Point } } = Abram;

	const engine = new Engine(root, {
		width: 1280, height: 800, targetFps: 60,
		debug: false, drawFps: true,
		pauseOnBlur: false
	});

	await engine.RegisterGameScript('./camera-movement.js')
	await engine.RegisterGameScript('./planet.js');
	await engine.RegisterGameScript('./lines.js')
	await engine.RegisterGameScript('./bg.js');
	engine.Start();

	await engine.Instantiate(CameraMovement, {});

	const bgSprite = new Sprite({
		height: 800,
		width: 1280,
		image: new ImageWrapper('./assets/background.png'),
		layer: 0,
	});

	const sunSprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/sun.png'),
		layer: 2,
	});

	const planet1Sprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/planet1.png'),
		layer: 2,
	});
	const planet2Sprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/planet2.png'),
		layer: 2,
	});
	const planet3Sprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/planet3.png'),
		layer: 2,
	});
	const satelliteSprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/sattelite.png'),
		layer: 2,
	});

	const planet4Sprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/planet3.png'),
		layer: 2,
	});

	const planet5Sprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/planet2.png'),
		layer: 2,
	});

	const planet6Sprite = new Sprite({
		height: 150,
		width: 150,
		image: new ImageWrapper('./assets/sattelite.png'),
		layer: 2,
	});
	await engine.Instantiate(Bg, { sprite: bgSprite, position: new Point() })
	await engine.Instantiate(Planet, { radius: 40, color: new RGBAColor(200, 200, 0), sprite: sunSprite, selfRotationSpeed: 3 });

	const planet1 = await engine.Instantiate(Planet, { radius: 15, rotateRadius: 110, speed: 0.003034, color: new RGBAColor(150, 20, 30), sprite: planet1Sprite });
	const planet2 = await engine.Instantiate(Planet, { radius: 30, rotateRadius: 210, speed: 0.001034, color: new RGBAColor(0, 100, 30), sprite: planet2Sprite });
	const planet3 = await engine.Instantiate(Planet, { radius: 20, rotateRadius: 250, speed: 0.000434, color: new RGBAColor(200, 100, 100), sprite: planet3Sprite });
	const satellitePlanet3 = await engine.Instantiate(Planet, { radius: 60, rotateRadius: 50, speed: 0.0018934, color: new RGBAColor(200, 250, 250), sprite: satelliteSprite }, planet3.transform);
	const planet4 = await engine.Instantiate(Planet, { radius: 35, rotateRadius: 320, speed: 0.000534, color: new RGBAColor(200, 100, 100), sprite: planet5Sprite });
	const planet4Satellite = await engine.Instantiate(Planet, { radius: 25, rotateRadius: 60, speed: 0.000234, color: new RGBAColor(200, 100, 100), sprite: planet6Sprite }, planet4.transform);
	const planet5 = await engine.Instantiate(Planet, { radius: 35, rotateRadius: 25, speed: -0.000634, color: new RGBAColor(200, 100, 100), sprite: planet4Sprite }, planet4Satellite.transform);

	await engine.Instantiate(Lines, { planet1, planet2, limit: 40000 });
	await engine.Instantiate(Lines, { planet1: planet2, planet2: planet3, limit: 40000 });
	await engine.Instantiate(Lines, { planet1: planet3, planet2: satellitePlanet3, limit: 40000 });
	await engine.Instantiate(Lines, { planet1: planet1, planet2: planet3, limit: 40000 });
	await engine.Instantiate(Lines, { planet1: planet2, planet2: satellitePlanet3, limit: 40000 });


});

