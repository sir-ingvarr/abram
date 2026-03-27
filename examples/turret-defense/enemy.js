class Enemy extends GameObject {
    constructor(params) {
        super(params);
        this.onReachGround = params.onReachGround;
        this.radius = params.radius || 15;
    }

    Start() {
        const graphic = new GraphicPrimitive({
            type: PrimitiveType.Circle,
            shape: new CircleArea(this.radius, Vector.Zero),
            parent: this.transform,
            drawMethod: ShapeDrawMethod.Fill,
            layer: 3,
            options: { fillStyle: new RGBAColor(200, 40, 40).ToHex() },
        });

        this.rigidBody = new RigidBody({
            useGravity: true, gravityScale: 0.3,
            mass: 1, drag: 0, bounciness: 0, freezeRotation: true,
            velocityLimit: new Vector(0, 1.5),
        });

        this.collider = new Collider2D({
            shape: new CircleArea(this.radius, Vector.Zero),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rigidBody,
        });

        this.collider.On(Collider2DEvent.OnCollision2DEnter, (_, self, other) => {
            if (other.parent?.gameObject?.collisionLayer === 3) {
                this.onReachGround();
                this.Destroy();
            }
        });

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(graphic);
        this.RegisterModule(this.collider);
    }
}
