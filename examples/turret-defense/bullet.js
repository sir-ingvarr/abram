class Bullet extends GameObject {
    constructor(params) {
        super(params);
        this.velocity = params.velocity;
        this.onHit = params.onHit;
        this.age = 0;
    }

    Start() {
        const graphic = new GraphicPrimitive({
            type: PrimitiveType.Circle,
            shape: new CircleArea(4, Vector.Zero),
            parent: this.transform,
            drawMethod: ShapeDrawMethod.Fill,
            layer: 5,
            options: { fillStyle: new RGBAColor(255, 200, 0).ToHex() },
        });

        this.rigidBody = new RigidBody({
            useGravity: false, mass: 0.1, drag: 0,
            bounciness: 0, freezeRotation: true,
        });
        this.rigidBody.Velocity = this.velocity;

        this.collider = new Collider2D({
            shape: new CircleArea(4, Vector.Zero),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rigidBody,
        });

        this.collider.On(Collider2DEvent.OnCollision2DEnter, (_, self, other) => {
            if (other.parent?.gameObject?.collisionLayer === 2) {
                other.parent.gameObject.Destroy();
                if (this.onHit) this.onHit();
                this.Destroy();
            }
        });

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(graphic);
        this.RegisterModule(this.collider);
    }

    Update() {
        this.age += Time.deltaTime;
        if (this.age > 10000) this.Destroy();
        super.Update();
    }
}
