
class Spawner extends GameObject {
	constructor(params) {
		super(params);
		this.maxElements = params.maxElements || 30;
		this.count = 0;
		this.timeSinceLastSpawn = 0;
		const {spawnEvery, spawnRadius} = params;
		this.spawnEvery = spawnEvery;
		this.spawnRadius = spawnRadius;
		this.instantiate = params.instantiate;
	}

	Start() {
		super.Start();
		const graffic = new GraphicPrimitive({
			layer: 10,
			type: PrimitiveType.Circle,
			shape: new CircleArea(10, Vector.Zero),
			parent: this.transform,
			drawMethod: ShapeDrawMethod.Stroke,
			options: {strokeStyle: new RGBAColor(0, 220, 20).ToHex()}
		})

		this.RegisterModule(graffic);
	}

	Update() {
		super.Update();
		this.timeSinceLastSpawn += Time.deltaTime;

		if(this.timeSinceLastSpawn < this.spawnEvery) return;
		if(this.count >= this.maxElements) {
			return;
		}
		this.count++;
		this.instantiate(Shape, {
			bounciness: 1,
			input: -1,
			position: Vector.Add(this.transform.localPosition ,new PolarCoordinates({
					r: Maths.RandomRange(0, this.spawnRadius),
					angle: Maths.RandomRange(0, 2 * Math.PI)
			}).ToCartesian()),
			mass: 2,
			size: Maths.RandomRange(50, 130),
			initialForce: new PolarCoordinates({
				r: Maths.RandomRange(50, 100),
				angle: Maths.RandomRange(0, 2 * Math.PI)
			}).ToCartesian()
		});
		this.timeSinceLastSpawn = 0;
	}
}