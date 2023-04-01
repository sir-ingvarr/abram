import CanvasContext2D from '../Canvas/Context2d';
import {Point, RGBAColor} from '../Classes';
import Sprite from '../Modules/Sprite';
import {
	GraphicPrimitive,
	IGraphicPrimitive,
	PrimitiveType,
	ShapeDrawMethod,
} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import Canvas from '../Canvas/Canvas';
import {ICoordinates, Nullable} from '../../types/common';
import {CtxOptions} from '../../types/GraphicPrimitives';

export type Graphic = Sprite | IGraphicPrimitive<any>

export enum SpriteRendererWorkerActions {
	Add,
	DrawCallFinished,
	Instantiate,
	ContextUpdated,
	RegisterImage,
}

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
	image?: ImageBitmap,
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

	private readonly layerCanvases: Array<[Canvas<OffscreenCanvas>, CanvasContext2D<OffscreenCanvas>]>;
	private readonly mainCanvasContext: CanvasContext2D;

	private constructor(context2D: CanvasContext2D<OffscreenCanvas>, private debug?: boolean) {
		this.imageStorage = new Map<string, ImageBitmap>();
		this.mainCanvasContext = context2D;
		SpriteRenderer.instance = this;
		this.layerCanvases = [];
	}

	public static GetInstance(context?: CanvasContext2D, debug?: boolean): SpriteRenderer {
		if(!SpriteRenderer.instance) {
			if(!context) throw `no instance of ${this.constructor.name} was found. cannot create a new one without CanvasContext2D`;
			SpriteRenderer.instance = new SpriteRenderer(context, debug);
		}
		return SpriteRenderer.instance;
	}

	private CreateNewLayerCanvas(layer?: number): Canvas<OffscreenCanvas> {
		const width = this.mainCanvasContext.Width;
		const height = this.mainCanvasContext.Height;
		const canvas = new Canvas({canvas: new OffscreenCanvas(width, height), width, height, type: '2d', bgColor: RGBAColor.Transparent() });
		if(layer) this.layerCanvases[layer] = [canvas, canvas.Context2D];
		return canvas;
	}

	public SetContextOpts(opts: Partial<IContextOpts>) {
		if(opts.Height) this.mainCanvasContext.Height = opts.Height;
		if(opts.Width) this.mainCanvasContext.Width = opts.Width;
		if(opts.Position) this.mainCanvasContext.SetPosition(opts.Position.x, opts.Position.y);
		if(opts.debug) this.debug = opts.debug;
	}

	public AddToRenderQueue(graphic: IContextOpts) {
		const { layer = 1 } = graphic;
		if(!this.layerCanvases[layer]) this.CreateNewLayerCanvas(layer);
		const canvasElements = this.layerCanvases[layer];
		this.RenderElement(Object.assign(graphic, { image: this.ReadImage(graphic.ImageId || '') }), canvasElements[1]);
	}

	async LoadImage(imageId: string) {
		if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
			if(this.HasImage(imageId)) return;
			const response = await fetch(imageId);
			const fileBlob = await response.blob();
			this.RegisterImage(imageId, await createImageBitmap(fileBlob));
		}
	}

	private RegisterImage(imageId: string, bitmap: ImageBitmap) {
		this.imageStorage.set(imageId, bitmap);
		console.log(imageId, ' registered');
	}

	ReadImage(imageId: string) {
		return this.imageStorage.get(imageId);
	}

	HasImage(imageId: string) {
		return this.imageStorage.has(imageId);
	}

	DrawCallsFinished() {
		this.Render();
	}

	private RenderElement(graphic: IContextOpts, context: CanvasContext2D<OffscreenCanvas>) {
		if(!graphic.parent) return;
		const {
			parent: {
				WorldPosition: worldPosition,
				Scale: scale,
				LocalPosition: localPosition,
				LocalRotation: localRotation,
				anchors,
				Parent: parent,
			},
			Position: position,
		} = graphic;

		const width = graphic.Width;
		const height = graphic.Height;


		context
			.Save()
			.ContextRespectivePosition(false);
		if(position) {
			context.SetPosition(position.x, position.y);
		}
		const anchoredX = anchors.x * width;
		const anchoredY = anchors.y * height;
		if(graphic.contentType === 0) {
			if (!graphic.ImageId || !this.HasImage(graphic.ImageId)) return;
		}
		context
			.Translate(worldPosition.x, worldPosition.y)
			.SetScale(scale.x, scale.y);

		if(parent) context
			.Translate(-localPosition.x, -localPosition.y)
			.Rotate(parent.LocalRotation)
			.Translate(localPosition.x, localPosition.y);

		context
			.Rotate(localRotation)
			.Translate(-anchoredX, -anchoredY);

		if(graphic.contentType === 0) {
			if(graphic.ImageId) {
				context.DrawImage(this.ReadImage(graphic.ImageId) as ImageBitmap, 0, 0, width, height);
			}
		} else {
			context.Draw(graphic as GraphicPrimitive<any>);
		}

		if(this.debug)
			context
				.StrokeStyle(new RGBAColor(0, 120).ToHex())
				.StrokeRect(anchoredX, anchoredY, 1, 1)
				.StrokeRect(0, 0, width, height);

		context.Restore();
	}

	private Render() {
		this.mainCanvasContext
			.Reset()
			.ContextRespectivePosition(true)
			.Clear();
		for(const elements of this.layerCanvases) {
			if(!elements) continue;
			const canvas = elements[0];
			const image = canvas.OffscreenCanvas.transferToImageBitmap();
			this.mainCanvasContext
				.DrawImage(image, 0, 0, this.mainCanvasContext.Width, this.mainCanvasContext.Height);
			//.Restore();
			canvas.Context2D
				.Reset()
				.ContextRespectivePosition(true)
				.Clear();
		}
		// if(!this.onFrameReady) return;
		// this.onFrameReady(this.mainCanvas.CanvasElement.transferToImageBitmap());
	}
}

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
	let renderer: SpriteRenderer;
	// const onFrameReady = function (imageBitmap: ImageBitmap) {
	// 	self.postMessage({imageBitmap}, [imageBitmap]);
	// };

	self.addEventListener('message', async function(e) {
		const { action, params, canvas, cameraPos } = e.data;

		if(action === SpriteRendererWorkerActions.RegisterImage) {
			renderer?.LoadImage(params.ImageId);
		}
		if(action === SpriteRendererWorkerActions.Add) {
			if(params.contentType === 0) {
				return renderer?.AddToRenderQueue(new Sprite({
					...params,
					ImageId: params.ImageId,
				}));
			}
			return renderer?.AddToRenderQueue(params);
		}
		if(action === SpriteRendererWorkerActions.DrawCallFinished) return renderer?.DrawCallsFinished();
		if(canvas) {
			renderer = SpriteRenderer.GetInstance(
				new CanvasContext2D<OffscreenCanvas>(canvas.getContext('2d'), '#000000', 1280, 800),
				false
			);
		}
		if(action === SpriteRendererWorkerActions.ContextUpdated) return renderer?.SetContextOpts(params);
		if(cameraPos) return renderer?.SetContextOpts({ Position: new Point(cameraPos.x, cameraPos.y) });
	});


}

export default SpriteRenderer;