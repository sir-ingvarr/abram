class Floor extends GameObject {
    constructor(params) {
        super(params);
        this.floorWidth = params.floorWidth || 2000;
        this.floorHeight = params.floorHeight || 40;
    }

    Start() {
        const graphic = new GraphicPrimitive({
            type: PrimitiveType.Rect,
            shape: new Rect(new Point(), new Point(this.floorWidth, this.floorHeight)),
            parent: this.transform,
            drawMethod: ShapeDrawMethod.Fill,
            layer: 0,
            options: {
                fillStyle: new RGBAColor(80, 80, 80).ToHex(),
            },
        });
        this.RegisterModule(graphic);

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
