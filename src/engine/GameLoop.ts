// import CollisionsManager from './Managers/CollisionsManager';
import Canvas from './Canvas/Canvas';
import {IGameObject, IGameObjectConstructable, ITransform} from '../types/GameObject';
import {FpsProvider} from './Debug/FpsProvider';
import {BasicObjectsConstructorParams} from './Objects/BasicObject';
import {AnyFunc} from '../types/common';
import GameObject from './Objects/GameObject';
import {Queue} from './Classes';
import {GameObjectManager} from './Managers/GameObjectManager';
import Time from './Globals/Time';
import SpriteRendererManager from './Managers/SpriteRendererManager';
import Camera from './Modules/Camera';

type InstantiateOpts = {
	gameObject: IGameObjectConstructable<any>,
	params: any,
	parent?: ITransform,
}

export type GameLoopOptions = {
	canvas: Canvas,
	pauseOnBlur?: boolean,
	debug?: boolean,
	targetFps?: number,
	drawFps?: boolean,
}

class GameLoop {
	private isPlaying: boolean;
	private prevFrameTime: number;
	private frameDelay: number;
	private targetFps: number;
	// private frameTime: number;
	private readonly debug: boolean;
	private readonly drawFps: boolean;
	private readonly gameObjectManager: GameObjectManager;
	private readonly spriteRendererManager: SpriteRendererManager;
	// private collisionsManager: CollisionsManager;
	private readonly fpsProvider: FpsProvider;
	private readonly canvas: Canvas;
	static instantiateQueue: Queue<InstantiateOpts & { callOnDone: AnyFunc }> = new Queue<InstantiateOpts & { callOnDone: AnyFunc }>({data: []});

	constructor(
		opts: GameLoopOptions
	) {
		const {
			canvas, debug = false, targetFps = 60, drawFps = false, pauseOnBlur
		} = opts;
		this.debug = debug;
		this.canvas = canvas;
		this.drawFps = drawFps;
		this.targetFps = targetFps;
		this.frameDelay = this.targetFps && this.targetFps < 60 ? 1000 / this.targetFps : 0;
		this.gameObjectManager = new GameObjectManager({ modules: [], context: this.canvas.Context2D});
		this.spriteRendererManager = SpriteRendererManager.GetInstance(canvas, debug);
		// this.collisionsManager = new CollisionsManager({ modules: [] });

		if (pauseOnBlur) {
			global.addEventListener('blur', this.Pause.bind(this));
			global.addEventListener('focus', this.Play.bind(this));
			global.addEventListener('focusout', this.Pause.bind(this));
			global.addEventListener('focusin', this.Play.bind(this));
		}
		this.prevFrameTime = Date.now();
		if(!drawFps) return;
		this.fpsProvider = new FpsProvider({
			name: 'FPSProvider',
			realFpsFramesBuffer: this.targetFps,
			targetFps: this.targetFps,
			frameDelay: this.frameDelay,
			onFrameDelaySet: null,
		});
		this.gameObjectManager.RegisterModule(this.fpsProvider);
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
		const timeFrameBegin = Date.now();
		while(GameLoop.instantiateQueue.Count) {
			const element = GameLoop.instantiateQueue.Shift();
			this.Instantiate(element);
		}
		if(this.frameDelay && timeFrameBegin - this.prevFrameTime < this.frameDelay) {
			requestAnimationFrame(this.Render.bind(this));
			return;
		}
		Time.FrameRendered();
		this.gameObjectManager.Update();
		this.spriteRendererManager.SetCameraPosition(Camera.GetInstance({}).Position);
		this.spriteRendererManager.DrawCallsFinished();
		// this.collisionsManager.Update();
		if(this.drawFps) {
			this.canvas.Context2D
				.ContextRespectivePosition(true)
				.FillStyle('white')
				.FillRect(this.canvas.Width - 100, 0, 100, 40)
				.FillStyle('red')
				.FillText(`frame time: ${Time.deltaTime}`, this.canvas.Width - 90, 15)
				.FillText(`FPS: ${Math.floor(this.fpsProvider.FPS)}`, this.canvas.Width - 90, 30);
		}
		this.prevFrameTime = Date.now();
		requestAnimationFrame(() => this.Render());
		// this.frameTime = this.prevFrameTime - timeFrameBegin;
		// this.frameDelay = 1000 / this.targetFps - this.frameTime;
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

export default GameLoop;