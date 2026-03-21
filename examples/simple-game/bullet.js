class Bullet extends GameObject {
    constructor(params) {
        super(params);
        this.velocity = params.velocity || new Vector(30, 0);
        this.lifeTime = params.lifeTime || 2000;
        this.age = 0;
    }

    Start() {
        const graphic = new GraphicPrimitive({
            type: PrimitiveType.Circle,
            shape: new CircleArea(3, Vector.Zero),
            parent: this.transform,
            drawMethod: ShapeDrawMethod.Fill,
            layer: 10,
            options: {
                fillStyle: new RGBAColor(10, 10, 10).ToHex()
            }
        });

        this.rigidBody = new RigidBody({
            useGravity: true, mass: 0.1, drag: 0,
            gravityScale: 0.0005,
            bounciness: 0, freezeRotation: true,
        });
        this.rigidBody.Velocity = this.velocity;

        this.collider = new Collider2D({
            shape: new CircleArea(3, Vector.Zero),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rigidBody,
        });

        this.collider.On(Collider2DEvent.OnCollision2DEnter, () => {
            this.Destroy();
        });

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(graphic);
        this.RegisterModule(this.collider);
    }

    Update() {
        this.age += Time.deltaTime;
        if(this.age > this.lifeTime) this.Destroy();
        super.Update();
    }
}
