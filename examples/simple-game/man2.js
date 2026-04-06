class Enemy extends GameObject {
    constructor(params) {
        super(params);
        this.name = params.name || 'Enemy';
        this.target = params.target;
        this.instantiate = params.instantiate;
        this.hp = 1;
        this.shootRange = Maths.RandomRange(50, 100);
        this.shootCooldown = 0;
        this.isGrounded = false;
        this.collisionLayer = 2;
    }

    Start() {
        const image = new ImageWrapper('./assets/dude_idle.png');
        const graphic = new Sprite({
            image: image,
            width: 30, height: 70, layer: 3,
        });

        this.animator = new Animator({
            frameDelay: 100,
            stateMap: {
                idle: ['./assets/dude_idle.png'],
                running: ['./assets/dude_run1.png', './assets/dude_idle.png', './assets/dude_run2.png', './assets/dude_idle.png'],
            },
            state: 'idle',
            graphicElement: graphic,
        });

        this.rigidBody = new RigidBody({
            useGravity: true, gravityScale: 1,
            velocityLimit: new Vector(2, 100),
            drag: 2, mass: 3, bounciness: 0,
            freezeRotation: true,
            interpolate: true,
        });

        this.collider = new Collider2D({
            shape: new OBBShape(24, 60),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rigidBody,
        });

        this.collider.On(Collider2DEvent.OnCollision2DEnter, (_, self, other) => {
            if (other.parent?.gameObject?.collisionLayer === 3) {
                this.hp--;
                if (this.hp <= 0) {
                    HUD.kills++;
                    this.Destroy();
                }
            }
        });

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(graphic);
        this.RegisterModule(this.animator);
        this.RegisterModule(this.collider);

        this.gun = new GameObject({ position: new Vector(15, 0), name: `${this.name}_gun` });
        const gunImage = new ImageWrapper('./assets/gun.png');
        const gunGraphic = new Sprite({
            image: gunImage,
            width: 30, height: 20, layer: 4,
        });
        this.gun.RegisterModule(gunGraphic);
        this.AppendChild(this.gun);
    }

    FixedUpdate() {
        const vy = this.rigidBody.Velocity.y;
        this.isGrounded = Math.abs(vy) < 0.5 && this.collider.IsColliding;

        if (this.isGrounded) {
            this.rigidBody.Velocity = new Vector(this.rigidBody.Velocity.x, 0);
            this.transform.LocalRotation = 0;

            if (this.target && !this.target.IsWaitingDestroy) {
                const targetPos = this.target.transform.WorldPosition;
                const myPos = this.transform.WorldPosition;
                const dx = targetPos.x - myPos.x;
                const dir = Math.sign(dx);

                if (Math.abs(dx) > this.shootRange) {
                    this.rigidBody.AddForce(new Vector(dir * 40, 0));
                }
            }
        }

        super.FixedUpdate();
    }

    Update() {
        if (this.transform.WorldPosition.y > 500) {
            this.Destroy();
            return;
        }

        if (this.target && !this.target.IsWaitingDestroy) {
            const targetPos = this.target.transform.WorldPosition;
            const myPos = this.transform.WorldPosition;
            const dx = targetPos.x - myPos.x;
            const dir = Math.sign(dx);

            this.transform.LocalScale = new Vector(dir, 1);

            if (Math.abs(dx) > this.shootRange) {
                this.animator.SetState('running');
            } else {
                this.animator.SetState('idle');
                this.Shoot(dir);
            }
        }

        super.Update();
    }

    Shoot(dir) {
        if (!this.instantiate) return;
        this.shootCooldown -= Time.deltaTime;
        if (this.shootCooldown > 0) return;

        this.shootCooldown = 800;
        const gunPos = this.gun.transform.WorldPosition;
        const spawnOffset = new Vector(dir * 25, 0);
        this.instantiate(EnemyBullet, {
            position: Vector.Add(gunPos, spawnOffset),
            velocity: new Vector(dir * 6, 0),
        });
    }
}

class EnemyBullet extends GameObject {
    constructor(params) {
        super(params);
        this.velocity = params.velocity || new Vector(6, 0);
        this.lifeTime = 2000;
        this.age = 0;
        this.collisionLayer = 4;
    }

    Start() {
        const graphic = new GraphicPrimitive({
            type: PrimitiveType.Circle,
            shape: new CircleArea(3, Vector.Zero),
            parent: this.transform,
            drawMethod: ShapeDrawMethod.Fill,
            layer: 10,
            options: {
                fillStyle: new RGBAColor(255, 50, 50).ToHex()
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
        if (this.age > this.lifeTime) this.Destroy();
        super.Update();
    }
}
