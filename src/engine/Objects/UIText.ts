import UIElement, {UIElementParams} from './UIElement';
import {IUIRenderable} from '../Managers/SpriteRenderer';
import {RGBAColor} from '../Classes';

export type UITextParams = UIElementParams & {
	text?: string;
	font?: string;
	color?: RGBAColor;
	textAlign?: CanvasTextAlign;
	textBaseline?: CanvasTextBaseline;
}

class UIText extends UIElement {
	public text: string;
	public font: string;
	public color: RGBAColor;
	public textAlign: CanvasTextAlign;
	public textBaseline: CanvasTextBaseline;

	constructor(params: UITextParams) {
		super(params);
		this.text = params.text ?? '';
		this.font = params.font ?? '16px monospace';
		this.color = params.color ?? new RGBAColor(255, 255, 255);
		this.textAlign = params.textAlign ?? 'left';
		this.textBaseline = params.textBaseline ?? 'top';
	}

	protected createRenderable(): IUIRenderable {
		const pos = this.transform.LocalPosition;
		const scale = this.transform.LocalScaleMutable;
		const text = this.text;
		const font = this.font;
		const color = this.color.ToHex();
		const textAlign = this.textAlign;
		const textBaseline = this.textBaseline;

		return {
			layer: this.uiLayer,
			Render(ctx: CanvasRenderingContext2D) {
				ctx.translate(pos.x, pos.y);
				ctx.scale(scale.x, scale.y);
				ctx.font = font;
				ctx.fillStyle = color;
				ctx.textAlign = textAlign;
				ctx.textBaseline = textBaseline;
				ctx.fillText(text, 0, 0);
			}
		};
	}
}

export default UIText;
