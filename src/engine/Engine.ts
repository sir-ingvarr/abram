import {IGameObject, IGameObjectConstructable, ITransform} from '../types/GameObject';
import {Queue, RGBAColor} from './Classes';
import InputSystem from './Globals/Input';
import Time from './Globals/Time';
import SpriteRenderer from './Managers/SpriteRenderer';

import {AnyFunc, CanvasContext2DAttributes, ColorSpace} from '../types/common';
import {GameObjectManager} from './Managers/GameObjectManager';
import {FpsProvider} from './Debug/FpsProvider';
import CollisionsManager from './Managers/CollisionsManager';
import Canvas from './Canvas/Canvas';
import {BasicObjectsConstructorParams} from './Objects/BasicObject';
import GameObject from './Objects/GameObject';

export type EngineConfigOptions = {
	width: number,
	height: number,
	fullscreen?: boolean,
	debug?: boolean,
	drawFps?: boolean,
	targetFps?: number,
	bgColor?: RGBAColor,
	adaptiveFrameDelay?: boolean,
	pauseOnBlur?: boolean,
	canvasContextAttributes?: CanvasContext2DAttributes,
}

type InstantiateOpts = {
	gameObject: IGameObjectConstructable<any>,
	params: any,
	parent?: ITransform,
}


class Engine {
	private readonly root: HTMLElement;
	private readonly fpsProvider: FpsProvider;
	private readonly adaptiveFrameDelay: boolean;
	private readonly debug: boolean;
	private readonly drawFps: boolean;
	private fullScreen: boolean;
	private canvas: Canvas;
	private gameObjectManager: GameObjectManager;
	private collisionsManager: CollisionsManager;
	private graphicRenderer: SpriteRenderer;
	private frameDelay = 0;
	private prevFrameTime: number;
	private isPlaying: boolean;
	private targetFps: number;
	static instantiateQueue: Queue<InstantiateOpts & { callOnDone: AnyFunc }> = new Queue<InstantiateOpts & { callOnDone: AnyFunc }>({data: []});

	public static async Instantiate<T extends BasicObjectsConstructorParams>(opts: InstantiateOpts): Promise<T> {
		return new Promise(resolve => {
			Engine.instantiateQueue.Push({ ...opts, callOnDone: go => resolve(go) });
		});
	}

	constructor (root: HTMLElement, options: EngineConfigOptions = { width: 800, height: 600 }) {
		const {
			width, height, fullscreen = false,
			debug = false, drawFps = false,
			targetFps = 60, adaptiveFrameDelay = false, pauseOnBlur = true,
			bgColor = new RGBAColor(),
			canvasContextAttributes = {
				alpha: true,
				willReadFrequently: false,
				desynchronized: false,
				colorSpace: ColorSpace.SRGB,
			}
		} = options;
		this.isPlaying = true;
		this.fullScreen = fullscreen;
		if(pauseOnBlur) {
			window.onblur = this.Pause.bind(this);
			window.onfocus = this.Play.bind(this);
		}
		this.root = root;
		this.debug = debug;
		this.drawFps = drawFps;
		this.targetFps = targetFps;
		this.adaptiveFrameDelay = adaptiveFrameDelay;
		this.CreateCanvas(width, height, canvasContextAttributes, bgColor);
		this.gameObjectManager = new GameObjectManager({ modules: [], context: this.canvas.Context2D });
		this.collisionsManager = new CollisionsManager({ modules: [] });
		this.graphicRenderer = SpriteRenderer.GetInstance(this.canvas.Context2D, this.debug);
		this.frameDelay = this.targetFps && this.targetFps < 60 ? 1000 / this.targetFps : 0;
		if(!drawFps) return;
		this.fpsProvider = new FpsProvider({
			name: 'FPSProvider',
			realFpsFramesBuffer: this.targetFps,
			targetFps: this.targetFps,
			frameDelay: this.frameDelay,
			onFrameDelaySet: this.adaptiveFrameDelay ? this.SetFrameDelay.bind(this) : null,
		});
		this.gameObjectManager.RegisterModule(this.fpsProvider);
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

	async RequestFullScreen() {
		if(this.fullScreen) return;
		await this.canvas.CanvasElement.requestFullscreen();
		this.fullScreen = true;
	}

	async ExitFullScreen() {
		if(!this.fullScreen) return;
		await document.exitFullscreen();
		this.fullScreen = false;
	}

	CreateCanvas (width: number, height: number, canvasContextAttributes?: CanvasContext2DAttributes, bgColor?: RGBAColor): HTMLCanvasElement {
		const canvas: HTMLCanvasElement = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		if(!this.root) return canvas;
		this.canvas = new Canvas({ canvas, width, height, bgColor, canvasContextAttributes });
		return this.InsertCanvas(this.root);
	}

	InsertCanvas (root: Element | Document): HTMLCanvasElement {
		if(!(root instanceof Element) && !(root instanceof Document)) throw 'parent should be html Element or Document.';
		root.appendChild(this.canvas.CanvasElement);
		return this.canvas.CanvasElement;
	}

	get Canvas(): Canvas {
		return this.canvas;
	}

	SetCanvasDimensions(width: number, height?: number) {
		this.canvas.SetSize(width, height);
	}

	SetBackgroundColor(color: RGBAColor): void {
		this.canvas.Context2D.BgColor = color;
	}

	AppendGameObject(element: IGameObject) {
		element.Context = this.canvas.Context2D;
		this.gameObjectManager.RegisterModule(element);
	}

	GetGameObjectById(id: string) {
		return this.gameObjectManager.GetModuleById(id);
	}

	public SetFrameDelay(delay: number) {
		this.frameDelay = delay;
		if(!this.debug) return;
		console.info(`new target frame delay set: ${this.frameDelay}`);
	}

	Start () {
		if(!this.canvas) throw 'Canvas not set, use CreateCanvas()';
		if(typeof InputSystem !== 'undefined') InputSystem.SetEventListeners();
		this.Play();
		this.Render();
		if(!this.debug) return;
		console.log(`target fps set to ${this.targetFps}, targetFrameDelay: ${this.frameDelay}`);
	}

	Play () {
		this.prevFrameTime = Date.now();
		this.isPlaying = true;
	}

	Pause() {
		this.isPlaying = false;
	}

	Render () {
		while(Engine.instantiateQueue.Count) {
			const element = Engine.instantiateQueue.Shift();
			this.Instantiate(element);
		}

		const now = Date.now();
		if(this.frameDelay && now - this.prevFrameTime < this.frameDelay || !this.isPlaying) {
			requestAnimationFrame(this.Render.bind(this));
			return;
		}
		this.canvas.Context2D
			.Reset()
			// .ContextRespectivePosition(true)
			.Clear()
			.DrawBg();

		this.gameObjectManager.Update();
		this.collisionsManager.Update();
		this.graphicRenderer.Render();

		if(this.drawFps) {
			this.canvas.Context2D
				.ContextRespectivePosition(true)
				.FillStyle('white')
				.FillRect(this.canvas.Width - 100, 0, 100, 40)
				.FillStyle('red')
				.FillText(`frame time: ${Time.deltaTime}`, this.canvas.Width - 90, 15)
				.FillText(`FPS: ${Math.floor(this.fpsProvider.FPS)}`, this.canvas.Width - 90, 30);
		}

		Time.FrameRendered();
		this.prevFrameTime = Date.now();
		requestAnimationFrame(this.Render.bind(this));
	}
}

export default Engine;
