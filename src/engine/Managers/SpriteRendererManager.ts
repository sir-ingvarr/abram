import type {Graphic, IContextOpts} from './SpriteRenderer';
import SpriteRenderer, {SpriteRendererWorkerActions} from './SpriteRenderer';
import Sprite from '../Modules/Sprite';
import CanvasContext2D from '../Canvas/Context2d';
import Canvas from '../Canvas/Canvas';
import {Point} from '../Classes';

class SpriteRendererManager {
	private static instance: SpriteRendererManager;

	private readonly workerMode: boolean;
	private context?: CanvasContext2D;
	private worker?: Worker;

	private constructor(workerMode: boolean, ctxOpts: IContextOpts, canvas: Canvas<OffscreenCanvas>) {
		this.workerMode = workerMode;
		if(this.workerMode) {
			this.worker = new Worker(new URL('./SpriteRenderer.ts', `file://${__filename}`));
			this.worker.postMessage({canvas: canvas.OffscreenCanvas}, [canvas.OffscreenCanvas]);
		} else {
			this.context = canvas.GetOrCreateContext('2d');
			SpriteRenderer.GetInstance(this.context, ctxOpts.debug);
		}
	}

	LoadImage(imageId: string) {
		if(global.location.protocol !== 'file:' && this.workerMode) {
			this.PostWorkerMessage(SpriteRendererWorkerActions.RegisterImage, { ImageId: imageId });
			return;
		}
		return SpriteRenderer.GetInstance(this.context).LoadImage(imageId);
	}

	public static GetInstance(workerMode?: boolean, ctxOpts?: IContextOpts, canvas?: Canvas<OffscreenCanvas>) {
		if(!SpriteRendererManager.instance) {
			if (workerMode === undefined || !ctxOpts || !canvas) throw 'no instance of SpriteRendererManager. required params are missing';
			SpriteRendererManager.instance = new SpriteRendererManager(workerMode, ctxOpts, canvas);
		}
		return SpriteRendererManager.instance;
	}

	public AddToRenderQueue(graphic: Graphic) {
		// if(this.workerMode) {
		const prepared: IContextOpts = {
			Width: graphic.Width,
			Height: graphic.Height,
			layer: graphic.layer,
			contentType: graphic instanceof Sprite ? 0 : 1,
			parent: {
				LocalPosition: graphic.parent.LocalPosition,
				LocalRotation: graphic.parent.LocalRotation,
				WorldPosition: graphic.parent.WorldPosition,
				Scale: graphic.parent.Scale,
				anchors: graphic.parent.anchors,
				Parent: graphic.parent.Parent ? { LocalRotation: graphic.parent.Parent?.LocalRotation } : null,
			},
			Position: this.context?.Position,
		};
		if(graphic instanceof Sprite) {
			prepared.ImageId = graphic.ImageId;
		} else {
			prepared.shape = graphic.shape;
			prepared.options = graphic.options;
			prepared.type = graphic.type;
			prepared.dash = graphic.dash;
			prepared.drawMethod = graphic.drawMethod;
		}
		if(this.workerMode)this.PostWorkerMessage(SpriteRendererWorkerActions.Add, prepared);
		else SpriteRenderer.GetInstance(this.context).AddToRenderQueue(prepared);
	}

	public SetCameraPosition(x: number, y: number) {
		if(this.workerMode) this.worker?.postMessage({ cameraPos: {x, y} });
		else SpriteRenderer.GetInstance(this.context).SetContextOpts({Position: new Point(x, y)});
	}

	public DrawCallsFinished() {
		if(this.workerMode)	this.PostWorkerMessage(SpriteRendererWorkerActions.DrawCallFinished, {});
		else SpriteRenderer.GetInstance(this.context).DrawCallsFinished();
	}

	private PostWorkerMessage(action: SpriteRendererWorkerActions, params: Partial<IContextOpts>) {
		this.worker?.postMessage({ action, params });
	}

}

export default SpriteRendererManager;