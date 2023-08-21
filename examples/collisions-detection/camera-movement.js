const { Classes: {Point}, Camera } = window.Abram;


class CameraMovement extends GameObject {
    constructor(params, ctx) {
        super(params);
        this.pos = new Point(0, 0);
        this.cam = new Camera(ctx, 800, 600, 1)
    }

    SetPosition(pos) {
        this.pos = pos;
    }

    Update() {
        super.Update();
        this.cam.Center = this.pos;
    }

}