import CanvasContext2D, {AnyCanvas, CanvasRenderingCtx2D} from './Context2d';
import {RGBAColor} from '../Classes';
import {CanvasContext2DAttributes} from '../../types/common';

export type ContextType = '2d' | 'bitmaprenderer';

export type CanvasConstructorParams<T extends AnyCanvas> = {
    width: number,
    height: number,
    canvasContextAttributes?: CanvasContext2DAttributes,
    canvas?: T,
	type?: ContextType,
    context2d?: CanvasContext2D<T>,
    bgColor?: RGBAColor,
	transferToOffscreen?: boolean,
	allowGetContext?: boolean,
}

class Canvas<T extends AnyCanvas> {
	private canvas: HTMLCanvasElement;
	private offscreenCanvas: OffscreenCanvas;
	private transferToOffscreen: boolean;
	private context2D: CanvasContext2D<T>;
	private width: number;
	private height: number;

	constructor(props: CanvasConstructorParams<T>) {
		const { width, height, canvas, bgColor = new RGBAColor(), type = '2d', transferToOffscreen = true, allowGetContext = true } = props;
		this.transferToOffscreen = transferToOffscreen;
		if(canvas) {
			if (canvas instanceof OffscreenCanvas) {
				this.offscreenCanvas = canvas;
				this.offscreenCanvas.width = width;
				this.offscreenCanvas.height = height;
			} else {
				this.canvas = canvas;
				if (transferToOffscreen) {
					this.offscreenCanvas = canvas.transferControlToOffscreen();
					this.offscreenCanvas.width = width;
					this.offscreenCanvas.height = height;
				} else {
					this.canvas.width = width;
					this.canvas.height = height;
				}
			}
			if(allowGetContext)
				this.context2D = new CanvasContext2D<T>(
					(this.transferToOffscreen ? this.offscreenCanvas.getContext(type) : this.canvas.getContext(type)) as CanvasRenderingCtx2D<T>,
					typeof bgColor === 'string' ? bgColor : bgColor.ToHex(), width, height
				);
		}
		this.width = width;
		this.height = height;
	}

	get Context2D(): CanvasContext2D<T> {
		return this.context2D;
	}

	GetOrCreateContext(type: ContextType) {
		if(!this.context2D) this.context2D =
			new CanvasContext2D<T>(
				(this.transferToOffscreen ? this.offscreenCanvas.getContext(type) : this.canvas.getContext(type)) as CanvasRenderingCtx2D<T>,
				'#000000', 1280, 800
			);
		return this.Context2D;
	}

	get CanvasElement(): HTMLCanvasElement {
		return this.canvas;
	}

	get OffscreenCanvas(): OffscreenCanvas {
		return this.offscreenCanvas;
	}

	get Width(): number {
		return this.width;
	}

	set Width(val: number) {
		this.width = val;
		this.context2D.Width = val;
	}

	get Height(): number {
		return this.height;
	}

	set Height(val: number) {
		this.height = val;
		this.context2D.Height = val;
	}

	SetSize(width: number, height?: number) {
		this.width = width;
		if(height) this.height = height;
		this.context2D.SetSize(width, height);
	}

}

export default Canvas;
