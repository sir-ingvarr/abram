import UIElement, {UIElementParams} from './UIElement';
import {IUIRenderable} from '../Managers/SpriteRenderer';
import {RGBAColor} from '../Classes';

export type UIRectParams = UIElementParams & {
	width?: number;
	height?: number;
	color?: RGBAColor;
	fill?: boolean;
}

class UIRect extends UIElement {
	public width: number;
	public height: number;
	public color: RGBAColor;
	public fill: boolean;

	constructor(params: UIRectParams) {
		super(params);
		this.width = params.width ?? 100;
		this.height = params.height ?? 100;
		this.color = params.color ?? new RGBAColor(255, 255, 255);
		this.fill = params.fill !== false;
	}

	protected createRenderable(): IUIRenderable {
		const pos = this.transform.LocalPosition;
		const scale = this.transform.LocalScaleMutable;
		const w = this.width;
		const h = this.height;
		const color = this.color.ToHex();
		const fill = this.fill;

		return {
			layer: this.uiLayer,
			Render(ctx: CanvasRenderingContext2D) {
				ctx.translate(pos.x, pos.y);
				ctx.scale(scale.x, scale.y);
				if(fill) {
					ctx.fillStyle = color;
					ctx.fillRect(0, 0, w, h);
				} else {
					ctx.strokeStyle = color;
					ctx.strokeRect(0, 0, w, h);
				}
			}
		};
	}
}

export default UIRect;
