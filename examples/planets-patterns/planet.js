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

		this.colors = [
			RGBAColor.FromHex('#ff3b3b'),
			RGBAColor.FromHex('#ff933b'),
			RGBAColor.FromHex('#fffc3b'),
			RGBAColor.FromHex('#81f374'),
			RGBAColor.FromHex('#58ddfb'),
			RGBAColor.FromHex('#3b8fff'),
			RGBAColor.FromHex('#a56af4'),
		];
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

		if(this.name === 'sun') return;
		this.RegisterModule(new TrailRenderer({
			gameObject: this,
			layer: 3,
			initialColor: RGBAColor.FromHex('#ff3b3b'),
			widthOverTrail: (factor, initial) => {
				const realFactor = Maths.Clamp(factor, 0.3, 1);
				return initial * (1 - realFactor);
			},
			colorOverTrail: (factor) => {
				return this.colors[Math.round(Maths.Lerp(0, 6, factor))].Copy();
			},
			initialWidth: this.radius,
			lifeTime: 15000,
			newSegmentEachMS: 30,
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
	}
}
