class Bg extends GameObject {
	constructor(params) {
		super(params);
		this.RegisterModule(params.sprite);
	}
}