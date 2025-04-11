class Lines extends GameObject {
	constructor(params) {
		super(params);
		this.counter = 0;
		this.limit = params.limit || 100;
		this.current = 4;
		this.color = (params.color || new RGBAColor(255, 255, 255, 35)).ToHex();
		this.segmentsList = new SegmentList([]);
		this.planet1 = params.planet1;
		this.planet2 = params.planet2;
	}

	Start() {
		// this.transform.Anchors = { x: 0, y: 0 };
		this.RegisterModule(new GraphicPrimitive({
			layer: 2,
			type: PrimitiveType.Lines,
			shape: this.segmentsList,
			parent: this.Transform,
			drawMethod: ShapeDrawMethod.Stroke,
			options: {strokeStyle: this.color, contextRespectivePosition: false}
		}));
	}

	AddLine(from, to) {
		if(this.segmentsList.SegmentsUnsafe.length < this.limit) {
			this.segmentsList.AddSegment(new Segment(from, to));
		} else {
			const shape = this.segmentsList.SegmentsUnsafe[this.current];
			shape.from = from;
			shape.to = to;
		}
		this.current = (this.current + 1) % this.limit;
	}

	Update() {
		super.Update();
		this.counter++;
		if(this.counter < 5) {
			return;
		}
		this.counter = 0;
		this.AddLine(
			this.planet1.transform.WorldPosition,
			this.planet2.transform.WorldPosition
		);
	}
}
