class Ball extends GameObject {
	constructor(params) {
		super(params);
		this.age = 0;
		this.lifeTime = params.lifeTime || 120000;
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
			useGravity: true, gravityScale: 1, drag: 0.1, angularDrag: 0.5,
			material: new PhysicsMaterial({ friction: 0.1, bounciness: 0.3, density: 1 }),
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
		this.age += Time.deltaTime;
		if(this.age > this.lifeTime) return this.Destroy();
		const pos = this.transform.WorldPosition;
		if(pos.y > 500) this.Destroy();

		const velocity = this.rigidBody.Velocity;
		const speed = velocity.Magnitude;
		if(speed > 0.1) {
			const rayColor = speed > 3
				? new RGBAColor(255, 50, 50)
				: new RGBAColor(255, 200, 50);
			Debug.DrawRay(pos, velocity, speed * 10, rayColor);
		}

		super.Update();
	}
}
