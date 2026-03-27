class GaltonBoard extends GameObject {
	constructor(params) {
		super(params);
		this.rows = params.rows || 10;
		this.columns = params.columns || 11;
		this.pegSpacing = params.pegSpacing || 50;
		this.pegSize = params.pegSize || 12;
		this.instantiate = params.instantiate;
	}

	Start() {
		super.Start();
		const boardWidth = this.columns * this.pegSpacing;
		const startX = -boardWidth / 2;
		const startY = -300;

		for (let row = 0; row < this.rows; row++) {
			const isEvenRow = row % 2 === 0;
			const colCount = isEvenRow ? this.columns : this.columns - 1;
			const xOffset = isEvenRow ? 0 : this.pegSpacing / 2;
			const rowY = startY + row * this.pegSpacing;

			for (let col = 0; col < colCount; col++) {
				const colX = startX + col * this.pegSpacing + xOffset;
				this.instantiate(Peg, {
					position: new Vector(colX, rowY),
					size: this.pegSize,
				});
			}
		}

		// Bins — positions are centers
		// Walls must be thicker than ball diameter to prevent tunneling
		const binHeight = 180;
		const floorThickness = 60;
		const dividerThickness = 15;
		const floorY = 350;
		const floorWidth = boardWidth + this.pegSpacing * 2;

		// Floor
		this.instantiate(Wall, {
			position: new Vector(-50, floorY + floorThickness / 2),
			wallWidth: floorWidth,
			wallHeight: floorThickness,
		});

		// Divider walls in the collection bins
		const binTopCenterY = floorY - binHeight / 2;
		const binCount = this.columns;
		const fullWallHeight = floorY - startY + floorThickness;
		const fullWallCenterY = startY + fullWallHeight / 2;

		for (let i = 0; i <= binCount; i++) {
			const wallX = startX - this.pegSpacing / 2 + i * this.pegSpacing;
			const isEdgeWall = i === 0 || i === binCount;
			this.instantiate(Wall, {
				position: new Vector(wallX, isEdgeWall ? fullWallCenterY : binTopCenterY),
				wallWidth: dividerThickness,
				wallHeight: isEdgeWall ? fullWallHeight : binHeight,
			});
		}
	}
}
