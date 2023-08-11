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

	const bg = new Bg({sprite: bgSprite, position: new Point()});
	engine.AppendGameObject(bg);

	const sun = new Planet({ radius: 40, color: new RGBAColor(200, 200, 0), sprite: sunSprite, selfRotationSpeed: 3 });
	engine.AppendGameObject(sun);

	const planet1 = new Planet({ radius: 25, rotateRadius: 110, speed: 0.000634, color: new RGBAColor(150, 20, 30), sprite: planet1Sprite });
	engine.AppendGameObject(planet1);

	const planet2 = new Planet({ radius: 30, rotateRadius: 210, speed: 0.000834, color: new RGBAColor(0, 100, 30), sprite: planet2Sprite });
	engine.AppendGameObject(planet2);

	const planet3 = new Planet({ radius: 20, rotateRadius: 320, speed: 0.000934, color: new RGBAColor(200, 100, 100), sprite: planet3Sprite });
	engine.AppendGameObject(planet3);

	const satellitePlanet3 = new Planet({ radius: 60, rotateRadius: 50, speed: 0.0018934, color: new RGBAColor(200, 250, 250), sprite: satelliteSprite });
	planet3.AppendChild(satellitePlanet3);

	const lines = new Lines({ planet1, planet2, limit: 10000 });
	engine.AppendGameObject(lines);

	const lines2 = new Lines({ planet1: planet2, planet2: planet3, limit: 10000 });
	engine.AppendGameObject(lines2);

	const lines3 = new Lines({ planet1: planet3, planet2: satellitePlanet3, limit: 10000 });
	engine.AppendGameObject(lines3);


	engine.Start();
});

