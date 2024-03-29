const { Classes: {Point}, Camera } = window.Abram;


class CameraMovement extends GameObject {
    constructor(params) {
        super(params);
        this.pos = new Point(0, 0);
    }
    SetPosition(pos) {
        this.pos = pos;
    }

    Start() {
        super.Start();
        this.cam = Camera.GetInstance({width: 1280, height: 800, position: this.pos});
    }
    Update() {
        super.Update();
        this.cam.Center = this.pos;
    }

}