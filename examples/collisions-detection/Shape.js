const { GameObject, GraphicPrimitives: { CirclePrimitive, RectPrimitive, GraphicPrimitive, PrimitiveType, ShapeDrawMethod }, Collider2D, Collision: { Collider2DEvent, Collider2DType }, Shapes: {Circle, Rect, CircleArea}, ImageWrapper, InputSystem, Classes: {Vector, Maths, RGBAColor, PolarCoordinates}, RigidBody, Time } = window.Abram;
class Shape extends GameObject {
	constructor(params) {
		super(params);
		this.bounciness = params.isStatic === -1 ? 2 : params.bounciness || 0;
		this.horizontalDir = 0;
		this.prevHorDir = 1;
		this.verticalDir = 0;
		this.layer = params.layer;
		this.input = params.input === undefined ? -1 : params.input;
		this.initialPosition = params.position;
		this.graphic = null;
		this.initialForce = params.initialForce || null;
		this.size = params.size || Maths.RandomRange(20, 150);
		this.isStatic = params.isStatic || false;
	}

	Start() {
		this.ground = new RigidBody({useGravity: false, drag: 4});


		this.graphic = new GraphicPrimitive({
			type: PrimitiveType.Circle,
			shape: new CircleArea(this.size / 2, Vector.Zero),
			parent: this.transform,
			drawMethod: ShapeDrawMethod.Fill,
			layer: 10,
			options: {
				fillStyle: new RGBAColor(255, 0, 0, 255).ToHex()
			}
		});

		this.rigidBody = new RigidBody({
			useGravity: true, gravityScale: 0.3, drag: 0.5, mass: this.size / 60, bounciness: this.bounciness, isStatic: this.isStatic,
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

		if(this.initialForce) {
			this.rigidBody.AddForce(this.initialForce);
		}

	}

	CheckHorizontalInputs() {
		if(this.input === -1) return 0;
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyA' : 'ArrowLeft')) return -1;
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyD' : 'ArrowRight')) return 1;
		return 0;
	}

	CheckVerticalInputs() {
		if(this.input === -1) return 0;
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyW' : 'ArrowUp')) return -1;
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyS' : 'ArrowDown')) return 1;
		return 0;
	}

	Jump(shouldStand) {
		if(InputSystem.KeyPressed(this.input === 0 ? 'Space' : 'ControlLeft') && shouldStand) {
			this.rigidBody.AddForce(Vector.MultiplyCoordinates(200, Vector.Down).Add(new Vector(this.horizontalDir * 40, 0)));
		}
	}

	Update() {
		this.horizontalDir = this.CheckHorizontalInputs();
		this.verticalDir = this.CheckVerticalInputs();
		const pos = this.transform.WorldPosition;
		if(pos.x < (-640)) {
			this.transform.LocalPosition = new Vector(-639, pos.y);
			if(this.input === -1) {
				this.rigidBody.velocity = new Vector(-this.rigidBody.velocity.x * this.rigidBody.bounciness, this.rigidBody.velocity.y);
			} else {
				pos.x = 639;
			}
		}
		if(pos.x > (640)) {
			if(this.input === -1) {
				this.transform.LocalPosition = new Vector(639, pos.y);
				this.rigidBody.velocity = new Vector(-this.rigidBody.velocity.x * this.rigidBody.bounciness, this.rigidBody.velocity.y);
			} else {
				pos.x = -639;
			}
		}
		const shouldStand = pos.y >= (100 - this.size / 2);
		if(shouldStand) {
			this.rigidBody.velocity = new Vector(this.rigidBody.velocity.x, -this.rigidBody.velocity.y * this.rigidBody.bounciness);
			this.transform.LocalPosition = new Vector(pos.x, 100 - this.size / 2);
		}
		this.Jump(shouldStand);

		this.prevHorDir = this.horizontalDir || this.prevHorDir;
		if(shouldStand) {
			this.rigidBody.AddForce(Vector.MultiplyCoordinates(1, new Vector(this.horizontalDir, 0)));
		}
		super.Update();
	}
}
