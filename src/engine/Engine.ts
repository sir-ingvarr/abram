import {IGameObject, IGameObjectConstructable, ITransform} from '../types/GameObject';
import {RGBAColor} from './Classes';
import InputSystem from './Globals/Input';
import {AnyFunc, CanvasContext2DAttributes, ColorSpace, Nullable} from '../types/common';
import Canvas from './Canvas/Canvas';
import GameLoop from './GameLoop';
import {BasicObjectsConstructorParams} from './Objects/BasicObject';

export type EngineConfigOptions = {
	width: number,
	height: number,
	fullscreen?: boolean,

	debug?: boolean,
	canvas?: HTMLCanvasElement,
	drawFps?: boolean,
	targetFps?: number,
	bgColor?: RGBAColor,
	adaptiveFrameDelay?: boolean,
	frameBuffering?: boolean,
	pauseOnBlur?: boolean,
	canvasContextAttributes?: CanvasContext2DAttributes,
	enableWorkers?: boolean,
}

class Engine {
	private readonly root: HTMLElement;
	private readonly gameLoopManager: GameLoop;
	private fullScreen: boolean;
	private loadScriptsPromises: Array<Promise<void>>;
	private canvas: Canvas;
	static instance: Engine;

	constructor (root: HTMLElement, options: EngineConfigOptions = { width: 800, height: 600 }) {
		const {
			width, height, fullscreen = false,
			debug = false, drawFps = false,
			targetFps = 60, pauseOnBlur = true,
			bgColor = new RGBAColor(), canvas = null,
			canvasContextAttributes = {
				alpha: true,
				willReadFrequently: false,
				desynchronized: false,
				colorSpace: ColorSpace.SRGB,
			}
		} = options;
		Engine.instance = this;
		this.loadScriptsPromises = [];
		this.fullScreen = fullscreen;
		this.root = root;
		this.SetCanvas(canvas || this.CreateCanvas(), width, height, canvasContextAttributes, bgColor);

		this.gameLoopManager = new GameLoop({
			canvas: this.canvas, drawFps, debug, targetFps, pauseOnBlur
		});
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

	RegisterGameScript(url: string): Promise<void> {
		const script = document.createElement('script');
		script.src = url;
		document.head.append(script);

		const loadScriptPromise = new Promise<void>((resolve, reject) => {
			script.addEventListener('load',  () => resolve());
			script.addEventListener('error', e => reject(e));
		});
		this.loadScriptsPromises.push(loadScriptPromise);
		return loadScriptPromise;
	}

	WrapCanvas(canvas: HTMLCanvasElement, width: number, height: number, canvasContextAttributes?: CanvasContext2DAttributes, bgColor?: RGBAColor) {
		return new Canvas({ canvas, width, height, bgColor, canvasContextAttributes });
	}

	private SetCanvas(canvas: HTMLCanvasElement, width: number, height: number, canvasContextAttributes?: CanvasContext2DAttributes, bgColor?: RGBAColor) {
		if(!this.root) return canvas;
		this.canvas = this.WrapCanvas(canvas, width, height, canvasContextAttributes, bgColor);
		return this.InsertCanvas(this.root);
	}

	CreateCanvas (): HTMLCanvasElement {
		return  document.createElement('canvas');
	}

	InsertCanvas (root: Element | Document): HTMLCanvasElement {
		if(!(root instanceof Element) && !(root instanceof Document)) throw 'parent should be html Element or Document.';
		root.appendChild(this.canvas.CanvasElement);
		return this.canvas.CanvasElement;
	}

	static get Instance(): Engine {
		if(!Engine.instance) throw 'Engine not instantiated, call new Engine() first';
		return Engine.instance;
	}

	get Canvas(): Nullable<Canvas> {
		return this.canvas || null;
	}

	AppendGameObject(element: IGameObject) {
		this.gameLoopManager.GameObjectManager.RegisterModule(element);
	}

	Instantiate<T extends BasicObjectsConstructorParams>(gameObject: IGameObjectConstructable<T>, params: T, parent?: ITransform, callOnDone?: AnyFunc): Promise<IGameObject> {
		return this.gameLoopManager.Instantiate({ gameObject, params, parent, callOnDone });
	}

	async Start () {
		await Promise.all(this.loadScriptsPromises);
		this.loadScriptsPromises = [];
		if(!this.canvas) throw 'Canvas not set, use CreateCanvas()';
		if(typeof InputSystem !== 'undefined') InputSystem.SetEventListeners();
		this.gameLoopManager.Start();
	}

}

export default Engine;