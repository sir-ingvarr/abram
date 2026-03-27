class Peg extends GameObject {
	constructor(params) {
		super(params);
		this.size = params.size || 10;
	}

	Start() {
		this.graphic = new GraphicPrimitive({
			type: PrimitiveType.Circle,
			shape: new CircleArea(this.size / 2, Vector.Zero),
			parent: this.transform,
			drawMethod: ShapeDrawMethod.Fill,
			layer: 1,
			options: {
				fillStyle: new RGBAColor(180, 180, 180).ToHex()
			}
		});

		this.rigidBody = new RigidBody({
			isStatic: true,
			material: new PhysicsMaterial({ friction: 0.7, bounciness: 0.4 }),
		});

		this.collider = new Collider2D({
			shape: new CircleArea(this.size / 2, Vector.Zero),
			type: Collider2DType.Collider,
			parent: this.transform,
			rb: this.rigidBody,
		});

		this.RegisterModule(this.rigidBody);
		this.RegisterModule(this.graphic);
		this.RegisterModule(this.collider);
	}
}
