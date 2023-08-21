import CanvasContext2D from '../Canvas/Context2d';
import Sprite from '../Modules/Sprite';
import {
	GraphicPrimitive,
	IGraphicPrimitive,
	PrimitiveType,
	ShapeDrawMethod,
} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import {ICoordinates, Nullable} from '../../types/common';
import {CtxOptions} from '../../types/GraphicPrimitives';
import ImageWrapper from '../Modules/ImageWrapper';
import {RGBAColor, Stack} from '../Classes';
import {IStack} from '../../types/Iterators';

export type Graphic = Sprite | IGraphicPrimitive<any>

export interface IContextOpts {
	Width: number;
	Height: number;
	layer: number,
	contentType: 0 | 1,
	parent?: {
		WorldPosition: ICoordinates,
		Scale: ICoordinates,
		LocalPosition: ICoordinates,
		LocalRotation: number,
		anchors: { x: number, y: number },
		Parent: Nullable<{ LocalRotation: number }>,
	},
	shape?: IGraphicPrimitive<any>,
	ImageId?: string,
	image?: ImageWrapper,
	debug?: boolean;
	Position?: ICoordinates,
	options?: CtxOptions,
	type?: PrimitiveType,
	dash?: Array<number>,
	drawMethod?: ShapeDrawMethod,
}

class SpriteRenderer {
	private static instance: SpriteRenderer;
	private readonly imageStorage: Map<string, ImageBitmap> = new Map<string, ImageBitmap>();
	private contextPosition: ICoordinates;
	private readonly debugStrokeColor: string;

	private renderingStackList: Array<IStack<IContextOpts>> = [];
	private readonly mainCanvasContext: CanvasContext2D;
	private loadList: Set<string>;

	private constructor(context2D: CanvasContext2D, private debug?: boolean) {
		this.imageStorage = new Map<string, ImageBitmap>();
		this.mainCanvasContext = context2D;
		SpriteRenderer.instance = this;
		this.loadList = new Set();
		this.debugStrokeColor = new RGBAColor(0, 120).ToHex();
	}

	public static GetInstance(context?: CanvasContext2D, debug?: boolean): SpriteRenderer {
		if(!SpriteRenderer.instance) {
			if(!context) throw `no instance of ${this.constructor.name} was found. cannot create a new one without CanvasContext2D`;
			SpriteRenderer.instance = new SpriteRenderer(context, debug);
		}
		return SpriteRenderer.instance;
	}

	public AddToRenderQueue(graphic: IContextOpts) {
		const { layer } = graphic;
		const layerStack = this.renderingStackList[layer];
		if(!layerStack) {
			this.renderingStackList[layer] = new Stack<IContextOpts>({ data: [graphic] });
			return;
		}
		this.renderingStackList[layer].Push(graphic);
	}

	public SetContextOpts(opts: Partial<IContextOpts>) {
		if(opts.Height) this.mainCanvasContext.Height = opts.Height;
		if(opts.Width) this.mainCanvasContext.Width = opts.Width;
		if(opts.Position) this.contextPosition = opts.Position;
		if(opts.debug) this.debug = opts.debug;
	}

	async LoadImage(imageId: string) {
		if(this.HasImage(imageId) || this.loadList.has(imageId)) return;
		const image = new Image();
		image.addEventListener('load', async () => {
			this.RegisterImage(imageId, await createImageBitmap(image));
			this.loadList.delete(imageId);
		});
		this.loadList.add(imageId);
		image.src = imageId;
	}

	private RegisterImage(imageId: string, bitmap: ImageBitmap) {
		this.imageStorage.set(imageId, bitmap);
		console.info(imageId, ' registered');
	}

	GetImage(imageId: string) {
		return this.imageStorage.get(imageId);
	}

	HasImage(imageId: string) {
		return this.imageStorage.has(imageId);
	}

	private RenderElement(graphic: IContextOpts) {
		if(!graphic || !graphic.parent) return;
		let image;
		if(graphic.contentType === 0) {
			image = this.GetImage(graphic.ImageId || '-1');
			if(!image) return;
		}

		const {
			parent: {
				WorldPosition: worldPosition,
				Scale: scale,
				LocalPosition: localPosition,
				LocalRotation: localRotation,
				anchors,
				Parent: parent,
			},
		} = graphic;

		const width = graphic.Width;
		const height = graphic.Height;

		const context = this.mainCanvasContext;
		const anchoredX = anchors.x * width;
		const anchoredY = anchors.y * height;

		context
			.SetScale(scale.x, scale.y)
			.SetPosition((worldPosition.x - this.contextPosition.x), (worldPosition.y - this.contextPosition.y));

		if(parent) context
			.Translate(-localPosition.x, -localPosition.y)
			.Rotate(parent.LocalRotation)
			.Translate(localPosition.x, localPosition.y);

		context
			.Rotate(localRotation)
			.Translate(-anchoredX, -anchoredY);

		if(graphic.contentType === 0) {
			if(!image) return;
			context.DrawImage(image, 0, 0, width, height);
		} else {
			context.Draw(graphic as GraphicPrimitive<any>, 0,0);
		}

		if(this.debug)
			context
				.StrokeStyle(this.debugStrokeColor)
				.StrokeRect(anchoredX, anchoredY, 1, 1)
				.StrokeRect(0, 0, width, height);

		context.Reset();
	}

	public Render() {
		this.mainCanvasContext
			.Reset()
			.Clear()
			.DrawBg()
			.ContextRespectivePosition(false)
			.Reset();
		this.mainCanvasContext.Save();
		for (let i = 0; i < this.renderingStackList.length; i++) {
			const layerStack = this.renderingStackList[i];
			if (!layerStack) continue;
			while (layerStack.Count) {
				this.RenderElement(layerStack.Pop());
			}
		}
	}
}

export default SpriteRenderer;