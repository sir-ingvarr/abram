import {IGameObject} from "../types/GameObject";
import {Point, RGBAColor} from "./Classes";
import InputSystem from "./globals/Input";
import CanvasContext2D from "./Context2d";
import Time from "./globals/Time";
import SpriteRenderer from "./Managers/SpriteRenderer";

import {ICoordinates} from "../types/common";

class Engine {
  private gameObjects: Map<string, IGameObject>;
  private graphicRenderer: SpriteRenderer;
  private readonly context: CanvasContext2D;
  private bgColor: RGBAColor;
  private ctxPos: ICoordinates = new Point();
  private frameDelay: number = 0;
  private prevFrameTime: number;

  public canvas: HTMLCanvasElement;

  constructor (
      private bgWidth: number,
      private bgHeight: number,
      private readonly root: HTMLElement,
      private readonly debug: boolean = false,
  ) {
    this.gameObjects = new Map();
    this.CreateCanvas();
    const context = this.canvas.getContext('2d');
    if(!context) throw 'Could not retrieve Context2D from canvas'
    this.context = new CanvasContext2D(context);
    this.graphicRenderer = new SpriteRenderer(this.context);
    if(!debug) return;
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

  InsertCanvas (parent: Node = document) {
    if(!(parent instanceof Element) && !(parent instanceof Document)) throw 'parent should be html Element or Document.';
    parent.appendChild(this.canvas);
  }

  Start (targetFps: number = 0) {
    if(!this.context) throw 'Canvas context not created, use CreateCanvas()';
    if(typeof InputSystem !== 'undefined') InputSystem.SetEventListeners();
    this.frameDelay = targetFps ? 1000 / targetFps : 0;
    console.log(`target fps set to ${targetFps}, targetFrameDelay: ${this.frameDelay}`);
    this.prevFrameTime = Date.now();
    this.Render();
  }

  Render () {
    const now = Date.now();
    if(this.frameDelay && now - this.prevFrameTime < this.frameDelay - Time.deltaTime) {
      requestAnimationFrame(this.Render.bind(this));
      return;
    }
    this.prevFrameTime = now;
    const { context } = this;
    this.ClearCanvas();
    this.RenderBackground();
    const gameObjects = this.gameObjects.values();
    for(let gameObject of gameObjects) {
      if(gameObject.needDestroy) {
        this.DeleteGameObjectById(gameObject.id);
        continue;
      }
      gameObject.Update();
    }

    this.graphicRenderer.Render();

    if(!this.debug) {
      Time.FrameRendered();
      requestAnimationFrame(this.Render.bind(this));
      return;
    }
    this.ctxPos = context.Position;
    context.ctx.fillStyle = 'white';
    context.ctx.fillRect(this.bgWidth - 100 - this.ctxPos.x, -this.ctxPos.y, 100, 40);
    context.ctx.fillStyle = 'red';
    context.ctx.fillText(`delta time: ${Time.deltaTime}`, this.bgWidth - 90 - this.ctxPos.x, 15 - this.ctxPos.y);
    context.ctx.fillText(`FPS: ${Math.floor(1000 / (Time.deltaTime || 1))}`, this.bgWidth - 90 - this.ctxPos.x, 30 - this.ctxPos.y);
    Time.FrameRendered();
    requestAnimationFrame(this.Render.bind(this));
  }

  AppendGameObject(element: IGameObject) {
    element.Context = this.context;
    this.gameObjects.set(element.id, element);
    if(!element.IsActive()) return;
    element.Start();
  }

  GetGameObjectById(id: string) {
    return this.gameObjects.get(id);
  }

  DeleteGameObjectById(id: string) {
    this.gameObjects.delete(id);
  }
}

export default Engine;
