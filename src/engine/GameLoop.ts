import Canvas from './Canvas/Canvas';
import {IGameObject, IGameObjectConstructable, ITransform} from '../types/GameObject';
import {FpsProvider} from './Debug/FpsProvider';
import {BasicObjectsConstructorParams} from './Objects/BasicObject';
import GameObject from './Objects/GameObject';
import {Queue} from './Classes';
import {GameObjectManager} from './Managers/GameObjectManager';
import Time from './Globals/Time';
import SpriteRendererManager from './Managers/SpriteRendererManager';
import Camera from './Modules/Camera';
import CollisionsManager from './Managers/CollisionsManager';
import RigidBody from './Modules/Rigidbody';
import Debug from './Debug/Debug';

type InstantiateOpts = {
	gameObject: IGameObjectConstructable<BasicObjectsConstructorParams>,
	params: BasicObjectsConstructorParams,
	parent?: ITransform,
}

export type GameLoopOptions = {
	canvas: Canvas,
	pauseOnBlur?: boolean,
	debug?: boolean,
	drawFps?: boolean,
}

class GameLoop {
	private isPlaying: boolean;
	private readonly debug: boolean;
	private readonly drawFps: boolean;
	private readonly gameObjectManager: GameObjectManager;
	private readonly spriteRendererManager: SpriteRendererManager;
	private collisionsManager: CollisionsManager;
	private readonly fpsProvider: FpsProvider;
	private readonly canvas: Canvas;
	private readonly instantiateQueue: Queue<InstantiateOpts & { resolve: (go: IGameObject) => void }> = new Queue<InstantiateOpts & { resolve: (go: IGameObject) => void }>({data: []});
	private readonly boundRender: () => void;
	private fixedTimeAccumulator: number = 0;

	constructor(
		opts: GameLoopOptions
	) {
		const {
			canvas, debug = false, drawFps = false, pauseOnBlur
		} = opts;
		this.debug = debug;
		Debug.Enabled = debug;
		Debug.SetContext(canvas.Context2D);
		this.canvas = canvas;
		this.drawFps = drawFps;
		this.gameObjectManager = new GameObjectManager({ modules: [], context: this.canvas.Context2D});
		this.spriteRendererManager = SpriteRendererManager.GetInstance(canvas, this.debug);
		this.collisionsManager = new CollisionsManager({ modules: [] });

		if (pauseOnBlur) {
			global.addEventListener('blur', this.Pause.bind(this));
			global.addEventListener('focus', this.Play.bind(this));
			global.addEventListener('focusout', this.Pause.bind(this));
			global.addEventListener('focusin', this.Play.bind(this));
		}
		this.boundRender = this.Render.bind(this);
		if(!drawFps) return;
		this.fpsProvider = new FpsProvider({
			name: 'FPSProvider',
			sampleSize: 60,
		});
		this.gameObjectManager.RegisterModule(this.fpsProvider);
	}

	get GameObjectManager() {
		return this.gameObjectManager;
	}

	Play () {
		this.isPlaying = true;
		this.boundRender();
	}

	Pause() {
		this.isPlaying = false;
	}

	Start () {
		this.Play();
	}

	public Instantiate(opts: InstantiateOpts): Promise<IGameObject> {
		return new Promise(resolve => {
			this.instantiateQueue.Push({ ...opts, resolve });
		});
	}

	get Canvas() {
		return this.canvas;
	}

	Render () {
		if(!this.isPlaying) return;
		requestAnimationFrame(this.boundRender);
		while(this.instantiateQueue.Count) {
			const element = this.instantiateQueue.Shift();
			this.Spawn(element);
		}
		Time.FrameRendered();

		// Fixed timestep physics — accumulator runs on real time so FixedUpdate always ticks at 50Hz;
		// timeScale only affects step size via FixedDeltaTimeSeconds
		this.fixedTimeAccumulator += Time.unscaledDeltaTime;
		// Cap accumulator to prevent spiral of death — no more than one frame's worth of catch-up
		const maxAccumulator = Math.max(Time.fixedDeltaTime * 3, Time.unscaledDeltaTime);
		this.fixedTimeAccumulator = Math.min(this.fixedTimeAccumulator, maxAccumulator);
		while(this.fixedTimeAccumulator >= Time.fixedDeltaTime) {
			this.gameObjectManager.FixedUpdate();
			this.collisionsManager.FixedUpdate();
			this.fixedTimeAccumulator -= Time.fixedDeltaTime;
		}

		// Interpolate physics for smooth rendering
		const alpha = this.fixedTimeAccumulator / Time.fixedDeltaTime;
		RigidBody.InterpolateAll(alpha);

		// Rendering
		this.Canvas.Context2D
			.InvalidateBoundingBoxCache();
		this.Canvas.Context2D
			.Clear()
			.DrawBg();
		this.gameObjectManager.Update();
		const camera = Camera.GetInstance({});
		this.spriteRendererManager.SetCamera(camera.Position, camera.Scale);
		this.spriteRendererManager.DrawCallsFinished();
		Debug.Update();
		if(this.drawFps) {
			Debug.DrawFps(this.fpsProvider.FPS, Time.deltaTime, this.canvas.Width);
		}

		// Restore physics positions after rendering
		RigidBody.RestoreAll();
	}

	private Spawn(args: InstantiateOpts & { resolve: (go: IGameObject) => void }): void {
		const gameObjectInstance = new args.gameObject(args.params);
		if(!args.parent) {
			this.AppendGameObject(gameObjectInstance);
		} else {
			if(!(args.parent.gameObject instanceof GameObject)) throw new Error('unable to instantiate child to non GameObject parent');
			args.parent.gameObject.AppendChild(gameObjectInstance);
		}
		args.resolve(gameObjectInstance);
	}

	private AppendGameObject(element: IGameObject) {
		this.gameObjectManager.RegisterModule(element);
	}

	GetGameObjectById(id: string) {
		return this.gameObjectManager.GetModuleById(id);
	}

}

export default GameLoop;