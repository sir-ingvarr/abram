class Lines extends GameObject {

	constructor(params) {
		super(params);
		this.limit = params.limit || 100;
		this.current = 0;
		this.color = (params.color || new RGBAColor(255, 255, 255, 150)).ToHex();
		this.segments = [];
		this.planet1 = params.planet1;
		this.planet2 = params.planet2;
	}

	AddLine(from, to) {
		if(this.segments.length < this.limit) {
			this.segments[this.current] = new GraphicPrimitive({
				layer: 2,
				type: PrimitiveType.Line,
				shape: new Segment(new Point(0,0), to),
				parent: this.Transform,
				drawMethod: ShapeDrawMethod.Stroke,
				options: {strokeStyle: this.color}
			});
			this.RegisterModule(this.segments[this.current]);
		} else {
			const shape = this.segments[this.current].shape;
			shape.from = from;
			shape.to = to;
		}
		this.current = (this.current + 1) % this.limit;
	}

	Update() {
		super.Update();
		this.AddLine(this.planet1.transform.LocalPosition, this.planet2.transform.LocalPosition);
	}
}
