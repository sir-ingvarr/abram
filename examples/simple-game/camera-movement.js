class CameraMovement extends GameObject {
    constructor(params) {
        super(params);
        this.targetZoom = 1;
        this.zoomSpeed = 2;
    }
    SetTargetZoom(zoom) {
        this.targetZoom = zoom;
    }

    TrackTarget(transform) {
        this.cam.Track(transform, {
            deadZone: new Vector(100, 50),
            damping: 2, softEdge: 0
        });
    }

    Start() {
        super.Start();
        this.cam = Camera.GetInstance({
            width: 1280, height: 800,
        });
        this.cam.Confiner = { maxY: 360 };
    }
    Update() {
        super.Update();
        const current = this.cam.Scale.x;
        const newScale = Maths.Lerp(current, this.targetZoom, Maths.Clamp(this.zoomSpeed * Time.DeltaTimeSeconds, 0, 1));
        this.cam.Scale = Vector.Of(newScale, newScale);
    }

}
