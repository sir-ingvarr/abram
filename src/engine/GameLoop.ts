import Time from './Globals/Time';
import {GameObjectManager} from './Managers/GameObjectManager';
import CollisionsManager from './Managers/CollisionsManager';
import Canvas from './Canvas/Canvas';
import {IGameObject, IGameObjectConstructable, ITransform} from '../types/GameObject';
import {FpsProvider} from './Debug/FpsProvider';
import {BasicObjectsConstructorParams} from './Objects/BasicObject';
import {AnyFunc} from '../types/common';
import GameObject from './Objects/GameObject';
import {Queue} from './Classes';
import CanvasContext2D, {AnyCanvas} from './Canvas/Context2d';
import {SpriteRendererManager} from '../index';

type InstantiateOpts = {
	gameObject: IGameObjectConstructable<any>,
	params: any,
	parent?: ITransform,
}

export type GameLoopOptions = {
	canvas?: Canvas<AnyCanvas>,
	offscreenCanvas?: OffscreenCanvas,
	pauseOnBlur?: boolean,
	workerMode?: boolean,
	debug?: boolean,
	targetFps?: number,
	drawFps?: boolean,
	adaptiveFrameDelay?: boolean;
	onFrameReady?: (imageBitmap: ImageBitmap) => void;
}

export type ForWorker = {
	width?: number, height?: number, canvasContextAttributes?: string, bgColor?: string
}
class GameLoop {
	private isPlaying: boolean;
	private prevFrameTime: number;
	private frameDelay: number;
	private targetFps: number;
	private workerMode: boolean;
	private readonly debug: boolean;
	private readonly drawFps: boolean;
	private readonly adaptiveFrameDelay: boolean;
	private gameObjectManager: GameObjectManager;
	private collisionsManager: CollisionsManager;
	private readonly fpsProvider: FpsProvider;
	private readonly canvas?: Canvas<AnyCanvas>;
	static instantiateQueue: Queue<InstantiateOpts & { callOnDone: AnyFunc }> = new Queue<InstantiateOpts & { callOnDone: AnyFunc }>({data: []});

	constructor(
		opts: GameLoopOptions
	) {
		const {
			canvas, debug = false, workerMode = false,
			targetFps = 60, drawFps = false, adaptiveFrameDelay = false
		} = opts;
		this.debug = debug;
		this.canvas = canvas;
		this.drawFps = drawFps;
		this.targetFps = targetFps;
		this.workerMode = workerMode;
		this.adaptiveFrameDelay = adaptiveFrameDelay;
		this.frameDelay = this.targetFps && this.targetFps < 60 ? 1000 / this.targetFps : 0;
		const ctx = this.canvas?.Context2D;
		this.gameObjectManager = new GameObjectManager({ modules: [], context: ctx as CanvasContext2D });
		this.collisionsManager = new CollisionsManager({ modules: [] });

		// if(pauseOnBlur) {
		global.addEventListener('blur', this.Pause.bind(this));
		global.addEventListener('focus', this.Play.bind(this));
		global.addEventListener('focusout', this.Pause.bind(this));
		global.addEventListener('focusin', this.Play.bind(this));

		// }
		this.prevFrameTime = Date.now();
		if(!drawFps) return;
		this.fpsProvider = new FpsProvider({
			name: 'FPSProvider',
			realFpsFramesBuffer: this.targetFps,
			targetFps: this.targetFps,
			frameDelay: this.frameDelay,
			onFrameDelaySet: this.adaptiveFrameDelay ? this.SetFrameDelay.bind(this) : null,
		});
		this.gameObjectManager.RegisterModule(this.fpsProvider);

		this.Play();
	}

	get GameObjectManager() {
		return this.gameObjectManager;
	}

	Play () {
		this.prevFrameTime = Date.now();
		this.isPlaying = true;
		this.Render();
	}

	Pause() {
		this.isPlaying = false;
	}

	Start () {
		this.Play();
		if(!this.debug) return;
		console.log(`target fps set to ${this.targetFps}, targetFrameDelay: ${this.frameDelay}`);
	}

