class Turret extends GameObject {
    constructor(params) {
        super(params);
        this.instantiate = params.instantiate;
        this.onHit = params.onHit;
        this.shootCooldown = 0;
    }

    Start() {
        const graphic = new GraphicPrimitive({
            type: PrimitiveType.Rect,
            shape: new Rect(new Point(), new Point(20, 50)),
            parent: this.transform,
            drawMethod: ShapeDrawMethod.Fill,
            layer: 5,
            options: { fillStyle: new RGBAColor(40, 40, 40).ToHex() },
        });
        this.RegisterModule(graphic);
    }

    Update() {
        const cursor = CursorInputSystem.WorldPosition;
        this.transform.LookAt(cursor);

        this.shootCooldown -= Time.deltaTime;
        if (InputSystem.KeyPressed('Space') && this.shootCooldown <= 0) {
            this.shoot(cursor);
            this.shootCooldown = 200;
        }

        super.Update();
    }

    shoot(target) {
        const pos = this.transform.WorldPosition;
        const dir = new Vector(target.x - pos.x, target.y - pos.y);
        if (dir.Magnitude === 0) return;
        const velocity = dir.SetMagnitude(8);

        this.instantiate(Bullet, {
            position: new Vector(pos.x, pos.y),
            velocity,
            collisionLayer: 1,
            onHit: this.onHit,
        });
    }
}
