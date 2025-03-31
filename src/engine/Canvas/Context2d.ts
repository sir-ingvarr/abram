import {CtxOptions} from '../../types/GraphicPrimitives';
import {
	IGraphicPrimitive,
	PrimitiveType, PrimitiveShape,
} from './GraphicPrimitives/GraphicPrimitive';
import {Point, RGBAColor, Segment} from '../Classes';
import {ICoordinates} from '../../types/common';
import {BoundingBox, Circle, PolygonalChain, SegmentList} from './GraphicPrimitives/Shapes';
import {IContextOpts} from '../Managers/SpriteRenderer';

class CanvasContext2D {
	constructor(
		private readonly ctx: CanvasRenderingContext2D,
		public bgColor: string,
		private width: number,
		private height: number,
	) {
		if(!this.ctx) throw 'ctx is required';
		this.SetSize(width, height);
	}

	set Height(val: number) {
		this.height = val;
	}

	get Height() {
		return this.height;
	}

	get CTX() {
		return this.ctx;
	}

	get Width() {
		return this.width;
	}

	set Width(val: number) {
		this.width = val;
	}

	SetSize(width: number, height?: number) {
		this.Width = width;
		if(height) this.Height = height;
	}

	get ContextRespectiveBoundingBox() {
		const p = this.Position;
		const halfWidth = this.width / 2;
		const halfHeight = this.height / 2;
		return new BoundingBox(
			new Point(p.x - halfWidth, p.y - halfHeight),
			new Point(p.x + halfWidth, p.y + halfHeight)
		);
	}


