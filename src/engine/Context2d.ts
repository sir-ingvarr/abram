import {CtxOptions} from "../types/primitives";
import {Line, LinesShape} from "./Primitives/Primitive";
import {Rect} from "./Primitives/Primitive";
import {Point} from "./Classes";
import {ICoordinates} from "../types/common";

class CanvasContext2D {
    constructor(public ctx: CanvasRenderingContext2D) {}

    SetOptions(opts: CtxOptions) {
        this.ctx.save();
        Object.assign(this.ctx, opts);
    }

    get Position(): ICoordinates {
        const transform = this.ctx.getTransform();
        return new Point(transform.e, transform.f);
    }

    get Scale(): ICoordinates {
        const transform: DOMMatrix = this.ctx.getTransform();
        return new Point(transform.a, transform.d);
    }

    Reset() {
        this.ctx.setTransform(new DOMMatrix());
    }

    SetPosition(pos: ICoordinates) {
        this.Reset();
        this.ctx.translate(pos.x, pos.y);
    }

    SetScale(scale: ICoordinates) {
        this.ctx.scale(scale.x, scale.y);
    }

    Restore() {
        this.ctx.restore();
    }

    DrawLine(line: Line): void {
        const { segment: { from, to }, options, dash } = line;
        this.SetOptions(options);
        this.ctx.setLineDash(dash);
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
        this.Restore();
    }

    DrawLines(shape: LinesShape, contextRespective = false) {
        const { options, dash } = shape;
        this.SetOptions(options);
        const initialPos = contextRespective ? new Point(this.Position.x, this.Position.y) : new Point();
        for(let line of shape.segments) {
            const { from, to } = line;
            this.ctx.setLineDash(dash);
            this.ctx.moveTo(from.x - initialPos.x, from.y - initialPos.y);
            this.ctx.lineTo(to.x - initialPos.x, to.y - initialPos.y);
        }
        this.ctx.stroke();
        this.Restore();
    }

    DrawRect(rect: Rect, type = 0, contextRespective = false) {
        const { options, dash, segment: {from, to} } = rect;
        this.SetOptions(options);
        this.ctx.setLineDash(dash);
        const initialPos = contextRespective ? new Point(this.Position.x, this.Position.y) : new Point();
        this.ctx.rect(from.x + initialPos.x, from.y + initialPos.y, to.x + initialPos.x, to.y + initialPos.y);
        if(type === 0) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        this.Restore();
    }
}

export default CanvasContext2D;
