import Module from './Module';
import {IGameObject, ITransform} from '../../types/GameObject';
import {RGBAColor, Segment} from '../Classes';
import Time from '../Globals/Time';
import {GraphicPrimitive, PrimitiveType, ShapeDrawMethod} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import {ICoordinates} from '../../types/common';

type TrailRendererConstructorParams = {
	gameObject: IGameObject,
	resolution?: number,
	lifeTime?: number,
	widthOverTrail?: (factor: number, initialWidth: number) => number,
	colorOverTrail?: (factor: number, initialColor: RGBAColor) => RGBAColor,
	initialColor?: RGBAColor,
	initialWidth?: number,
	layer?: number,
	newSegmentEachMS?: number,
}

class TrailRenderer extends Module {
	private _previousPosition?: ICoordinates;
	private _lifetimes: Array<number>;
	private _colors: Array<RGBAColor>;
	private _widths: Array<number>;
	private _graphics: Array<GraphicPrimitive<Segment>>;
	private _sinceSpawn: number;
	private _lifeTime: number;
	private _colorOverTrail: (factor: number, initialColor: RGBAColor) => RGBAColor;
	private _widthOverTrail: (factor: number, initialWidth: number) => number;
	private _initialColor: RGBAColor;
	private _initialWidth: number;
	private _layer: number;
	private _newSegmentEachMS: number;

	constructor(params: TrailRendererConstructorParams) {
		super({});
		const {
			lifeTime = 100,
			initialColor = new RGBAColor(255, 255, 255),
			layer = 1, initialWidth = 2, newSegmentEachMS = 10,
			widthOverTrail = (factor, initialWidth) => initialWidth * (1 - factor),
			colorOverTrail = (factor, initialColor) => {
				const newColor = initialColor.Copy();
				newColor.Alpha = Math.floor(this._initialColor.Alpha * (1 - factor));
				return newColor;
			},
		} = params;
		if(!params.gameObject) throw new Error('gameObject must be defined');
		this.gameObject = params.gameObject;
		this._lifeTime = lifeTime;
		this._initialColor = initialColor;
		this._widthOverTrail = widthOverTrail;
		this._colorOverTrail = colorOverTrail;
		this._newSegmentEachMS = newSegmentEachMS;
		this._sinceSpawn = 0;
		this._layer = layer;
		this._initialWidth = initialWidth;
		this._graphics = [];
		this._lifetimes = [];
		this._colors = [];
		this._widths = [];
	}

	get WidthOverTrail() {
		return this._widthOverTrail;
	}

	get ColorOverTrail() {
		return this._colorOverTrail;
	}

	private AddSegment(point?: ICoordinates) {
		if(!this._previousPosition) return;
		if(!point) point = this._previousPosition;
		const dx = point.x - this._previousPosition.x;
		const dy = point.y - this._previousPosition.y;
		if(dx * dx + dy * dy < 0.001) return;
		this._widths.push(this._initialWidth);
		this._colors.push(this._initialColor.Copy());
		this._graphics.push(
			new GraphicPrimitive({
				layer: this._layer,
				type: PrimitiveType.Line,
				shape: new Segment(this._previousPosition, point),
				parent: this.gameObject?.transform as ITransform,
				drawMethod: ShapeDrawMethod.Stroke,
				disrespectParent: true,
				options: {
					strokeStyle: this._initialColor.ToHex(),
					lineWidth: this._initialWidth,
					contextRespectivePosition: false,
					lineCap: 'round',
					lineJoin: 'round',
				},
			})
		);
		this._lifetimes.push(0);
	}

	private updateExistingSegments() {
		for(let i = 0; i < this._graphics.length; i++) {
			this._lifetimes[i] += Time.deltaTime;
			if(this._lifetimes[i] > this._lifeTime) continue;
			const lifetimeFactor = this._lifetimes[i] / this._lifeTime;
			const color = this._colors[i] = this._colorOverTrail(lifetimeFactor, this._initialColor);
			const width = this._widths[i] = this._widthOverTrail(lifetimeFactor, this._initialWidth);
			const graphic = this._graphics[i];
			if(!graphic) continue;
			graphic.options.strokeStyle = color.ToHex();
			graphic.options.lineWidth = width;
			graphic.Update();
		}
		while(this._lifetimes.length && this._lifetimes[0] > this._lifeTime) {
			this._lifetimes.shift();
			this._graphics.shift();
			this._widths.shift();
			this._colors.shift();
		}
	}

	private trySpawnNewSegment() {
		this._sinceSpawn += Time.deltaTime;
		if(this._sinceSpawn < this._newSegmentEachMS) return;
		const parentPosition = this.gameObject?.transform?.WorldPosition;
		if(!parentPosition) return;
		if(!this._previousPosition) {
			this._previousPosition = parentPosition;
			this._sinceSpawn = 0;
			return;
		}
		this.AddSegment(parentPosition);
		this._previousPosition = parentPosition;
		this._sinceSpawn = 0;
	}

	override Update() {
		super.Update();
		this.updateExistingSegments();
		this.trySpawnNewSegment();
	}

}

export default TrailRenderer;