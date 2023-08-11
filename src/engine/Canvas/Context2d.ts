import {CtxOptions} from '../../types/GraphicPrimitives';
import {
	IGraphicPrimitive,
	PrimitiveType, PrimitiveShape,
} from './GraphicPrimitives/GraphicPrimitive';
import {Point, RGBAColor, Segment} from '../Classes';
import {ICoordinates} from '../../types/common';
import {BoundingBox, Circle, PolygonalChain, Rect, SegmentList} from './GraphicPrimitives/Shapes';

export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
export type CanvasRenderingCtx2D<T extends AnyCanvas> = T extends HTMLCanvasElement ? CanvasRenderingContext2D : OffscreenCanvasRenderingContext2D

class CanvasContext2D<T extends AnyCanvas = any> {
	private contextRespectivePositionBackup;
	private boundingBox: BoundingBox;
	constructor(
        private ctx: CanvasRenderingCtx2D<T>,
        public bgColor: string,
        private width: number,
        private height: number,
        private contextRespectivePosition: boolean = false
	) {
		this.SetSize(width, height);
		this.contextRespectivePositionBackup = this.contextRespectivePosition;
	}

	set Height(val: number) {
		this.height = val;
		this.GenerateBoundingBox();
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
		this.GenerateBoundingBox();
	}

	// TransferFromBitmap(bitmap: ImageBitmap) {
	// 	this.bitmapRenderingContext.transferFromImageBitmap(bitmap);
	// }

	SetSize(width: number, height?: number) {
		this.Width = width;
		if(height) this.Height = height;
		this.GenerateBoundingBox();
	}

	private GenerateBoundingBox() {
		this.boundingBox = new BoundingBox(
			new Point(),
			new Point(this.width, this.height),
			this.Position
		);
	}

	get ContextRespectiveBoundingBox() {
		const p = this.Position;
		return new BoundingBox(
			new Point(-p.x, -p.y),
			new Point(p.x + this.width, p.y + this.height)
		);
	}


