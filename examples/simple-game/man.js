
const { GameObject, Graphic, Animator, InputSystem, Classes: {Vector} } = window.Abram;

class Man extends GameObject {
    constructor(params, cam) {
        super(params);
        this.name = 'Man1';
        this.horizontalDir = 0;
        this.prevHorDir = 1;
        this.verticalDir = 0;
        this.cam = cam;
    }

    Start() {
        const graphic = new Graphic({
            url: './assets/dude_idle.png',
            width: 3, height: 7
        });

        this.size = 1;
        this.animator = new Animator({
            frameDelay: 100,
            stateMap: new Map([
                ['idle', ['./assets/dude_idle.png']],
                ['running', ['./assets/dude_run1.png', './assets/dude_idle.png', './assets/dude_run2.png', './assets/dude_idle.png',]],
            ]),
            state: 'idle',
            graphicElement: graphic,
        });

        this.RegisterModule(graphic);

        this.gun = new GameObject({ position: new Vector(1,3), name: `${this.name}`});
        const gunGraphic = new Graphic({
            url: './assets/gun.png',
            width: 3, height: 2
        });

        this.gun.RegisterModule(gunGraphic);
        this.AppendChild(this.gun);

        this.initialScale = this.scale.Copy();
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

    Update() {
        this.horizontalDir = this.CheckHorizontalInputs();
        this.verticalDir = this.CheckVerticalInputs();
        if(!!this.horizontalDir || !!this.verticalDir) {
            this.prevHorDir = this.horizontalDir || this.prevHorDir;
            this.animator.SetState('running');
        } else {
            this.animator.SetState('idle');
        }
        this.SetScale((this.horizontalDir || this.prevHorDir) * this.size, 1 * this.size);
        this.worldPosition.Translate(0.1 * this.horizontalDir, 0.1 * this.verticalDir);
        if(this.worldPosition.x > 40) {
            this.gun.SetActive(false);
            this.size = 1.1;
        }
        else {
            this.gun.SetActive(true);
            this.size = 1;
        }
        if(this.cam) this.cam.SetPosition(this.worldPosition);
        super.Update();
    }
}
