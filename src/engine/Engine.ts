import {IGameObject} from "../types/GameObject";
import {Point, RGBAColor} from "./Classes";
import InputSystem from "./globals/Input";
import CanvasContext2D from "./Context2d";
import Time from "./globals/Time";
import SpriteRenderer from "./Managers/SpriteRenderer";

import {ICoordinates} from "../types/common";
import {GameObjectManager} from "./Managers/GameObjectManager";
import {FpsProvider} from "./Debug/FpsProvider";

class Engine {
  private gameObjectManager: GameObjectManager;
  private graphicRenderer: SpriteRenderer;
  private readonly context: CanvasContext2D;
  private bgColor: RGBAColor;
  private ctxPos: ICoordinates = new Point();
  private frameDelay: number = 0;
  private prevFrameTime: number;
  private readonly fpsProvider: FpsProvider;
  private readonly adaptiveFrameDelay: boolean;
  private isPlaying: boolean;

  public canvas: HTMLCanvasElement;

  constructor (
      private bgWidth: number,
      private bgHeight: number,
      private readonly root: HTMLElement,
      private readonly debug: boolean = false,
      private targetFps: number = 0,
      options: { adaptiveFrameDelay?: boolean, pauseOnBlur?: boolean } = {}
  ) {
    const {adaptiveFrameDelay = false, pauseOnBlur=true} = options;
    this.isPlaying = true;
    if(pauseOnBlur) {
      window.onblur = this.Pause.bind(this);
      window.onfocus = this.Play.bind(this);
    }
    this.adaptiveFrameDelay = adaptiveFrameDelay;
    this.gameObjectManager = new GameObjectManager({ modules: [] });
    this.CreateCanvas();
    const context = this.canvas.getContext('2d');
    if(!context) throw 'Could not retrieve Context2D from canvas'
    this.context = new CanvasContext2D(context);
    this.graphicRenderer = new SpriteRenderer(this.context);
    this.frameDelay = this.targetFps && this.targetFps < 60 ? 1000 / this.targetFps : 0;
    if(!debug) return;
    this.fpsProvider = new FpsProvider({
      name: "FPS Provider",
      realFpsFramesBuffer: this.targetFps,
      targetFps: this.targetFps,
      frameDelay: this.frameDelay,
      onFrameDelaySet: this.adaptiveFrameDelay ? this.SetFrameDelay.bind(this) : null,
    });
    this.gameObjectManager.RegisterModule(this.fpsProvider);
  }

  public SetFrameDelay(delay: number) {
    this.frameDelay = delay;
    if(!this.debug) return;
    console.info(`new target frame delay set: ${this.frameDelay}`);
  }

  get Context() {
    return this.context;
  }

  private ClearCanvas () {
    this.context.ctx.clearRect(-this.ctxPos.x, -this.ctxPos.y, this.bgWidth, this.bgHeight);
  }

  SetCanvasDimensions(width: number = this.bgWidth, height: number = this.bgHeight) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.bgWidth = width;
    this.bgHeight = height;
  }

  SetBackgroundColor(rgbaColor: RGBAColor) {
    this.bgColor = rgbaColor;
    if(!this.debug) return;
    console.log('bg color changed', rgbaColor);
  }

  RenderBackground() {
    if(!this.bgColor) return;
    const { context } = this;
    context.ctx.beginPath();
    context.ctx.fillStyle = this.bgColor.valueOf();
    context.ctx.rect(-this.ctxPos.x, -this.ctxPos.y, this.bgWidth, this.bgHeight);
    context.ctx.fill();
    context.ctx.closePath();
  }

  CreateCanvas (): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = this.canvas || document.createElement('canvas');
    const { bgWidth: width, bgHeight: height } = this;
    canvas.width = width;
    canvas.height = height;
    if(!this.root) return canvas;
    this.canvas = canvas;
    this.InsertCanvas(this.root);
    return canvas;
  }

  InsertCanvas (root: Element | Document) {
    if(!(root instanceof Element) && !(root instanceof Document)) throw 'parent should be html Element or Document.';
    root.appendChild(this.canvas);
  }

  Start () {
    if(!this.context) throw 'Canvas context not created, use CreateCanvas()';
    if(typeof InputSystem !== 'undefined') InputSystem.SetEventListeners();
    this.Play();
    this.Render();
    if(!this.debug) return;
    console.log(`target fps set to ${this.targetFps}, targetFrameDelay: ${this.frameDelay}`);
  }

  Play () {
    this.prevFrameTime = Date.now();
    this.isPlaying = true;
    console.log('play');
  }

  Pause() {
    this.isPlaying = false;
    console.log('pause');
  }

  Render () {
    const now = Date.now();
    if(this.frameDelay && now - this.prevFrameTime < this.frameDelay || !this.isPlaying) {
      requestAnimationFrame(this.Render.bind(this));
      return;
    }
    const { context } = this;
    this.ClearCanvas();
    this.RenderBackground();
    this.gameObjectManager.Update();
    this.graphicRenderer.Render();

    if(this.debug) {
      this.ctxPos = context.Position;
      context.ctx.fillStyle = 'white';
      context.ctx.fillRect(this.bgWidth - 100 - this.ctxPos.x, -this.ctxPos.y, 100, 40);
      context.ctx.fillStyle = 'red';
      context.ctx.fillText(`frame time: ${Time.deltaTime}`, this.bgWidth - 90 - this.ctxPos.x, 15 - this.ctxPos.y);
      context.ctx.fillText(`FPS: ${Math.floor(this.fpsProvider.FPS)}`, this.bgWidth - 90 - this.ctxPos.x, 30 - this.ctxPos.y);
    }

    Time.FrameRendered();
    this.prevFrameTime = Date.now();
    requestAnimationFrame(this.Render.bind(this));
  }

  AppendGameObject(element: IGameObject) {
    element.Context = this.context;
    this.gameObjectManager.RegisterModule(element);
  }

  GetGameObjectById(id: string) {
    return this.gameObjectManager.GetModuleById(id);
  }
}

export default Engine;
