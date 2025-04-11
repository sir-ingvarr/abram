import CanvasContext2D from './Context2d';
import {RGBAColor} from '../Classes';
import {CanvasContext2DAttributes} from '../../types/common';

export type ContextType = '2d' | 'bitmaprenderer';

export type CanvasConstructorParams = {
	width: number,
	height: number,
	canvas?: HTMLCanvasElement,
	bgColor?: RGBAColor,
	canvasContextAttributes?: CanvasContext2DAttributes,
}

class Canvas {
	private readonly canvas: HTMLCanvasElement;
	private readonly context2D: CanvasContext2D;
	private width: number;
	private height: number;
	private bgColor: RGBAColor;


	constructor(props: CanvasConstructorParams) {
		const { width, height, canvas, bgColor = new RGBAColor() } = props;
		this.bgColor = bgColor;
		if(!canvas) throw 'canvas is required';
		this.canvas = canvas;
		this.canvas.width = width;
		this.canvas.height = height;

		this.width = width;
		this.height = height;
		this.context2D = new CanvasContext2D(
			this.canvas.getContext('2d') as CanvasRenderingContext2D,
			this.bgColor.ToHex(), this.width, this.height
		);
	}


	get Context2D() {
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