class FloorSegment extends GameObject {
    constructor(params) {
        super(params);
        this.floorWidth = params.floorWidth;
        this.floorHeight = params.floorHeight;
    }

    Start() {
        this.floorGraphic = new GraphicPrimitive({
            type: PrimitiveType.Rect,
            shape: new Rect(new Point(), new Point(this.floorWidth, this.floorHeight)),
            drawMethod: ShapeDrawMethod.Fill,
            layer: 1,
            options: {
                fillStyle: new RGBAColor(30, 30, 30).ToHex(),
            },
        });
        this.RegisterModule(this.floorGraphic);

        this.rigidBody = new RigidBody({ isStatic: true, bounciness: 0 });

        this.collider = new Collider2D({
            shape: new OBBShape(this.floorWidth, this.floorHeight),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rigidBody,
        });

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(this.collider);
    }
}

class InfiniteFloor extends GameObject {
    constructor(params) {
        super(params);
        this.segmentWidth = params.floorWidth || 1280;
        this.stride = this.segmentWidth - 1;
        this.floorHeight = params.floorHeight || 40;
        this.segments = [];
    }

    Start() {
        for (let i = -1; i <= 1; i++) {
            const seg = new FloorSegment({
                position: new Vector(i * this.stride, 0),
                name: `floor_${i}`,
                floorWidth: this.segmentWidth,
                floorHeight: this.floorHeight,
            });
            this.AppendChild(seg);
            this.segments.push(seg);
        }
    }

    Update() {
        const cam = Camera.GetInstance({});
        const camCenterX = cam.Position.x + 640;

        for (const seg of this.segments) {
            const segX = seg.transform.WorldPosition.x;

            if (segX < camCenterX - this.stride * 1.5) {
                seg.transform.LocalPosition = new Vector(
                    seg.transform.LocalPosition.x + this.stride * 3,
                    seg.transform.LocalPosition.y
                );
            } else if (segX > camCenterX + this.stride * 1.5) {
                seg.transform.LocalPosition = new Vector(
                    seg.transform.LocalPosition.x - this.stride * 3,
                    seg.transform.LocalPosition.y
                );
            }
        }

        super.Update();
    }
}
