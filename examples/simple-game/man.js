const { GameObject, Sprite, ImageWrapper, Animator, InputSystem, Time, Classes: {Vector}, RigidBody } = window.Abram;

class Man extends GameObject {
    constructor(params, cam) {
        super(params);
        this.name = 'Man1';
        this.horizontalDir = 0;
        this.prevHorDir = 1;
        this.verticalDir = 0;
        this.cam = cam;
        this.layer = params.layer;
    }

    Start() {
        this.ground = new RigidBody({useGravity: false, drag: 4});

        const image = new ImageWrapper('./assets/dude_idle.png');

        const graphic = new Sprite({
            image: image,
            width: 30, height: 70, layer: this.layer,
        });

        graphic.parent = this.transform;
        this.size = 1;
        this.animator = new Animator({
            frameDelay: 100,
            stateMap: new Map([
                ['idle', ['./assets/dude_idle.png']],
                ['running', ['./assets/dude_run1.png', './assets/dude_idle.png', './assets/dude_run2.png', './assets/dude_idle.png',]],
                ['jump', ['./assets/dude_run1.png']],
            ]),
            state: 'idle',
            graphicElement: graphic,
        });

        this.rigidBody = new RigidBody({useGravity: true, gravityScale: 0.4, drag: 0.4});

        this.RegisterModule(this.rigidBody);
        this.RegisterModule(graphic);
        this.RegisterModule(this.animator);

        this.gun = new GameObject({ position: new Vector(10,30), name: `${this.name}_gun`});

        const gunImage = new ImageWrapper('./assets/gun.png');

        const gunGraphic = new Sprite({
            image: gunImage,
            width: 30, height: 20, layer: this.layer + 1,
        });

        gunGraphic.parent = this.gun.transform;


        this.gun.RegisterModule(gunGraphic);
        this.AppendChild(this.gun);

        // this.initialScale = this.transform.Scale;
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

    Jump(shouldStand) {
        if(InputSystem.KeyPressed('Space') && shouldStand) {
            this.rigidBody.AddForce(Vector.MultiplyCoordinates(100, Vector.Down).Add(new Vector(this.horizontalDir * 40, 0)));
        }
    }

    Update() {
        this.horizontalDir = this.CheckHorizontalInputs();
        this.verticalDir = this.CheckVerticalInputs();
        const pos = this.transform.WorldPosition;
        if(this.cam) this.cam.SetPosition(pos);
        const shouldStand = pos.y >= 250;
        this.rigidBody.UseGravity = !shouldStand
        if(shouldStand) {
            this.rigidBody.collidedRb = this.ground;
            this.rigidBody.velocity.y = 0;
            this.transform.LocalPosition = new Vector(pos.x, 250);
        } else {
            this.rigidBody.collidedRb = null;
        }
        this.Jump(shouldStand);

        this.prevHorDir = this.horizontalDir || this.prevHorDir;

        if(shouldStand) {
            if (!!this.horizontalDir || !!this.verticalDir) {
                this.animator.SetState('running');
            } else {
                this.animator.SetState('idle');
            }
        } else {
            this.animator.SetState('jump');
        }
        this.transform.LocalScale = new Vector((this.horizontalDir || this.prevHorDir) * this.size, this.size);
        const delta = Time.deltaTime / 1000;
        // this.worldPosition.Translate(delta * 100 * this.horizontalDir, delta * 100 * this.verticalDir);
        if(shouldStand) {
            this.rigidBody.AddForce(Vector.MultiplyCoordinates(3, new Vector(this.horizontalDir, 0)));
            if(this.size > 1) this.size -= delta;
            if(this.transform.RotationDeg !== 0) this.transform.RotateDeg(1)

        } else {
            // this.gun.SetActive(false);
            if(this.transform.RotationDeg > -10) this.transform.RotateDeg(-1);

            if(this.size < 1.1)
            this.size += delta;
        }
        super.Update();
    }
}
