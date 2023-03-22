import CanvasContext2D from './Context2d';
import {RGBAColor} from '../Classes';
import {CanvasContext2DAttributes} from '../../types/common';

export type CanvasConstructorParams = {
    width: number,
    height: number,
    canvasContextAttributes?: CanvasContext2DAttributes,
    canvas?: HTMLCanvasElement,
    context2d?: CanvasContext2D,
    bgColor?: RGBAColor,
}

class Canvas {
	private canvas: HTMLCanvasElement;
	private context2D: CanvasContext2D;
	private width: number;
	private height: number;

	constructor(props: CanvasConstructorParams) {
		const { width, height, canvas, context2d, bgColor = new RGBAColor(), canvasContextAttributes } = props;
		if(canvas) {
			this.canvas = canvas;
			this.context2D = new CanvasContext2D(
                this.canvas.getContext('2d', canvasContextAttributes) as CanvasRenderingContext2D,
                bgColor.ToHex(), width, height
			);
		} else if(context2d) {
			this.context2D = context2d;
			this.context2D.BgColor = bgColor;
		}
		this.width = width;
		this.height = height;
	}

	get Context2D(): CanvasContext2D {
		return this.context2D;
	}

	get CanvasElement(): HTMLCanvasElement {
		return this.canvas;
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
