const { Classes: {Point, Vector, PolarCoordinates, RGBAColor, Segment, Maths}, Camera, GameObject, Sprite, ImageWrapper, Time, GraphicPrimitives: { GraphicPrimitive, PrimitiveType, PrimitiveShape, ShapeDrawMethod }, Shapes: { Circle, SegmentList } } = window.Abram;


class CameraMovement extends GameObject {
	constructor(params) {
		super(params);
		this.pos = new Point(0, 0);
	}
	SetPosition(pos) {
		this.pos = pos;
	}

	Start() {
		super.Start();
		this.cam = Camera.GetInstance({});
	}
	Update() {
		super.Update();
		this.cam.CenterTo(this.pos);
	}

}