import {CtxOptions} from '../../types/GraphicPrimitives';
import {
	CirclePrimitive,
	IGraphicPrimitive,
	LinePrimitive,
	PolygonPrimitive,
	PrimitiveType,
	RectPrimitive
} from './GraphicPrimitives/GraphicPrimitive';
import {Point, RGBAColor} from '../Classes';
import {ICoordinates} from '../../types/common';
import {BoundingBox} from './GraphicPrimitives/Shapes';

class CanvasContext2D {
	private contextRespectivePositionBackup = false;
	private boundingBox: BoundingBox;
	private halfWidth: number;
	private halfHeight: number;

	constructor(
        private ctx: CanvasRenderingContext2D,
        public bgColor: string,
        private width: number,
        private height: number,
        private contextRespectivePosition: boolean = false
	) {
		this.SetSize(width, height);
	}

	set Height(val: number) {
		this.height = val;
		this.halfHeight = val / 2;
		this.GenerateBoundingBox();

	}

	set Width(val: number) {
		this.width = val;
		this.halfWidth = val / 2;
		this.GenerateBoundingBox();
	}

	SetSize(width: number, height?: number) {
		this.Width = width;
		if(height) this.Height = height;
		this.GenerateBoundingBox();
	}

	private GenerateBoundingBox() {
		const p = this.Position;
		this.boundingBox = new BoundingBox(
			new Point(p.x, p.y),
			new Point(p.x + this.width, p.y + this.height), new Point());
	}

	get TrueBoundingBox() {
		const p = this.Position;
		return new BoundingBox(
			new Point(- p.x, -p.y),
			new Point(p.x, p.y), new Point());
	}


	SetOptions(opts: CtxOptions): CanvasContext2D {
		this.Save();
		for(const key of Object.keys(opts)) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line
			this.ctx[key] = opts[key];
		}
		return this;
	}

	ContextRespectivePosition(val: boolean): CanvasContext2D {
		this.contextRespectivePosition = val;
		return this;
	}

	Clear(): CanvasContext2D {
		const point = this.boundingBox.from;
		const width = this.boundingBox.Width;
		const height = this.boundingBox.Height;

		this.ClearRect(point.x, point.y, width, height);
		return this;
	}

	ClearRect(x: number, y: number, w: number, h: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.clearRect(x - initialPos.x, y - initialPos.y, w, h);
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
		this.ctx.setLineDash(lineDash);
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

	Font(val: string): CanvasContext2D {
		this.ctx.font = val;
		return this;
	}

	Reset(): CanvasContext2D {
		this.ctx.setTransform(new DOMMatrix());
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
		this.contextRespectivePositionBackup = this.contextRespectivePosition;
		this.ctx.save();
		return this;
	}

	Restore(): CanvasContext2D {
		this.contextRespectivePosition = this.contextRespectivePositionBackup;
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
		const point = this.boundingBox.from;
		const width = this.boundingBox.Width;
		const height = this.boundingBox.Height;
		const { x = 0, y = 0 } = offset || {};
		return this
			.Save()
			.ContextRespectivePosition(true)
			.BeginPath()
			.FillStyle(this.bgColor)
			.Rect(point.x + x, point.y + y, width + x, height + y)
			.Fill()
			.ClosePath()
			.Restore();
	}

	Draw(any: IGraphicPrimitive, offsetX = 0, offsetY = 0) {
		const { type, options, dash } = any;
		this.SetOptions(options)
			.LineDash(dash)
			.BeginPath();
		if(type === PrimitiveType.Circle) return this.DrawCircle(any as CirclePrimitive,offsetX, offsetY, 0);
		if(type === PrimitiveType.Polygon) return this.DrawLines(any as PolygonPrimitive, offsetX, offsetY);
		if(type === PrimitiveType.Line) return this.DrawLine(any as LinePrimitive, offsetX, offsetY);
		if(type === PrimitiveType.Rect) return this.DrawRect(any as RectPrimitive, offsetX, offsetY, 0);
	}

	DrawLine(line: LinePrimitive, offsetX: number, offsetY: number): CanvasContext2D {
		const { shape: { from, to } } = line;
		return this
			.MoveTo(from.x + offsetX, from.y + offsetY)
			.LineTo(to.x + offsetX, to.y + offsetY)
			.Stroke()
			.ClosePath()
			.Restore();
	}

	DrawLines(lines: PolygonPrimitive, offsetX: number, offsetY: number) {
		for(const line of lines.shape.Segments) {
			const { from, to } = line;
			this
				.MoveTo(from.x + offsetX, from.y + offsetY)
				.LineTo(to.x + offsetX, to.y + offsetY);
		}
		this.Stroke().ClosePath().Restore();
	}

	DrawRect(rect: RectPrimitive, offsetX: number, offsetY: number, type = 0) {
		const { shape: {from, to} } = rect;
		this
			.Rect(from.x + offsetX, from.y + offsetY, to.x + offsetX, to.y + offsetY);
		if(type === 0) {
			this.Fill();
		} else {
			this.Stroke();
		}
		this.ClosePath().Restore();
	}

	DrawCircle(circle: CirclePrimitive, offsetX: number, offsetY: number, type = 0) {
		const { shape: { center, radius } } = circle;
		this.Arc(center.x + radius + offsetX, center.y + radius + offsetY, radius);
		if(type === 0) {
			this.Fill();
		} else {
			this.Stroke();
		}
		return this.ClosePath().Restore();
	}

	FillText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.fillText(text, x - initialPos.x, y - initialPos.y, maxWidth);
		return this;
	}

	StrokeText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.strokeText(text, x - initialPos.x, y - initialPos.y, maxWidth);
		return this;
	}

	FillRect(x: number, y: number, w: number, h: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.fillRect(x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}

	StrokeRect(x: number, y: number, w: number, h: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.strokeRect(x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}

	Rect(x: number, y: number, w: number, h: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.rect(x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}

	Arc(x: number, y: number, r: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.arc(x - initialPos.x, y - initialPos.y, r, 0, 2 * Math.PI);
		return this;
	}

	DrawImage(imageData: CanvasImageSource, x: number, y: number, w: number, h: number): CanvasContext2D {
		const initialPos = this.contextRespectivePosition ? this.Position : new Point();
		this.ctx.drawImage(imageData, x - initialPos.x, y - initialPos.y, w, h);
		return this;
	}
}

export default CanvasContext2D;
