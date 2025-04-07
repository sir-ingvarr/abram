
const { GameObject, GraphicPrimitives: { CirclePrimitive, RectPrimitive, GraphicPrimitive, PrimitiveType }, Collider2D, Collision: { Collider2DEvent, Collider2DType }, Shapes: {Circle, Rect, CircleArea}, ImageWrapper, InputSystem, Classes: {Vector, Maths, RGBAColor}, RigidBody } = window.Abram;
class Shape extends GameObject {
	collider;
	constructor(params) {
		super(params);
		this.horizontalDir = 0;
		this.prevHorDir = 1;
		this.verticalDir = 0;
		this.layer = params.layer;
		this.input = params.input || 0;
		this.initialPosition = params.position;
		this.graphic = null;
	}

	OnCollide(self, other) {
		this.module.options.color = new RGBAColor(255, 0, 0, 255).ToHex();
	}

	Start() {
		this.ground = new RigidBody({useGravity: false, drag: 4});

		const size = 150;

		this.graphic = new GraphicPrimitive({
			type: PrimitiveType.Circle,
			shape: new CircleArea(size / 2, this.initialPosition),
			parent: this.transform,

		});

		this.collider = new Collider2D({
			shape: new CircleArea(size / 2, this.initialPosition),
			type: Collider2DType.Collider,
			parent: this.transform,
		});

		this.collider.On(Collider2DEvent.OnCollision2DEnter, this.OnCollide.bind(this));


		this.rigidBody = new RigidBody({useGravity: true, gravityScale: 0.4, drag: 1});

		this.RegisterModule(this.rigidBody);
		this.RegisterModule(this.graphic);
		this.RegisterModule(this.collider);
	}

	CheckHorizontalInputs() {
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyA' : 'ArrowLeft')) return -1;
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyD' : 'ArrowRight')) return 1;
		return 0;
	}

	CheckVerticalInputs() {
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyW' : 'ArrowUp')) return -1;
		if(InputSystem.KeyPressed(this.input === 0 ? 'KeyS' : 'ArrowDown')) return 1;
		return 0;
	}

	Jump(shouldStand) {
		if(InputSystem.KeyPressed(this.input === 0 ? 'Space' : 'ControlLeft') && shouldStand) {
			this.rigidBody.AddForce(Vector.MultiplyCoordinates(100, Vector.Down).Add(new Vector(this.horizontalDir * 40, 0)));
		}
	}

	Update() {
		this.horizontalDir = this.CheckHorizontalInputs();
		this.verticalDir = this.CheckVerticalInputs();
		const pos = this.transform.WorldPosition;
		const shouldStand = pos.y >= 100;
		this.rigidBody.UseGravity = !shouldStand;
		if(shouldStand) {
			this.rigidBody.velocity.y = 0;
			this.transform.LocalPosition = new Vector(pos.x, 100);
		}
		this.Jump(shouldStand);

		this.prevHorDir = this.horizontalDir || this.prevHorDir;
		if(shouldStand) {
			this.rigidBody.AddForce(Vector.MultiplyCoordinates(1, new Vector(this.horizontalDir, 0)));
		}
		super.Update();
	}
}
