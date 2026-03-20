class Floor extends GameObject {
    constructor(params) {
        super(params);
        this.floorWidth = params.floorWidth || 2000;
        this.floorHeight = params.floorHeight || 20;
    }

    Start() {
        this.transform.Anchors = { x: 0, y: 0 };
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
    }
}
