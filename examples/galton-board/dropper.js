class Dropper extends GameObject {
	constructor(params) {
		super(params);
		this.maxBalls = params.maxBalls || Infinity;
		this.count = 0;
		this.timeSinceLastDrop = 0;
		this.dropEvery = params.dropEvery || 200;
		this.ballSize = params.ballSize || 8;
		this.spread = params.spread || 20;
		this.instantiate = params.instantiate;
	}

	Update() {
		super.Update();
		this.timeSinceLastDrop += Time.deltaTime;

		if(this.timeSinceLastDrop < this.dropEvery) return;
		if(this.maxBalls > 0 && this.count >= this.maxBalls) return;

		this.count++;
		this.instantiate(Ball, {
			position: new Vector(
				this.transform.WorldPosition.x + Maths.RandomRange(-this.spread, this.spread),
				this.transform.WorldPosition.y
			),
			size: this.ballSize,
		});
		this.timeSinceLastDrop = 0;
	}
}
