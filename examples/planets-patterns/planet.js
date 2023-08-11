class Planet extends GameObject {

	constructor(params) {
		super(params);
		this.transform.LocalPosition = new Point();
		this.radius = params.radius || 50;
		this.rotateRadius = params.rotateRadius || 0;
        this.angularSpeed = params.speed || 0;
		this.angle = 0;
		this.color = (params.color || new RGBAColor(255, 255, 255)).ToHex();
		this.sprite = params.sprite;
		this.randomRotationFactor = Math.random() >= 0.5 ? 1 : -1;
		this.selfRotationSpeed = params.selfRotationSpeed || Maths.RandomRange(5, 40);
	}

	Start() {
		if (this.sprite) {
			this.transform.localScale = new Vector(this.radius/100, this.radius/100);
			this.RegisterModule(this.sprite);
		} else {
			this.RegisterModule(new GraphicPrimitive({
				layer: 2,
				type: PrimitiveType.Circle,
				shape: new Circle(this.radius, new Point(0, 0)),
				parent: this.Transform,
				drawMethod: ShapeDrawMethod.Fill,
				options: {fillStyle: this.color}
			}));
		}
	}

	Update() {
		super.Update();
		this.angle += this.angularSpeed * Time.deltaTime;
		this.transform.LocalRotation += this.selfRotationSpeed * Time.deltaTime * this.randomRotationFactor / 10000;
		this.transform.LocalPosition = new PolarCoordinates({ r: this.rotateRadius, angle: this.angle }).ToCartesian();
	}
}
