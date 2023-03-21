import {CtxOptions, ShadowOptions, StrokeOptions} from "../../../types/GraphicPrimitives";
import {Dictionary} from "../../../types/common";
import {RGBAColor, Segment} from "../../Classes";
import {Circle, Rect} from "./Shapes";
import {ITransform} from "../../../types/GameObject";

const defaultOpts: CtxOptions = {
    dash: [],
    lineWidth: 1,
    strokeStyle: new RGBAColor(0, 0, 0, 255).ToHex(),
    lineCap: "butt",
    lineJoin: "round",
    fillStyle: new RGBAColor(255, 255, 255, 255).ToHex()
}

export enum PrimitiveType {
    Circle,
    Rect,
    Polygon,
    Line
}

export interface IGraphicPrimitive {
    layer: number,
    options: Dictionary,
    dash: Array<number>,
    type: PrimitiveType,
    shape: Segment | Rect | Array<Segment> | Circle,
    parent: ITransform,
}

export class GraphicPrimitive<T, V extends Partial<CtxOptions>> implements IGraphicPrimitive {
    public options: V | Dictionary;
    public dash: Array<number> = [];
    public type: PrimitiveType;
    public shape: any;
    public layer: number;
    public parent: ITransform;

    constructor(type: PrimitiveType, parent: ITransform, options: V, shadow: ShadowOptions = {}, layer = 1) {
        this.type = type;
        this.layer = layer;
        this.HandleOptions(options, shadow);
        this.parent = parent;
    }

    private HandleOptions(options: V, shadow: ShadowOptions) {
        this.options = {};
        const opts =  Object.assign({}, defaultOpts, options, shadow);
        this.dash = this.dash.concat(opts.dash || defaultOpts.dash as Array<number>);
        delete opts.dash;
        this.options = opts;
    }
}

export class LinePrimitive extends GraphicPrimitive<Segment, StrokeOptions>{
    constructor(public shape: Segment, parent: ITransform, options: StrokeOptions = {}, shadow: ShadowOptions = {}) {
        super(PrimitiveType.Line, parent, options, shadow);
    }
}

export class PolygonPrimitive extends GraphicPrimitive<Array<Segment>, CtxOptions>{
    constructor(public shape: Array<Segment>, parent: ITransform, options: StrokeOptions = {}, shadow: ShadowOptions = {}) {
        super(PrimitiveType.Polygon, parent, options, shadow);
    }
}

export class RectPrimitive extends GraphicPrimitive<Segment, CtxOptions>{
    constructor(public shape: Rect, parent: ITransform, options: CtxOptions = {}, shadow: ShadowOptions = {}) {
        super(PrimitiveType.Rect, parent, options, shadow);
    }
}

export class CirclePrimitive extends GraphicPrimitive<Circle, CtxOptions> {
    constructor(public shape: Circle, parent: ITransform, options: CtxOptions = {}, shadow: ShadowOptions = {}) {
        super(PrimitiveType.Circle, parent, options, shadow);
    }
}
