import Canvas from './Canvas/Canvas';
import {IGameObject, IGameObjectConstructable, ITransform} from '../types/GameObject';
import {FpsProvider} from './Debug/FpsProvider';
import GameObject from './Objects/GameObject';
import {Queue} from './Classes';
import {GameObjectManager} from './Managers/GameObjectManager';
import Time from './Globals/Time';
import SpriteRendererManager from './Managers/SpriteRendererManager';
import Camera from './Modules/Camera';
import CollisionsManager from './Managers/CollisionsManager';

type InstantiateOpts = {
	gameObject: IGameObjectConstructable<any>,
	params: any,
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

	constructor(
		opts: GameLoopOptions
	) {
		const {
			canvas, debug = false, drawFps = false, pauseOnBlur
		} = opts;
		this.debug = debug;
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
		this.Canvas.Context2D
			.InvalidateBoundingBoxCache();
		this.Canvas.Context2D
			.Clear()
			.DrawBg();
		this.gameObjectManager.Update();
		const camera = Camera.GetInstance({});
		this.spriteRendererManager.SetCamera(camera.Position, camera.Scale);
		this.spriteRendererManager.DrawCallsFinished();
		this.collisionsManager.Update();
		if(this.drawFps) {
			this.canvas.Context2D
				.Reset()
				.FillStyle('white')
				.FillRect(this.canvas.Width - 100, 0, 100, 40)
				.FillStyle('red')
				.FillText(`frame time: ${Time.deltaTime}`, this.canvas.Width - 90, 15)
				.FillText(`FPS: ${Math.floor(this.fpsProvider.FPS)}`, this.canvas.Width - 90, 30);
		}
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