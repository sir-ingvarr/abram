class Man extends GameObject {
    constructor(params, cam) {
        super(params);
        this.name = 'Man1';
        this.horizontalDir = 0;
        this.prevHorDir = 1;
        this.verticalDir = 0;
        this.cam = cam;
        this.layer = params.layer;
        this.isGrounded = false;
        this.instantiate = params.instantiate;
        this.shootCooldown = 0;
        this.hp = 3;
        this.collisionLayer = 1;
    }

    Start() {
        const image = new ImageWrapper('./assets/dude_idle.png');
        new ImageWrapper('./assets/dude_run1.png')
        new ImageWrapper('./assets/dude_run2.png')

        const graphic = new Sprite({
            image: image,
            width: 30, height: 70, layer: this.layer,
        });

        this.size = 1;
        this.animator = new Animator({
            frameDelay: 100,
            stateMap: {
                idle: ['./assets/dude_idle.png'],
                running: ['./assets/dude_run1.png', './assets/dude_idle.png', './assets/dude_run2.png', './assets/dude_idle.png'],
                jump: ['./assets/dude_run1.png'],
            },
            state: 'idle',
            graphicElement: graphic,
        });

        this.rigidBody = new RigidBody({
            useGravity: true, gravityScale: 1, angularDrag: 0.03,
            velocityLimit: new Vector(5, 100),
            drag: 2, mass: 3, bounciness: 0,
            centerOfMass: new Vector(0, 10),
            interpolate: true
        });

        this.collider = new Collider2D({
            shape: new OBBShape(24, 60),
            type: Collider2DType.Collider,
            parent: this.transform,
            rb: this.rigidBody,
        });

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(graphic);
        this.RegisterModule(this.animator);
        this.RegisterModule(this.collider);

        this.collider.On(Collider2DEvent.OnCollision2DEnter, (_, self, other) => {
            if (other.parent?.gameObject?.collisionLayer === 4) {
                this.hp--;
                if (this.hp <= 0) this.Destroy();
            }
        });

        this.gun = new GameObject({ position: new Vector(15, 0), name: `${this.name}_gun` });

        const gunImage = new ImageWrapper('./assets/gun.png');
        const gunGraphic = new Sprite({
            image: gunImage,
            width: 30, height: 20, layer: this.layer + 1,
        });

        this.gun.RegisterModule(gunGraphic);
        this.AppendChild(this.gun);
        if(!this.cam) return;
        this.cam.TrackTarget(this.transform);
    }

    CheckHorizontalInputs() {
        if(InputSystem.KeyPressed('KeyA')) return -1;
        if(InputSystem.KeyPressed('KeyD')) return 1;
        return 0;
    }

    CheckVerticalInputs() {
        if(InputSystem.KeyPressed('KeyW')) return -1;
        if(InputSystem.KeyPressed('KeyS')) return 1;
        return 0;
    }

    Shoot() {
        if(!this.instantiate) return;
        this.shootCooldown -= Time.deltaTime;
        if(InputSystem.KeyPressed('ControlLeft') && this.shootCooldown <= 0) {
            this.shootCooldown = 300;
            const fireDirection = this.transform.Right;
            const gunPos = this.gun.transform.WorldPosition;
            const spawnOffset = Vector.MultiplyCoordinates(40, fireDirection);
            this.instantiate(Bullet, {
                position: Vector.Add(gunPos, spawnOffset),
                velocity: Vector.Add(Vector.MultiplyCoordinates(8, fireDirection), this.rigidBody.Velocity),
            });
        }
    }

    Jump() {
        if(InputSystem.KeyPressed('Space') && this.isGrounded) {
            this.isGrounded = false;
            this.rigidBody.FreezeRotation = false;
            this.rigidBody.AddForce(Vector.MultiplyCoordinates(1000, Vector.Up).Add(new Vector(this.horizontalDir * 100, 0)));
            this.rigidBody.AddTorque(1300);
        }
    }

    FixedUpdate() {
        const vy = this.rigidBody.Velocity.y;
        const touching = this.collider.IsColliding;
        this.isGrounded = Math.abs(vy) < 0.5 && touching;

        if(this.isGrounded) {
            this.rigidBody.Velocity = new Vector(this.rigidBody.Velocity.x, 0);
            this.rigidBody.Torque = 0;
            this.rigidBody.AngularVelocity = 0;
            this.transform.LocalRotation = 0;
            this.rigidBody.FreezeRotation = true;
            this.Jump();
            this.rigidBody.AddForce(Vector.MultiplyCoordinates(50, new Vector(this.horizontalDir, 0)));
        }

        super.FixedUpdate();
    }

    Update() {
        this.horizontalDir = this.CheckHorizontalInputs();
        this.verticalDir = this.CheckVerticalInputs();

        if(this.isGrounded) {
            if (!!this.horizontalDir || !!this.verticalDir) {
                this.animator.SetState('running');
            } else {
                this.animator.SetState('idle');
            }
        } else {
            this.animator.SetState('jump');
        }

        this.Shoot();

        this.prevHorDir = this.horizontalDir || this.prevHorDir;
        this.transform.LocalScale = new Vector((this.horizontalDir || this.prevHorDir) * this.size, this.size);

        super.Update();
    }
}
