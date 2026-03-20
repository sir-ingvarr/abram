class CameraMovement extends GameObject {
	constructor(params) {
		super(params);
		this.pos = new Point(0, 0);
	}

	Start() {
		super.Start();
		this.cam = Camera.GetInstance({ width: 1280, height: 800, position: this.pos });
		this.cam.Center = this.pos;
	}

	Update() {
		super.Update();
	}
}
