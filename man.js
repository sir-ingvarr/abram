class Man extends GameObject {
    constructor(params) {
        super(params);
        this.horizontalDir = 0;
        this.prevHorDir = 1;
        this.verticalDir = 0;
    }

    Start() {
        const graphic = new GraphicElement({
            url: './assets/dude_idle.png',
            width: 3, height: 7,
        });

        this.animator = new Animator({
            frameDelay: 100,
            stateMap: {
                idle: ['./assets/dude_idle.png'],
                running: ['./assets/dude_run1.png', './assets/dude_idle.png', './assets/dude_run2.png', './assets/dude_idle.png',],
            },
            state: 'idle',
            graphicElement: graphic,
        });

        this.SetGraphicsContent(graphic);
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

    Render() {
        this.horizontalDir = this.CheckHorizontalInputs();
        this.verticalDir = this.CheckVerticalInputs();
        if(!!this.horizontalDir || !!this.verticalDir) {
            this.prevHorDir = this.horizontalDir || this.prevHorDir;
            this.animator.SetState('running');
        } else {
            this.animator.SetState('idle');
        }
        if(this.graphic) this.graphic.SetScale(this.horizontalDir || this.prevHorDir);
        this.position.Translate(0.1 * this.horizontalDir, 0.1 * this.verticalDir);
        // if(this.position.x > 150) this.Destroy();
    }
}