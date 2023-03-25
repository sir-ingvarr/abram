import {CtxOptions, ShadowOptions} from '../../../types/GraphicPrimitives';
import {RGBAColor, Segment} from '../../Classes';
import {Circle, Polygon, PolygonalChain, Rect} from './Shapes';
import {ITransform} from '../../../types/GameObject';
import SpriteRenderer from '../../Managers/SpriteRenderer';
import Module from '../../Modules/Module';

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

export enum ShapeDrawMethod {
	Fill,
	Stroke
}

export type PrimitiveShape = Rect | Circle | Polygon | PolygonalChain | Segment;

export interface IGraphicPrimitive<T extends PrimitiveShape> {
    layer: number,
    options: CtxOptions,
    dash: Array<number>,
    type: PrimitiveType,
	shape: T,
	parent: ITransform,
	drawMethod: ShapeDrawMethod,
	readonly Width: number,
	readonly Height: number
}

export type GraphicPrimitiveConstructorParams<T extends PrimitiveShape> = {
	type: PrimitiveType,
	parent: ITransform,
	options?: Partial<CtxOptions>,
	shadow?: ShadowOptions,
	layer?: number,
	drawMethod?: ShapeDrawMethod,
	shape: T
}

export class GraphicPrimitive<Shape extends PrimitiveShape> extends Module implements IGraphicPrimitive<Shape> {
	public options: CtxOptions;
	public dash: Array<number> = [];
	public type: PrimitiveType;
	public shape: Shape;
	public layer: number;
	public parent: ITransform;
	public drawMethod: ShapeDrawMethod;

	constructor(params: GraphicPrimitiveConstructorParams<Shape>) {
		super({});
		const { shape, type, layer = 0, options = {}, shadow = {}, parent, drawMethod = ShapeDrawMethod.Fill } = params;
		this.type = type;
		this.layer = layer;
		this.shape = shape;
		this.HandleOptions(options, shadow);
		this.parent = parent;
		this.drawMethod = drawMethod;
	}

	get Width() {
		return this.shape.Width;
	}

	get Height() {
		return this.shape.Height;
	}

	private HandleOptions(options: CtxOptions, shadow: ShadowOptions) {
		this.options = {};
		const opts =  Object.assign({}, defaultOpts, options, shadow);
		this.dash = this.dash.concat(opts.dash || defaultOpts.dash as Array<number>);
		delete opts.dash;
		this.options = opts;
	}

	Update() {
		SpriteRenderer.GetInstance().AddToRenderQueue(this);
	}
}

