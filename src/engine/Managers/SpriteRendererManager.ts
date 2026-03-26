import type {IRenderable} from './SpriteRenderer';
import SpriteRenderer from './SpriteRenderer';
import CanvasContext2D from '../Canvas/Context2d';
import Canvas from '../Canvas/Canvas';
import {ICoordinates} from '../../types/common';

class SpriteRendererManager {
	private static instance: SpriteRendererManager;
	private spriteRenderer: SpriteRenderer;
	private readonly context?: CanvasContext2D;
	private constructor(canvas: Canvas, debug?: boolean) {
		this.context = canvas.Context2D;
		this.spriteRenderer = SpriteRenderer.GetInstance(this.context, debug);
	}

	LoadImage(imageId: string) {
		return this.spriteRenderer.LoadImage(imageId);
	}

	public static GetInstance(canvas?: Canvas, debug?: boolean) {
		if(!SpriteRendererManager.instance) {
			if (!canvas) throw new Error('no instance of SpriteRendererManager. required params are missing');
			SpriteRendererManager.instance = new SpriteRendererManager(canvas, debug);
		}
		return SpriteRendererManager.instance;
	}

	public AddToRenderQueue(graphic: IRenderable) {
		this.spriteRenderer.AddToRenderQueue(graphic);
	}

	get Context() {
		return this.context;
	}

	public SetCamera(position: ICoordinates, scale: ICoordinates) {
		this.spriteRenderer.SetContextOpts({Position: position, Scale: scale});
	}

	public DrawCallsFinished() {
		this.spriteRenderer.Render();
	}

}

export default SpriteRendererManager;