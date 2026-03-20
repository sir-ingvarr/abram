document.addEventListener('DOMContentLoaded', async function() {
	const root = document.getElementById('root');

	const engine = new Engine(root, {
		width: 1280, height: 800,
		debug: false, drawFps: true,
		pauseOnBlur: false,
		bgColor: new RGBAColor(25, 25, 30),
	});

	await engine.RegisterGameScript('./camera-movement.js');
	await engine.RegisterGameScript('./peg.js');
	await engine.RegisterGameScript('./ball.js');
	await engine.RegisterGameScript('./wall.js');
	await engine.RegisterGameScript('./board.js');
	await engine.RegisterGameScript('./dropper.js');

	engine.Start();

	await engine.Instantiate(CameraMovement, {});

	await engine.Instantiate(GaltonBoard, {
		rows: 7,
		columns: 9,
		pegSpacing: 70,
		pegSize: 30,
		instantiate: engine.Instantiate.bind(engine),
	});

	await engine.Instantiate(Dropper, {
		position: new Vector(-35, -370),
		dropEvery: 1000,
		maxBalls: 150,
		ballSize: 22,
		spread: 10,
		instantiate: engine.Instantiate.bind(engine),
	});
});
