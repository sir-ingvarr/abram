class Ball extends GameObject {
	constructor(params) {
		super(params);
		this.size = params.size || 10;
		this.color = params.color || new RGBAColor(
			Maths.RandomRange(0, 255, true),
			Maths.RandomRange(0, 255, true),
			Maths.RandomRange(0, 255, true)
		);
	}

	Start() {
		this.graphic = new GraphicPrimitive({
			type: PrimitiveType.Circle,
			shape: new CircleArea(this.size / 2, Vector.Zero),
			parent: this.transform,
			drawMethod: ShapeDrawMethod.Fill,
			layer: 5,
			options: {
				fillStyle: this.color.ToHex()
			}
		});

		this.rigidBody = new RigidBody({
			useGravity: true, gravityScale: 0.03, drag: 0.5,
			mass: this.size / 30, bounciness: 0.3,
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

	Update() {
		const pos = this.transform.WorldPosition;
		if(pos.y > 500) this.Destroy();
		super.Update();
	}
}
