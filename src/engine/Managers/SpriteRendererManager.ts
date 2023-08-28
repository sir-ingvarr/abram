import type {Graphic} from './SpriteRenderer';
import SpriteRenderer from './SpriteRenderer';
import CanvasContext2D from '../Canvas/Context2d';
import Canvas from '../Canvas/Canvas';
import {ICoordinates} from '../../types/common';

class SpriteRendererManager {
	private static instance: SpriteRendererManager;
	private spriteRenderer: SpriteRenderer;
	private context?: CanvasContext2D;

	private constructor(canvas: Canvas, debug?: boolean) {
		this.context = canvas.Context2D;
		this.spriteRenderer = SpriteRenderer.GetInstance(this.context, debug);
	}

	LoadImage(imageId: string) {
		return this.spriteRenderer.LoadImage(imageId);
	}

	public static GetInstance(canvas?: Canvas, debug?: boolean) {
		if(!SpriteRendererManager.instance) {
			if (!canvas) throw 'no instance of SpriteRendererManager. required params are missing';
			SpriteRendererManager.instance = new SpriteRendererManager(canvas, debug);
		}
		return SpriteRendererManager.instance;
	}

	public AddToRenderQueue(graphic: Graphic) {
		// const prepared: IContextOpts = {
		// 	Width: graphic.Width,
		// 	Height: graphic.Height,
		// 	layer: graphic.layer,
		// 	contentType,
		// 	parent: {
		// 		LocalPosition: graphic.parent.LocalPosition,
		// 		LocalRotation: graphic.parent.LocalRotation,
		// 		WorldPosition: graphic.parent.WorldPosition,
		// 		Scale: graphic.parent.Scale,
		// 		anchors: graphic.parent.anchors,
		// 		Parent: graphic.parent.Parent,
		// 	}
		// };
		// if(graphic instanceof Sprite) {
		// 	prepared.ImageId = graphic.ImageId;
		// } else {
		// 	prepared.shape = graphic.shape;
		// 	prepared.options = graphic.options;
		// 	prepared.type = graphic.type;
		// 	prepared.dash = graphic.dash;
		// 	prepared.drawMethod = graphic.drawMethod;
		// }
		this.spriteRenderer.AddToRenderQueue(graphic);
	}

	get Context() {
		return this.context;
	}

	public SetCameraPosition(position: ICoordinates) {
		this.spriteRenderer.SetContextOpts({Position: position});
	}

	public DrawCallsFinished() {
		this.spriteRenderer.Render();
	}

}

export default SpriteRendererManager;