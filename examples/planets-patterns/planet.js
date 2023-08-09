class Planet extends GameObject {

	constructor(params) {
		super(params);
		this.transform.LocalPosition = new Point();
		this.radius = params.radius || 50;
		this.rotateRadius = params.rotateRadius || 0;
        this.angularSpeed = params.speed || 0;
		this.angle = 0;
		this.color = (params.color || new RGBAColor(255, 255, 255)).ToHex();
	}

	Start() {
		this.RegisterModule(new GraphicPrimitive({
			layer: 2,
			type: PrimitiveType.Circle,
			shape: new Circle(this.radius, new Point(0, 0)),
			parent: this.Transform,
			drawMethod: ShapeDrawMethod.Fill,
			options: { fillStyle: this.color }
		}));
	}

	Update() {
		super.Update();
		this.angle += this.angularSpeed * Time.deltaTime;
		this.transform.localPosition = new PolarCoordinates({ r: this.rotateRadius, angle: this.angle }).ToCartesian();
	}
}
