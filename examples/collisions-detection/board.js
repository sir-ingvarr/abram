class GaltonBoard extends GameObject {
	constructor(params = {}) {
		super(params);
		this.rows = params.rows || 7;
		this.columns = params.columns || 12;
		this.spacing = params.spacing || 40;
		this.pegSize = params.pegSize || 30;
		this.layer = params.layer || 1;
		this.contextWidth = params.contextWidth || 1280;
		this.contextHeight = params.contextHeight || 800;
		this.instantiate = params.instantiate || (() => { throw new Error('Instantiate function not provided'); });
		// Spacing is calculated to fit width
		this.spacing = this.contextWidth / this.columns;
		this.spacingY = this.contextHeight / this.rows;

		// Centered X, optional vertical offset
		this.offset = new Vector(
			this.spacing / 2, // slight offset for better centering
			this.spacingY = this.contextHeight / this.rows / 2 - 30 // vertical offset
		);
	}

	Start() {
		super.Start();


		for (let row = 0; row < this.rows; row++) {
			const isNotOddRow = row % 2 === 0;
			const colCount = isNotOddRow ? this.columns - 1 : this.columns;
			const rowY = row * this.spacing + this.offset.y - this.contextWidth / 2 + this.contextHeight / 2 - 100;

			for (let col = 0; col < colCount; col++) {
				const xOffset = isNotOddRow ? this.spacing / 2 : 0;
				const colX = col * this.spacing + xOffset + this.offset.x - this.contextWidth / 2;

				this.instantiate(Shape, {
					position: new Vector(colX, rowY),
					size: this.pegSize,
					isStatic: true,
					layer: this.layer,
					bounciness: 0.5,
				});

			}
		}
	}
}