class Wall extends GameObject {
	constructor(params) {
		super(params);
		this.wallWidth = params.wallWidth || 10;
		this.wallHeight = params.wallHeight || 400;
	}

	Start() {
		const graphic = new GraphicPrimitive({
			type: PrimitiveType.Rect,
			shape: new Rect(new Point(), new Point(this.wallWidth, this.wallHeight)),
			parent: this.transform,
			drawMethod: ShapeDrawMethod.Fill,
			layer: 0,
			options: {
				fillStyle: new RGBAColor(60, 60, 60).ToHex()
			}
		});
		this.RegisterModule(graphic);

		this.rigidBody = new RigidBody({
			isStatic: true,
			material: new PhysicsMaterial({ friction: 0.8, bounciness: 0.2 }),
		});

		this.collider = new Collider2D({
			shape: new OBBShape(this.wallWidth, this.wallHeight),
			type: Collider2DType.Collider,
			parent: this.transform,
			rb: this.rigidBody,
		});

		this.RegisterModule(this.rigidBody);
		this.RegisterModule(this.collider);
	}
}
