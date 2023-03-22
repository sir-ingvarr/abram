import {CtxOptions, ShadowOptions, StrokeOptions} from '../../../types/GraphicPrimitives';
import {RGBAColor, Segment} from '../../Classes';
import {Circle, Polygon, PolygonalChain, Rect} from './Shapes';
import {ITransform} from '../../../types/GameObject';

const defaultOpts: CtxOptions = {
	dash: [],
	lineWidth: 1,
	strokeStyle: new RGBAColor(0, 0, 0, 255).ToHex(),
	lineCap: 'butt',
	lineJoin: 'round',
	fillStyle: new RGBAColor(255, 255, 255, 255).ToHex()
};

export enum PrimitiveType {
    Circle,
    Rect,
    Polygon,
    Line
}

export type PrimitiveShape = Segment | Rect | PolygonalChain | Circle | Polygon;

export interface IGraphicPrimitive {
    layer: number,
    options: CtxOptions,
    dash: Array<number>,
    type: PrimitiveType,
    shape: PrimitiveShape,
    parent: ITransform,
	readonly Width: number,
	readonly Height: number
}

export class GraphicPrimitive<V extends Partial<CtxOptions>> implements IGraphicPrimitive {
	public options: V | CtxOptions;
	public dash: Array<number> = [];
	public type: PrimitiveType;
	public shape: PrimitiveShape;
	public layer: number;
	public parent: ITransform;

	constructor(type: PrimitiveType, parent: ITransform, options: V, shadow: ShadowOptions = {}, layer = 1) {
		this.type = type;
		this.layer = layer;
		this.HandleOptions(options, shadow);
		this.parent = parent;
	}

	get Width() {
		return this.shape.Width;
	}

	get Height() {
		return this.shape.Height;
	}
	private HandleOptions(options: V, shadow: ShadowOptions) {
		this.options = {};
		const opts =  Object.assign({}, defaultOpts, options, shadow);
		this.dash = this.dash.concat(opts.dash || defaultOpts.dash as Array<number>);
		delete opts.dash;
		this.options = opts;
	}
}

export class LinePrimitive extends GraphicPrimitive<StrokeOptions>{
	constructor(public shape: Segment, parent: ITransform, options: StrokeOptions = {}, shadow: ShadowOptions = {}) {
		super(PrimitiveType.Line, parent, options, shadow);
	}
}

export class PolygonPrimitive extends GraphicPrimitive<CtxOptions>{
	constructor(public shape: PolygonalChain, parent: ITransform, options: StrokeOptions = {}, shadow: ShadowOptions = {}) {
		super(PrimitiveType.Polygon, parent, options, shadow);
	}
}

export class RectPrimitive extends GraphicPrimitive<CtxOptions>{
	constructor(public shape: Rect, parent: ITransform, options: CtxOptions = {}, shadow: ShadowOptions = {}) {
		super(PrimitiveType.Rect, parent, options, shadow);
	}
}

export class CirclePrimitive extends GraphicPrimitive<CtxOptions> {
	constructor(public shape: Circle, parent: ITransform, options: CtxOptions = {}, shadow: ShadowOptions = {}) {
		super(PrimitiveType.Circle, parent, options, shadow);
	}
}
