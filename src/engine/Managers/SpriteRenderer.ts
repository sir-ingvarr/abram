import CanvasContext2D from '../Canvas/Context2d';
import {RGBAColor, Stack} from '../Classes';
import Sprite from '../Modules/Sprite';
import {IStack} from '../../types/Iterators';
import {IGraphicPrimitive} from '../Canvas/GraphicPrimitives/GraphicPrimitive';

type Graphic = Sprite | IGraphicPrimitive<any>

class SpriteRenderer {
	private context: CanvasContext2D;
	private renderingStackList: Array<IStack<Graphic>> = [];
	private static instance: SpriteRenderer;

	constructor(context: CanvasContext2D, 	private debug?: boolean) {
		this.context = context;
		SpriteRenderer.instance = this;
	}

	public static GetInstance(context?: CanvasContext2D, debug?: boolean): SpriteRenderer {
		if(!SpriteRenderer.instance) {
			if(!context) throw `no instance of ${this.constructor.name} was found. cannot create a new one without CanvasContext2D`;
			return new SpriteRenderer(context, debug);
		}
		return SpriteRenderer.instance;
	}

	public AddToRenderQueue(graphic: Graphic) {
		const { layer } = graphic;
		const layerStack = this.renderingStackList[layer];
		if(!layerStack) {
			this.renderingStackList[layer] = new Stack<Graphic>({ data: [graphic] });
			return;
		}
		this.renderingStackList[layer].Push(graphic);
	}

	private RenderElement(graphic: Graphic) {
		const {
			parent: {
				WorldPosition: worldPosition,
				Scale: scale,
				Rotation: rotation,
				anchors
			}
		} = graphic;

		const {x, y} = worldPosition;
		const dir = scale.ToBinary();

		const width = graphic.Width;
		const height = graphic.Height;

		this.context
			.Save()
			.ContextRespectivePosition(false);

		const anchoredX = anchors.x * width;
		const anchoredY = anchors.y * height;
		if(graphic instanceof Sprite) {
			if (!graphic.image.Data) return;
		}
		this.context
			.Translate(x, y)
			.Rotate(rotation * dir.x * dir.y)
			.SetScale(scale.x, scale.y)
			.Translate(-anchoredX, -anchoredY);

		if(graphic instanceof Sprite) {
			this.context.DrawImage(graphic.image.Data, 0, 0, width, height);
		} else {
			this.context.Draw(graphic);
		}

		if(this.debug)
			this.context
				.StrokeStyle(new RGBAColor(0, 120).ToHex())
				.StrokeRect(anchoredX, anchoredY, 1, 1)
				.StrokeRect(0, 0, width, height);

		this.context.Restore();
	}

	public Render() {
		for(let i = 0; i < this.renderingStackList.length; i++) {
			const layerStack = this.renderingStackList[i];
			if(!layerStack) continue;
			while(layerStack.Count) {
				const sprite = layerStack.Pop();
				this.RenderElement(sprite);
			}
		}
	}
}

export default SpriteRenderer;