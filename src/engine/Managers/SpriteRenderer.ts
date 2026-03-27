import CanvasContext2D from '../Canvas/Context2d';
import Sprite from '../Modules/Sprite';
import {
	GraphicPrimitive,
	IGraphicPrimitive,
	PrimitiveShape,
	PrimitiveType,
	ShapeDrawMethod,
} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import {ICoordinates} from '../../types/common';
import {CtxOptions} from '../../types/GraphicPrimitives';
import {Stack, Vector} from '../Classes';
import Debug from '../Debug/Debug';
import {IStack} from '../../types/Iterators';
import ImageWrapper from '../Modules/ImageWrapper';
import {ITransform} from '../../types/GameObject';

export type Graphic = Sprite | IGraphicPrimitive<PrimitiveShape>

export interface IRenderable {
	Width: number;
	Height: number;
	layer: number;
	contentType: 0 | 1;
	disrespectParent?: boolean;
	parent?: ITransform;
	ImageId?: string;
	image?: ImageWrapper;
	options?: CtxOptions;
	type?: PrimitiveType;
	dash?: Array<number>;
	drawMethod?: ShapeDrawMethod;
}

export interface IUIRenderable {
	layer: number;
	Render(ctx: CanvasRenderingContext2D): void;
}

export interface IRendererContextSettings {
	Height?: number;
	Width?: number;
	Position?: ICoordinates;
	Scale?: ICoordinates;
	debug?: boolean;
}

class SpriteRenderer {
	private static instance: SpriteRenderer;
	private readonly imageStorage: Map<string, ImageBitmap>;
	private contextPosition: ICoordinates;
	private contextScale: ICoordinates;
	private canvasCenterX: number;
	private canvasCenterY: number;

	private renderingStackList: Array<IStack<IRenderable>> = [];
	private uiRenderingStackList: Array<IStack<IUIRenderable>> = [];
	private readonly mainCanvasContext: CanvasContext2D;
	private loadList: Map<string, Promise<string>>;

	private constructor(context2D: CanvasContext2D, private debug?: boolean) {
		this.imageStorage = new Map<string, ImageBitmap>();
		this.mainCanvasContext = context2D;
		this.contextScale = Vector.One;
		this.canvasCenterX = context2D.Width / 2;
		this.canvasCenterY = context2D.Height / 2;
		SpriteRenderer.instance = this;
		this.loadList = new Map<string, Promise<string>>();
	}

	public static GetInstance(context?: CanvasContext2D, debug?: boolean): SpriteRenderer {
		if(!SpriteRenderer.instance) {
			if(!context) throw new Error('no instance of SpriteRenderer was found. cannot create a new one without CanvasContext2D');
			SpriteRenderer.instance = new SpriteRenderer(context, debug);
		}
		return SpriteRenderer.instance;
	}

	public AddToRenderQueue(graphic: IRenderable) {
		const { layer } = graphic;
		const layerStack = this.renderingStackList[layer];
		if(!layerStack) {
			this.renderingStackList[layer] = new Stack<IRenderable>({ data: [graphic] });
			return;
		}
		this.renderingStackList[layer].Push(graphic);
	}

	public AddToUIRenderQueue(element: IUIRenderable) {
		const { layer } = element;
		const layerStack = this.uiRenderingStackList[layer];
		if(!layerStack) {
			this.uiRenderingStackList[layer] = new Stack<IUIRenderable>({ data: [element] });
			return;
		}
		this.uiRenderingStackList[layer].Push(element);
	}

	get Debug(): boolean {
		return !!this.debug;
	}