	SetOptions(opts: CtxOptions): CanvasContext2D<T> {
		this.Save();
		if(!opts) return this;
		for(const key of Object.keys(opts)) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line
			this.ctx[key] = opts[key];
		}
		this.ContextRespectivePosition(opts.contextRespectivePosition || false);
		return this;
	}

	ContextRespectivePosition(val: boolean): CanvasContext2D<T> {
		this.contextRespectivePosition = val;
		return this;
	}

	Clear(): CanvasContext2D<T> {
		const point = this.boundingBox.From;
		const width = this.boundingBox.Width;
		const height = this.boundingBox.Height;
		this.ClearRect(point.x, point.y, width, height);
		return this;
	}

	ClearRect(x: number, y: number, w: number, h: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.clearRect(x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}

	MoveTo(x: number, y: number): CanvasContext2D<T> {
		this.ctx.moveTo(x, y);
		return this;
	}

	LineTo(x: number, y: number): CanvasContext2D<T> {
		this.ctx.lineTo(x, y);
		return this;
	}

	LineCap(lineCap: CanvasLineCap): CanvasContext2D<T> {
		this.ctx.lineCap = lineCap;
		return this;
	}

	LineJoin(lineJoin: CanvasLineJoin): CanvasContext2D<T> {
		this.ctx.lineJoin = lineJoin;
		return this;
	}

	LineWidth(lineWidth: number): CanvasContext2D<T> {
		this.ctx.lineWidth = lineWidth;
		return this;
	}

	FillStyle(fillStyle: string | CanvasGradient | CanvasPattern): CanvasContext2D<T> {
		this.ctx.fillStyle = fillStyle;
		return this;
	}

	StrokeStyle(strokeStyle: string | CanvasGradient | CanvasPattern): CanvasContext2D<T> {
		this.ctx.strokeStyle = strokeStyle;
		return this;
	}

	LineDash(lineDash: Array<number>): CanvasContext2D<T> {
		this.ctx.setLineDash(lineDash || []);
		return this;
	}

	set BgColor(color: RGBAColor) {
		this.bgColor = color.toString();
	}

	get Position(): ICoordinates {
		const transform = this.ctx.getTransform();
		return new Point(transform.e, transform.f);
	}

	get Scale(): ICoordinates {
		const transform: DOMMatrix = this.ctx.getTransform();
		return new Point(transform.a, transform.d);
	}

	Font(val: string): CanvasContext2D<T> {
		this.ctx.font = val;
		return this;
	}

	Reset(): CanvasContext2D<T> {
		this.ctx.setTransform(new DOMMatrix());
		return this;
	}

	Translate(x: number, y: number): CanvasContext2D<T> {
		this.ctx.translate(x, y);
		return this;
	}

	SetPosition(x: number, y: number): CanvasContext2D<T> {
		const transform = this.ctx.getTransform();
		transform.e = x; transform.f = y;
		this.ctx.setTransform(transform);
		return this;
	}

	SetScale(x: number, y: number): CanvasContext2D<T> {
		this.ctx.scale(x, y);
		return this;
	}

	Rotate(rotation: number): CanvasContext2D<T> {
		this.ctx.rotate(rotation);
		return this;
	}

	Stroke(): CanvasContext2D<T> {
		this.ctx.stroke();
		return this;
	}

	Save(): CanvasContext2D<T> {
		this.contextRespectivePositionBackup = this.contextRespectivePosition;
		this.ctx.save();
		return this;
	}

	Restore(): CanvasContext2D<T> {
		this.contextRespectivePosition = this.contextRespectivePositionBackup;
		this.ctx.restore();
		return this;
	}

	BeginPath(): CanvasContext2D<T> {
		this.ctx.beginPath();
		return this;
	}

	ClosePath(): CanvasContext2D<T> {
		this.ctx.closePath();
		return this;
	}

	Fill(): CanvasContext2D<T> {
		this.ctx.fill();
		return this;
	}

	DrawBg(offset?: ICoordinates): CanvasContext2D<T> {
		const point = this.boundingBox.From;
		const width = this.boundingBox.Width;
		const height = this.boundingBox.Height;
		const { x = 0, y = 0 } = offset || {};
		return this
			.Save()
			.FillStyle(this.bgColor)
			.Rect(point.x + x, point.y + y, width + x, height + y)
			.Fill()
			.Restore();
	}

	Draw<T extends PrimitiveShape>(any: IGraphicPrimitive<T>, offsetX = 0, offsetY = 0, fillStroke = 0) {
		const { type, options, dash } = any;
		this.SetOptions(options)
			.LineDash(dash)
			.BeginPath();
		if(type === PrimitiveType.Circle) return this.DrawCircle(any as IGraphicPrimitive<Circle>, offsetX, offsetY, fillStroke);
		if(type === PrimitiveType.Polygon) return this.DrawLines(any as IGraphicPrimitive<PolygonalChain>, offsetX, offsetY);
		if(type === PrimitiveType.Lines) return this.DrawLines(any as IGraphicPrimitive<SegmentList>, offsetX, offsetY);
		if(type === PrimitiveType.Line) return this.DrawLine(any as IGraphicPrimitive<Segment>, offsetX, offsetY);
		if(type === PrimitiveType.Rect) return this.DrawRect(any as IGraphicPrimitive<Segment>, offsetX, offsetY, fillStroke);
	}

	DrawLine(line: IGraphicPrimitive<Segment>, offsetX: number, offsetY: number): CanvasContext2D<T> {
		const { shape: { from, to } } = line;
		return this.Line(from.x + offsetX, from.y + offsetY, to.x + offsetX, to.y + offsetY);
		// return this
		// 	.MoveTo(from.x + offsetX, from.y + offsetY)
		// 	.LineTo(to.x + offsetX, to.y + offsetY)
		// 	.Stroke()
		// 	.ClosePath()
		// 	.Restore();
	}

	DrawLines(lines: IGraphicPrimitive<SegmentList | PolygonalChain>, offsetX: number, offsetY: number) {
		for(const line of lines.shape.SegmentsUnsafe) {
			const { from, to } = line;
			this
				.MoveTo(from.x + offsetX, from.y + offsetY)
				.LineTo(to.x + offsetX, to.y + offsetY);
		}
		this.Stroke().Restore();
	}

	DrawRect(rect: IGraphicPrimitive<Segment>, offsetX: number, offsetY: number, type = 0) {
		const { shape: {from, to} } = rect;
		this.Rect(from.x + offsetX, from.y + offsetY, to.x + offsetX, to.y + offsetY);
		if(type === 0) {
			this.Fill();
		} else {
			this.Stroke();
		}
		this.Restore();
	}

	DrawCircle(circle: IGraphicPrimitive<Circle>, offsetX: number, offsetY: number, type = 0) {
		const { shape: { center, radius } } = circle;
		this.Arc(center.x + offsetX + radius, center.y + offsetY + radius, radius);
		if(type === 0) {
			this.Fill();
		} else {
			this.Stroke();
		}
		return this.Restore();
	}

	FillText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.fillText(text, x - initialPos.x, y - initialPos.y, maxWidth);
		return this;
	}

	StrokeText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.strokeText(text, x - initialPos.x, y - initialPos.y, maxWidth);
		return this;
	}

	FillRect(x: number, y: number, w: number, h: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.fillRect(x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}

	StrokeRect(x: number, y: number, w: number, h: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.strokeRect(x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}

	Rect(x: number, y: number, w: number, h: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.rect(x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}

	Arc(x: number, y: number, r: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.arc(x - initialPos.x, y - initialPos.y, r, 0, 2 * Math.PI);
		return this;
	}

	Line(x1: number, y1: number, x2: number, y2: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this
			.MoveTo(x1 - initialPos.x, y1 - initialPos.y)
			.LineTo(x2 - initialPos.x, y2 - initialPos.y)
			.Stroke()
			.ClosePath()
			.Restore();
		return this;
	}

	DrawImage(imageData: CanvasImageSource, x: number, y: number, w: number, h: number): CanvasContext2D<T> {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.drawImage(imageData, x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}
}

export default CanvasContext2D;
