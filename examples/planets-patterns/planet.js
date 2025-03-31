class Planet extends GameObject {

	constructor(params) {
		super(params);
		const angle = Maths.RandomRange(0, 2 * Math.PI);
		this.transform.LocalPosition = new PolarCoordinates({ r: params.rotateRadius, angle: angle }).ToCartesian();
		this.transform.LocalScale = Vector.One;
		this.radius = params.radius || 50;
		this.rotateRadius = params.rotateRadius || 0;
        this.angularSpeed = params.speed || 0;
		this.angle = angle;
		this.color = (params.color || new RGBAColor(255, 255, 255)).ToHex();
		this.sprite = new Sprite({
				height: this.radius * 2,
				width: this.radius * 2,
				image: new ImageWrapper(params.spritePath),
				layer: 3,
			});
		this.randomRotationFactor = Math.random() >= 0.5 ? 1 : -1;
		this.selfRotationSpeed = params.selfRotationSpeed || Maths.RandomRange(5, 40);
	}

	Start() {
		if (this.sprite) {
			this.RegisterModule(this.sprite);
		} else {
			this.RegisterModule(new GraphicPrimitive({
				layer: 3,
				type: PrimitiveType.Circle,
				shape: new Circle(this.radius, new Point(0, 0)),
				parent: this.transform,
				drawMethod: ShapeDrawMethod.Fill,
				options: {fillStyle: this.color}
			}));
		}

		this.RegisterModule(new TrailRenderer({
			parentTransform: this.transform,
			layer: 3,
			color: new RGBAColor(255, 0, 0, 170),
			width: 3,
			lifeTime: 12500,
		}));
	}

	Update() {
		super.Update();
		if(this.angularSpeed < 0) {
			this.angle += Maths.Clamp(this.angularSpeed * Time.deltaTime,-2*Math.PI, 0);
		} else {
			this.angle += Maths.Clamp(this.angularSpeed * Time.deltaTime, 0, 2 * Math.PI);
		}
		this.transform.LocalRotation += this.selfRotationSpeed * Time.deltaTime * this.randomRotationFactor / 10000;
		this.transform.LocalPosition = new PolarCoordinates({ r: this.rotateRadius, angle: this.angle })
			.ToCartesian();
		// if(this.transform.Parent) {
		// 	this.transform.LocalPosition = this.transform.LocalPosition
		// 		.Subtract(new Point(this.transform.Parent.gameObject.radius * this.transform.Parent.Anchors.x, this.transform.Parent.gameObject.radius * this.transform.Parent.Anchors.y));
		// }
	}
}
