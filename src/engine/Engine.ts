import {IGameObject} from '../types/GameObject';
import {RGBAColor} from './Classes';
import InputSystem from './Globals/Input';
import {CanvasContext2DAttributes, ColorSpace, Nullable} from '../types/common';
import Canvas, {ContextType} from './Canvas/Canvas';
import GameLoop from './GameLoop';
import {AnyCanvas} from './Canvas/Context2d';
import SpriteRendererManager from './Managers/SpriteRendererManager';

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
	// private readonly debug: boolean;
	private readonly gameLoopWorker: Worker;
	private fullScreen: boolean;
	private loadScriptsPromises: Array<Promise<void>>;
	private canvas: Canvas<any>;
	private enableWorkers: boolean;

	constructor (root: HTMLElement, options: EngineConfigOptions = { width: 800, height: 600 }) {
		const {
			width, height, fullscreen = false,
			debug = false, drawFps = false,
			targetFps = 60, adaptiveFrameDelay = false, pauseOnBlur = true,
			bgColor = new RGBAColor(), canvas = null, enableWorkers = false,
			canvasContextAttributes = {
				alpha: true,
				willReadFrequently: false,
				desynchronized: false,
				colorSpace: ColorSpace.SRGB,
			}
		} = options;
		this.enableWorkers = enableWorkers;
		this.loadScriptsPromises = [];
		this.fullScreen = fullscreen;
		this.root = root;
		this.SetCanvas(canvas || this.CreateCanvas(), width, height,'2d', canvasContextAttributes, bgColor, false);

		SpriteRendererManager.GetInstance(this.enableWorkers, {
			Width: width,
			Height: height,
			debug: debug,
			layer: 0,
			contentType: 0,
		}, this.canvas);

		this.gameLoopManager = new GameLoop({
			canvas: this.canvas, workerMode: this.enableWorkers,
			drawFps, debug, adaptiveFrameDelay, targetFps, pauseOnBlur
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
	//
	// DrawBitmapOnCanvas(imageBitmap: ImageBitmap) {
	// 	// this.canvas.Context2D
	// 	// 	.Reset()
	// 	// 	.Clear()
	// 	this.canvas.Context2D
	// 		.Reset()
	// 		.ContextRespectivePosition(true)
	// 		.Clear()
	// 		.DrawBg()
	// 		.DrawImage(imageBitmap, 0, 0, this.canvas.Width, this.canvas.Height);
	// 	// this.canvas.BitmapContext?.transferFromImageBitmap(imageBitmap);
	// }

	WrapCanvas<T extends OffscreenCanvas | HTMLCanvasElement>(canvas: T, width: number, height: number, type: ContextType = '2d', canvasContextAttributes?: CanvasContext2DAttributes, bgColor?: RGBAColor, allowGetContext? :boolean) {
		return new Canvas<T>({ canvas, width, height, bgColor, canvasContextAttributes, type, transferToOffscreen: true, allowGetContext: allowGetContext === undefined ? true : allowGetContext });
	}

	private SetCanvas(canvas: HTMLCanvasElement, width: number, height: number, type: ContextType = '2d', canvasContextAttributes?: CanvasContext2DAttributes, bgColor?: RGBAColor, allowGetContext? :boolean) {
		if(!this.root) return canvas;
		this.canvas = this.WrapCanvas(canvas, width, height, type, canvasContextAttributes, bgColor, allowGetContext);
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

	get Canvas(): Nullable<Canvas<AnyCanvas>> {
		return this.canvas || null;
	}

	InstantiateRootGameObject(element: IGameObject) {
		this.gameLoopWorker.postMessage({ action: 1, params: element.toString() });
	}

	AppendGameObject(element: IGameObject) {
		this.gameLoopManager.GameObjectManager.RegisterModule(element);
	}
	async Start () {
		await Promise.all(this.loadScriptsPromises);
		this.loadScriptsPromises = [];
		if(!this.canvas) throw 'Canvas not set, use CreateCanvas()';
		if(typeof InputSystem !== 'undefined') InputSystem.SetEventListeners();
		this.gameLoopManager?.Start();
	}


}

export default Engine;
