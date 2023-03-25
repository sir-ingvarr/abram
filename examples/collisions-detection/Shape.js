
const { GameObject, GraphicPrimitives: { CirclePrimitive, RectPrimitive, GraphicPrimitive, PrimitiveType }, Collider2D, Collision: { Collider2DEvent, Collider2DType }, Shapes: {Circle, Rect, CircleArea}, ImageWrapper, InputSystem, Classes: {Vector, Maths}, RigidBody } = window.Abram;
class Shape extends GameObject {
	collider;
	constructor(params) {
		super(params);
		this.horizontalDir = 0;
		this.prevHorDir = 1;
		this.verticalDir = 0;
		this.layer = params.layer;
		this.input = params.input || 0;
	}

	OnCollide(self, other) {
		const module = self.parent.gameObject.GetModuleByName(GraphicPrimitive.constructor.name);
		console.log('collision');
	}

	Start() {
		this.ground = new RigidBody({useGravity: false, drag: 4});

		const size = 150;

		const random = Math.random() < 0.5;
		const graphic = new GraphicPrimitive({
			type: random > 0.5 ? PrimitiveType.Circle : PrimitiveType.Rect,
			shape: random > 0.5
				? new CircleArea(size / 2, new Point())
				: new Rect(new Point(), new Point(size, size)),
			parent: this.Transform,
		});

		graphic.parent = this.transform;

		this.collider = new Collider2D({
			shape: new CircleArea(size / 2 * Math.max(this.transform.Scale.x, this.transform.Scale.y), new Point()),
			type: Collider2DType.Collider,
			parent: this.transform,
		});

		this.collider.On(Collider2DEvent.OnCollision2DEnter, this.OnCollide.bind(this));


		this.rigidBody = new RigidBody({useGravity: true, gravityScale: 0.4, drag: 0.4});

		this.RegisterModule(this.rigidBody);
		// this.RegisterModule(graphic);
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
			this.rigidBody.AddForce(Vector.MultiplyCoordinates(3, new Vector(this.horizontalDir, 0)));
		}
		super.Update();
	}
}