	SetOptions(opts: CtxOptions): CanvasContext2D {
		if(!opts) return this;
		for(const key of Object.keys(opts)) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line
			this.ctx[key] = opts[key];
		}
		return this;
	}


	Clear(): CanvasContext2D {
		this.ctx.clearRect(0, 0, this.width, this.height);
		return this;
	}

	MoveTo(x: number, y: number): CanvasContext2D {
		this.ctx.moveTo(x, y);
		return this;
	}

	LineTo(x: number, y: number): CanvasContext2D {
		this.ctx.lineTo(x, y);
		return this;
	}

	LineCap(lineCap: CanvasLineCap): CanvasContext2D {
		this.ctx.lineCap = lineCap;
		return this;
	}

	LineJoin(lineJoin: CanvasLineJoin): CanvasContext2D {
		this.ctx.lineJoin = lineJoin;
		return this;
	}

	LineWidth(lineWidth: number): CanvasContext2D {
		this.ctx.lineWidth = lineWidth;
		return this;
	}

	FillStyle(fillStyle: string | CanvasGradient | CanvasPattern): CanvasContext2D {
		this.ctx.fillStyle = fillStyle;
		return this;
	}

	StrokeStyle(strokeStyle: string | CanvasGradient | CanvasPattern): CanvasContext2D {
		this.ctx.strokeStyle = strokeStyle;
		return this;
	}

	LineDash(lineDash: Array<number>): CanvasContext2D {
		this.ctx.setLineDash(lineDash || []);
		return this;
	}

	set BgColor(color: RGBAColor) {
		this.bgColor = color.toString();
	}

	get Position(): Point {
		const transform = this.ctx.getTransform();
		return new Point(transform.e, transform.f);
	}

	get Scale(): ICoordinates {
		const transform: DOMMatrix = this.ctx.getTransform();
		return new Point(transform.a, transform.d);
	}

	Font(val: string): CanvasContext2D {
		this.ctx.font = val;
		return this;
	}

	Reset(): CanvasContext2D {
		this.ctx.resetTransform();
		return this;
	}

	Translate(x: number, y: number): CanvasContext2D {
		this.ctx.translate(x, y);
		return this;
	}

	SetPosition(x: number, y: number): CanvasContext2D {
		const transform = this.ctx.getTransform();
		transform.e = x; transform.f = y;
		this.ctx.setTransform(transform);
		return this;
	}

	SetScale(x: number, y: number): CanvasContext2D {
		this.ctx.scale(x, y);
		return this;
	}

	Rotate(rotation: number): CanvasContext2D {
		this.ctx.rotate(rotation);
		return this;
	}

	Stroke(): CanvasContext2D {
		this.ctx.stroke();
		return this;
	}

	Save(): CanvasContext2D {
		this.ctx.save();
		return this;
	}

	Restore(): CanvasContext2D {
		this.ctx.restore();
		return this;
	}

	BeginPath(): CanvasContext2D {
		this.ctx.beginPath();
		return this;
	}

	ClosePath(): CanvasContext2D {
		this.ctx.closePath();
		return this;
	}

	Fill(): CanvasContext2D {
		this.ctx.fill();
		return this;
	}

	DrawBg(offset?: ICoordinates): CanvasContext2D {
		const { x = 0, y = 0 } = offset || {};
		return this.BeginPath().FillStyle(this.bgColor)
			.Rect(x, y,	this.width,	this.height)
			.Fill();
	}

	Draw<T extends PrimitiveShape>(any: IGraphicPrimitive<T>, offsetX = 0, offsetY = 0, fillStroke = 0) {
		const { type, options, dash } = any;
		this.SetOptions(options)
			.LineDash(dash)
			.BeginPath();
		if(type === PrimitiveType.Circle) return this.DrawCircle(any as IGraphicPrimitive<Circle>, offsetX, offsetY, fillStroke);
		if(type === PrimitiveType.Chain) return this.DrawLines(any as IGraphicPrimitive<PolygonalChain>, offsetX, offsetY);
		if(type === PrimitiveType.Lines) return this.DrawLines(any as IGraphicPrimitive<SegmentList>, offsetX, offsetY);
		if(type === PrimitiveType.Line) return this.DrawLine(any as IGraphicPrimitive<Segment>, offsetX, offsetY);
		if(type === PrimitiveType.Rect) return this.DrawRect(any as IGraphicPrimitive<Segment>, offsetX, offsetY, fillStroke);
	}

	DrawLine(line: IGraphicPrimitive<Segment>, offsetX: number, offsetY: number): CanvasContext2D {
		const contextRespectivePosition = line.options.contextRespectivePosition || false;
		const initialPos = contextRespectivePosition ? this.Position : new Point();
		
		const { shape: { from, to } } = line;
		return this.Line(
			from.x + offsetX - initialPos.x,
			from.y + offsetY - initialPos.y,
			to.x + offsetX - initialPos.x,
			to.y + offsetY - initialPos.y
		);
	}

	DrawLines(lines: IGraphicPrimitive<SegmentList | PolygonalChain>, offsetX: number, offsetY: number) {
		const contextRespectivePosition = lines.options.contextRespectivePosition || false;
		const initialPos = contextRespectivePosition ? this.Position : new Point();
		for(const line of lines.shape.SegmentsUnsafe) {
			const { from, to } = line;
			this
				.MoveTo(from.x + offsetX - initialPos.x, from.y + offsetY - initialPos.y)
				.LineTo(to.x + offsetX - initialPos.x, to.y + offsetY - initialPos.y);
		}
		this.Stroke();
	}

	DrawRect(rect: IGraphicPrimitive<Segment>, offsetX: number, offsetY: number, type = 0) {
		const { shape: {from, to}, options: { contextRespectivePosition = false }} = rect;
		const initialPos = contextRespectivePosition ? this.Position : new Point();
		this.Rect(from.x + offsetX - initialPos.x, from.y + offsetY - initialPos.y, to.x + offsetX - initialPos.x, to.y + offsetY - initialPos.y);
		if(type === 0) {
			this.Fill();
		} else {
			this.Stroke();
		}
	}

	DrawCircle(circle: IGraphicPrimitive<Circle>, offsetX: number, offsetY: number, type = 0) {
		const contextRespectivePosition = circle.options.contextRespectivePosition || false;
		const initialPos = contextRespectivePosition ? this.Position : new Point();
		
		const { shape: { center, radius } } = circle;
		this.Arc(center.x + offsetX + radius - initialPos.x, center.y + offsetY + radius - initialPos.y, radius);
		if(type === 0) {
			this.Fill();
		} else {
			this.Stroke();
		}
		// return this.ClosePath();
	}

	FillText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D {
		this.ctx.fillText(text, x, y, maxWidth);
		return this;
	}

	StrokeText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D {
		this.ctx.strokeText(text, x, y, maxWidth);
		return this;
	}

	FillRect(x: number, y: number, w: number, h: number): CanvasContext2D {
		this.ctx.fillRect(x, y, w, h);
		return this;
	}

	StrokeRect(x: number, y: number, w: number, h: number): CanvasContext2D {
		this.ctx.strokeRect(x, y, w, h);
		return this;
	}

	Rect(x: number, y: number, w: number, h: number): CanvasContext2D {
		this.ctx.rect(x, y, w, h);
		return this;
	}

	Arc(x: number, y: number, r: number): CanvasContext2D {
		this.ctx.arc(x, y, r, 0, 2 * Math.PI);
		return this;
	}

	Line(x1: number, y1: number, x2: number, y2: number): CanvasContext2D {
		this
			.MoveTo(x1, y1)
			.LineTo(x2, y2)
			.Stroke();
		return this;
	}

	DrawImage(graphic: IContextOpts, imageData: CanvasImageSource, x: number, y: number, w: number, h: number): CanvasContext2D {
		this.BeginPath();
		const contextRespectivePosition = graphic?.options?.contextRespectivePosition || false;
		const initialPos = contextRespectivePosition ? this.Position : new Point();
		this.ctx.drawImage(imageData, x + initialPos.x, y + initialPos.y, w, h);
		return this;
	}
}

export default CanvasContext2D;