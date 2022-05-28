import {CtxOptions, ShadowOptions, StrokeOptions} from "../../types/primitives";
import {Dictionary} from "../../types/common";
import {RGBAColor, Segment} from "../Classes";

const defaultOpts: CtxOptions = {
    lineWidth: 1,
    strokeStyle: new RGBAColor(0, 0, 0, 255).toString(),
    lineCap: "butt",
    lineJoin: "round",
    fillStyle: new RGBAColor(255, 255, 255, 255).toString()
}

export class Primitive<T, V extends Partial<CtxOptions>> {
    public options: V | Dictionary;
    public dash: Array<number> = [];
    constructor(public dimensions: T, options: V, shadow: ShadowOptions = {}) {
        this.options = {};
        this.HandleOptions(options, shadow);
    }

    private HandleOptions(options: V, shadow: ShadowOptions) {
        const opts =  Object.assign({}, defaultOpts, options, shadow);
        this.dash = this.dash.concat(opts.dash || defaultOpts.dash as Array<number>);
        delete opts.dash;
        this.options = opts;
    }
}

export class Line extends Primitive<Segment, StrokeOptions>{
    constructor(public segment: Segment, options: StrokeOptions = {}, shadow: ShadowOptions = {}) {
        super(segment, options, shadow);
    }
}

export class LinesShape extends Primitive<Array<Segment>, CtxOptions>{
    constructor(public segments: Array<Segment>, options: StrokeOptions = {}, shadow: ShadowOptions = {}) {
        super(segments, options, shadow);
    }
}

export class Rect extends Primitive<Segment, CtxOptions>{
    constructor(public segment: Segment, options: CtxOptions = {}, shadow: ShadowOptions) {
        super(segment, options, shadow);
    }
}