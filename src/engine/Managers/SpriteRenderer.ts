import CanvasContext2D from '../Canvas/Context2d';
import Sprite from '../Modules/Sprite';
import {
	GraphicPrimitive,
	IGraphicPrimitive,
	PrimitiveType,
	ShapeDrawMethod,
} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import {ICoordinates, IPoint, Nullable} from '../../types/common';
import {CtxOptions} from '../../types/GraphicPrimitives';
import {RGBAColor, Stack, Vector} from '../Classes';
import {IStack} from '../../types/Iterators';
import ImageWrapper from '../Modules/ImageWrapper';

export type Graphic = Sprite | IGraphicPrimitive<any>

export interface IContextOpts {
	Width: number;
	Height: number;
	layer: number,
	disrespectParent?: boolean,
	contentType: 0 | 1,
	parent?: {
		WorldPosition: ICoordinates,
		WorldRotation: number,
		Scale: ICoordinates,
		LocalPosition: ICoordinates,
		LocalRotation: number,
		Anchors: IPoint,
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
	private readonly imageStorage: Map<string, ImageBitmap>;
	private contextPosition: ICoordinates;
	private readonly debugStrokeColor: string;

	private renderingStackList: Array<IStack<IContextOpts>> = [];
	private readonly mainCanvasContext: CanvasContext2D;
	private loadList: Map<string, Promise<string>>;

	private constructor(context2D: CanvasContext2D, private debug?: boolean) {
		this.imageStorage = new Map<string, ImageBitmap>();
		this.mainCanvasContext = context2D;
		SpriteRenderer.instance = this;
		this.loadList = new Map<string, Promise<string>>();
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

	LoadImage(imageId: string) {
		if(this.loadList.has(imageId)) {
			return this.loadList.get(imageId)?.then(() => imageId);
		}
		if(this.HasImage(imageId)) {
			console.info(`Image ${imageId} already loaded`);
			return imageId;
		}
		const image = new Image();
		const loadPromise = new Promise<string>((resolve, reject) => {
			image.addEventListener('load', async () => {
				this.RegisterImage(imageId, await createImageBitmap(image));
				this.loadList.delete(imageId);
				resolve(imageId);
			});
			image.addEventListener('error', reject);
		});
		this.loadList.set(imageId, loadPromise);
		image.src = imageId;
		return loadPromise;
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
		if(!graphic) return;
		const width = graphic.Width;
		const height = graphic.Height;

		const context = this.mainCanvasContext;

		if(!graphic.parent) return;
		const { disrespectParent } = graphic;

		const params = {
			worldPosition: disrespectParent ? Vector.Zero : graphic.parent.WorldPosition,
			scale: disrespectParent ? Vector.One : graphic.parent.Scale,
			localPosition: disrespectParent ? Vector.Zero : graphic.parent.LocalPosition,
			worldRotation: disrespectParent ? 0 : graphic.parent.WorldRotation,
			anchors: disrespectParent ? { x: 0, y: 0 } : graphic.parent.Anchors,
		};

		const {
			worldPosition,
			scale,
			worldRotation,
			anchors,
		} = params;

		const anchoredX = anchors.x * width;
		const anchoredY = anchors.y * height;

		const matrix = new DOMMatrix()
			.translate(worldPosition.x - this.contextPosition.x, worldPosition.y - this.contextPosition.y)
			.scale(scale.x, scale.y)
			.rotate(worldRotation * 180 / Math.PI)
			.translate(-anchoredX, -anchoredY);

		context.SetTransform(matrix);

		if(graphic.contentType === 0) {
			if(!graphic.image?.isReady) return;
			const image = this.GetImage(graphic.ImageId || '-1');
			if(!image) throw new Error(`Image ${graphic.ImageId} not found`);
			context.DrawImage(graphic, image, 0, 0, width, height);
		} else {
			context.Draw(graphic as unknown as GraphicPrimitive<any>, 0,0);
		}

		if(this.debug)
			context
				.LineWidth(1)
				.StrokeStyle(`${this.debugStrokeColor}`)
				.LineDash([])
				.StrokeRect(anchoredX, anchoredY, 1, 1)
				.StrokeRect(0, 0, width, height);
	}

	public Render() {
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