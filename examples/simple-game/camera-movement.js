class CameraMovement extends GameObject {
    constructor(params) {
        super(params);
        this.pos = new Point(0, 0);
        this.targetZoom = 1;
        this.zoomSpeed = 2;
    }
    SetPosition(pos) {
        this.pos = pos;
    }
    SetTargetZoom(zoom) {
        this.targetZoom = zoom;
    }

    Start() {
        super.Start();
        this.cam = Camera.GetInstance({
            width: 1280, height: 800, position: this.pos,
            confiner: new BoundingBox(new Point(-1000, -400), new Point(1000, 55)),
        });
    }
    Update() {
        super.Update();
        this.cam.Center = this.pos;
        const current = this.cam.Scale.x;
        const newScale = Maths.Lerp(current, this.targetZoom, Maths.Clamp(this.zoomSpeed * Time.DeltaTimeSeconds, 0, 1));
        this.cam.Scale = Vector.Of(newScale, newScale);
        this.cam.Confine();
    }

}