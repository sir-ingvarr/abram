import Module from './Module';
import {IGameObject, ITransform} from '../../types/GameObject';
import {RGBAColor, Segment} from '../Classes';
import Time from '../Globals/Time';
import {GraphicPrimitive, PrimitiveType, ShapeDrawMethod} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import {SegmentList} from '../Canvas/GraphicPrimitives/Shapes';
import {ICoordinates} from '../../types/common';

type TrailRendererConstructorParams = {
	parentTransform: ITransform,
	resolution?: number,
	lifeTime?: number,
	widthOverTrail?: (factor: number) => number,
	color?: RGBAColor,
	max?: number,
	layer?: number,
	width?: number,
	colorOverTrail?: (factor: number, current: RGBAColor) => RGBAColor,
}

class TrailRenderer extends Module {
	private _parentTransform: ITransform;
	private _previousPosition: ICoordinates;
	private _lifetimes: Array<number>;
	private _segmentList: SegmentList;
	private _chain: GraphicPrimitive<SegmentList>;
	private _sinceSpawn: number;
	private _lifeTime: number;
	private _color: RGBAColor;
	private _width: number;
	private _layer: number;
	_widthOverTrail: (factor: number) => number;
	_colorOverTrail: (factor: number, current: RGBAColor) => RGBAColor;

	constructor(params: TrailRendererConstructorParams) {
		super({});
		const {
			lifeTime = 100,
			widthOverTrail = (factor) => -factor,
			color = new RGBAColor(255, 255, 255),
			layer = 1, width = 2,
		} = params;
		this._parentTransform = params.parentTransform;
		if(!this._parentTransform) throw 'parent transform required';
		this._lifeTime = lifeTime;
		this._segmentList = new SegmentList([]);
		this._color = color;
		this._widthOverTrail = widthOverTrail;
		this._lifetimes = [];
		this._sinceSpawn = 0;
		this._layer = layer;
		this._width = width;
		this._chain = new GraphicPrimitive({
			layer: this._layer,
			type: PrimitiveType.Lines,
			shape: this._segmentList,
			parent: this._parentTransform,
			drawMethod: ShapeDrawMethod.Stroke,
			disrespectParent: true,
			options: {
				strokeStyle: this._color.ToHex(),
				lineWidth: this._width,
				contextRespectivePosition: false,
				lineCap: 'round',
				lineJoin: 'round',
			},
		});
		const go = this._parentTransform.gameObject as IGameObject;
		go.RegisterModule(this._chain);
	}

	get WidthOverTrail() {
		return this._widthOverTrail;
	}

	get ColorOverTrail() {
		return this._colorOverTrail;
	}

	override Start() {
		super.Start();
		this._previousPosition = this._parentTransform.WorldPosition;
	}

	get Chain() {
		return this._chain;
	}

	private AddSegment(point: ICoordinates) {
		this._segmentList.AddSegment(new Segment(this._previousPosition, point));
		this._lifetimes.push(0);
	}

	override Update() {
		super.Update();
		for(const segmentId in this._segmentList.SegmentsUnsafe) {
			this._lifetimes[+segmentId] += Time.deltaTime;
			if(this._lifetimes[segmentId] > this._lifeTime) {
				this._lifetimes.splice(+segmentId, 1);
				this._segmentList.RemoveSegment(+segmentId);
			}
		}
		const parentPosition = this._parentTransform.WorldPosition;
		this._sinceSpawn += Time.deltaTime;
		if(this._sinceSpawn < 5) return;
		this.AddSegment(parentPosition);
		this._previousPosition = this._parentTransform.WorldPosition;

		this._sinceSpawn = 0;
	}

}

export default TrailRenderer;