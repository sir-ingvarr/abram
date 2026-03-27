class Ground extends GameObject {
    constructor(params) {
        super(params);
        this.groundWidth = params.groundWidth || 1280;
        this.groundHeight = params.groundHeight || 20;
    }

    Start() {
        const graphic = new GraphicPrimitive({
            type: PrimitiveType.Rect,
            shape: new Rect(new Point(), new Point(this.groundWidth, this.groundHeight)),
            parent: this.transform,
            drawMethod: ShapeDrawMethod.Fill,
            layer: 0,
            options: { fillStyle: new RGBAColor(60, 60, 60).ToHex() },
        });

        this.rigidBody = new RigidBody({ isStatic: true, bounciness: 0 });

        this.collider = new Collider2D({
            shape: new OBBShape(this.groundWidth, this.groundHeight),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rigidBody,
        });

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(graphic);
        this.RegisterModule(this.collider);
    }
}