	public SetContextOpts(opts: IRendererContextSettings) {
		if(opts.Height) {
			this.mainCanvasContext.Height = opts.Height;
			this.canvasCenterY = opts.Height / 2;
		}
		if(opts.Width) {
			this.mainCanvasContext.Width = opts.Width;
			this.canvasCenterX = opts.Width / 2;
		}
		if(opts.Position) this.contextPosition = opts.Position;
		if(opts.Scale) this.contextScale = opts.Scale;
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

	get Context() {
		return this.mainCanvasContext;
	}

	private resolveParentTransform(graphic: IRenderable, width: number, height: number) {
		const { disrespectParent } = graphic;
		return {
			worldPosition: disrespectParent ? Vector.Zero : graphic.parent!.WorldPosition,
			scale: disrespectParent ? Vector.One : graphic.parent!.Scale,
			worldRotation: disrespectParent ? 0 : graphic.parent!.WorldRotation,
			anchoredX: disrespectParent ? 0 : graphic.parent!.Anchors.x * width,
			anchoredY: disrespectParent ? 0 : graphic.parent!.Anchors.y * height,
		};
	}

	private applyAffineTransform(
		worldPosition: ICoordinates,
		scale: ICoordinates,
		worldRotation: number,
		anchoredX: number,
		anchoredY: number,
	) {
		const camScaleX = this.contextScale.x;
		const camScaleY = this.contextScale.y;
		const centerX = this.canvasCenterX;
		const centerY = this.canvasCenterY;

		const offsetX = worldPosition.x - this.contextPosition.x;
		const offsetY = worldPosition.y - this.contextPosition.y;

		const cos = Math.cos(worldRotation);
		const sin = Math.sin(worldRotation);

		const scaleX = scale.x;
		const scaleY = scale.y;

		const matA = camScaleX * scaleX * cos;
		const matB = camScaleY * scaleY * sin;
		const matC = -camScaleX * scaleX * sin;
		const matD = camScaleY * scaleY * cos;
		const matE = centerX * (1 - camScaleX) + camScaleX * (offsetX + scaleX * (-anchoredX * cos + anchoredY * sin));
		const matF = centerY * (1 - camScaleY) + camScaleY * (offsetY + scaleY * (-anchoredX * sin - anchoredY * cos));

		this.mainCanvasContext.SetTransformRaw(matA, matB, matC, matD, matE, matF);
	}

	private drawGraphicContent(graphic: IRenderable, width: number, height: number) {
		if(graphic.contentType === 0) {
			if(!graphic.image?.isReady) return;
			const image = this.GetImage(graphic.ImageId || '-1');
			if(!image) throw new Error(`Image ${graphic.ImageId} not found`);
			const contextRespectivePosition = graphic.options?.contextRespectivePosition || false;
			const initialPos = contextRespectivePosition ? this.mainCanvasContext.Position : {x: 0, y: 0};
			this.mainCanvasContext.CTX.drawImage(image, initialPos.x, initialPos.y, width, height);
		} else {
			this.mainCanvasContext.Draw(graphic as unknown as GraphicPrimitive<PrimitiveShape>, 0, 0);
		}
	}

	private drawDebugOverlay(anchoredX: number, anchoredY: number, width: number, height: number) {
		if(!this.debug) return;
		this.mainCanvasContext
			.LineWidth(1)
			.LineDash([])
			.StrokeStyle(Debug.Colors.anchorPoint.ToHex())
			.StrokeRect(anchoredX, anchoredY, 1, 1)
			.StrokeStyle(Debug.Colors.spriteBounds.ToHex())
			.StrokeRect(0, 0, width, height);
	}

	private RenderElement(graphic: IRenderable) {
		if(!graphic || !graphic.parent) return;

		const width = graphic.Width;
		const height = graphic.Height;

		const { worldPosition, scale, worldRotation, anchoredX, anchoredY } =
			this.resolveParentTransform(graphic, width, height);

		this.applyAffineTransform(worldPosition, scale, worldRotation, anchoredX, anchoredY);
		this.drawGraphicContent(graphic, width, height);
		this.drawDebugOverlay(anchoredX, anchoredY, width, height);
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

	public ClearQueues() {
		this.renderingStackList = [];
		this.uiRenderingStackList = [];
	}

	public RenderUI() {
		const ctx = this.mainCanvasContext.CTX;
		for (let i = 0; i < this.uiRenderingStackList.length; i++) {
			const layerStack = this.uiRenderingStackList[i];
			if (!layerStack) continue;
			while (layerStack.Count) {
				ctx.save();
				ctx.resetTransform();
				layerStack.Pop().Render(ctx);
				ctx.restore();
			}
		}
	}
}

export default SpriteRenderer;
