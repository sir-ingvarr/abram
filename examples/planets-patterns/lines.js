class Lines extends GameObject {

	constructor(params) {
		super(params);
		this.limit = params.limit || 100;
		this.current = 0;
		this.color = (params.color || new RGBAColor(255, 255, 255, 50)).ToHex();
		this.segments = [];
		this.planet1 = params.planet1;
		this.planet2 = params.planet2;
	}

	Start() {
		this.transform.anchors = { x: 0, y: 0 };
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 3,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(0, 100)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(255, 0, 0)}
		// }));
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 3,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(0, -100)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(0, 255, 0)}
		// }));
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 4,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(100, 0)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(0, 0, 255)}
		// }));
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 4,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(-100, 0)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(255, 0, 255)}
		// }));
		//
		// //
		//
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 4,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(100, 100)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(255, 0, 255)}
		// }));
		//
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 4,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(-100, 100)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(255, 0, 255)}
		// }));
		//
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 4,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(-100, -100)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(255, 0, 255)}
		// }));
		//
		// this.RegisterModule(new GraphicPrimitive({
		// 	layer: 4,
		// 	type: PrimitiveType.Line,
		// 	shape: new Segment(new Point(0,0), new Point(100, -100)),
		// 	parent: this.Transform,
		// 	drawMethod: ShapeDrawMethod.Stroke,
		// 	options: {strokeStyle: new RGBAColor(255, 0, 255)}
		// }));

	}

	AddLine(from, to) {
		if(this.segments.length < this.limit) {
			this.segments[this.current] = new GraphicPrimitive({
				layer: 2,
				type: PrimitiveType.Line,
				shape: new Segment(from, to),
				parent: this.Transform,
				drawMethod: ShapeDrawMethod.Stroke,
				options: {strokeStyle: this.color, contextRespectivePosition: false}
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
		this.AddLine(this.planet1.transform.WorldPosition, this.planet2.transform.WorldPosition);
	}
}