	public static async Instantiate<T extends BasicObjectsConstructorParams>(opts: InstantiateOpts): Promise<T> {
		return new Promise(resolve => {
			GameLoop.instantiateQueue.Push({ ...opts, callOnDone: go => resolve(go) });
		});
	}

	get Canvas() {
		return this.canvas;
	}

	Render () {
		if(!this.isPlaying) return;
		if(!this.canvas) throw 'canvas required to render';
		const now = Date.now();
		if(this.frameDelay && now - this.prevFrameTime < this.frameDelay) {
			requestAnimationFrame(this.Render.bind(this));
			return;
		}
		Time.FrameRendered();
		while(GameLoop.instantiateQueue.Count) {
			const element = GameLoop.instantiateQueue.Shift();
			this.Instantiate(element);
		}

		this.gameObjectManager.Update();
		SpriteRendererManager.GetInstance().DrawCallsFinished();
		this.collisionsManager.Update();
		this.prevFrameTime = Date.now();

		requestAnimationFrame(this.Render.bind(this));

		// this.canvas.Context2D
		// 	.Reset()
		// 	.ContextRespectivePosition(true)
		// 	.Clear()
		// 	.DrawBg();

		if(this.drawFps && !this.workerMode) {
			this.canvas.Context2D
				.ContextRespectivePosition(true)
				.FillStyle('white')
				.FillRect(this.canvas.Width - 100, 0, 100, 40)
				.FillStyle('red')
				.FillText(`frame time: ${Time.deltaTime}`, this.canvas.Width - 90, 15)
				.FillText(`FPS: ${Math.floor(this.fpsProvider.FPS)}`, this.canvas.Width - 90, 30);
		}

		// if(this.onFrameReady) {
		// 	const bitMap = (this.canvas.CanvasElement as OffscreenCanvas).transferToImageBitmap();
		// 	this.onFrameReady(bitMap);
		// }
	}

	public SetFrameDelay(delay: number) {
		this.frameDelay = delay;
		if(!this.debug) return;
		console.info(`new target frame delay set: ${this.frameDelay}`);
	}

	Instantiate<T extends BasicObjectsConstructorParams>(args:{
		gameObject: IGameObjectConstructable<T>,
		params: T, parent?: ITransform, callOnDone?: AnyFunc,
	}): string {
		const gameObjectInstance = new args.gameObject(args.params);
		if(!args.parent) {
			this.AppendGameObject(gameObjectInstance);
		} else {
			if(!(args.parent.gameObject instanceof GameObject)) throw 'unable to instantiate child to non GameObject parent';
			args.parent.gameObject.AppendChild(gameObjectInstance);
		}
		if(args.callOnDone) args.callOnDone(gameObjectInstance);
		return gameObjectInstance.Id;
	}

	AppendGameObject(element: IGameObject) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.gameObjectManager.RegisterModule(element);
	}

	GetGameObjectById(id: string) {
		return this.gameObjectManager.GetModuleById(id);
	}

}

// if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
//
// 	let loop: GameLoop;
// 	const onFrameReady = (imageBitmap: ImageBitmap) => {
// 		self.postMessage({imageBitmap}, [imageBitmap]);
// 	};
//
// 	self.addEventListener('message', function(e) {
// 		const { action, params } = e.data;
// 		if(action === 0) return SetOptions(params);
// 		if(action === 1) return loop?.Instantiate(params);
// 	});
//
//
// 	const SetOptions = (opts: Dictionary<any>) => {
// 		const { offscreenCanvas, pauseOnBlur, adaptiveFrameDelay, drawFps, targetFps, debug, width, height, canvasContextAttributes, bgColor } = opts;
// 		const canvas = new Canvas({canvas: offscreenCanvas, width, height, bgColor, type:'2d', canvasContextAttributes: JSON.parse(canvasContextAttributes)});
// 		loop = new GameLoop({canvas, pauseOnBlur, adaptiveFrameDelay, debug, drawFps, targetFps, onFrameReady});
// 		loop.Start();
// 	};
//
// }
export default GameLoop;