import {IGameObject} from "../types/GameObject";
import {Point, RGBAColor} from "./Classes";
import InputSystem from "./Input";
import CanvasContext2D from "./Context2d";
import {DebugGrid} from "./Primitives/DebugGrid";
import {ICoordinates} from "../types/common";

class Engine {
  private gameObjects: Map<string, IGameObject>;
  private readonly context: CanvasContext2D;
  private bgColor: RGBAColor;

  private debugGrid: DebugGrid;

  public canvas: HTMLCanvasElement;

  private ctxPos: ICoordinates = new Point();

  constructor (
      private bgWidth: number,
      private bgHeight: number,
      private resolution: number,
      private readonly root: HTMLElement,
      private readonly debug: boolean = false,
  ) {
    this.gameObjects = new Map();
    this.CreateCanvas();
    const context = this.canvas.getContext('2d');
    if(!context) throw 'Could not retrieve Context2D from canvas'
    this.context = new CanvasContext2D(context);
    if(!debug) return;
    this.debugGrid = new DebugGrid(this.bgWidth, this.bgHeight, this.resolution);
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

  DrawDebugGrid () {
    this.context.DrawLines(this.debugGrid.lines, true);
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

  Start (fps = 60) {
    if(!this.context) throw 'Canvas context not created, use CreateCanvas()';
    if(typeof InputSystem !== 'undefined') InputSystem.SetEventListeners();
    setInterval(() => requestAnimationFrame(this.Render.bind(this)), 1000/fps);
  }

  Render () {
    const { context } = this;
    const startDraw = Date.now();
    this.ClearCanvas();
    this.RenderBackground();
    const currentChildren = this.gameObjects.values();
    for(let child of currentChildren) {
      if(child.needDestroy) {
        this.DeleteGameObjectById(child.id);
        continue;
      }
      child.Update();
    }

    // draw time needed to draw the whole frame //
    if(!this.debug) return;
    this.DrawDebugGrid();
    this.ctxPos = context.Position;
    const endDraw = Date.now();
    context.ctx.fillStyle = 'white';
    context.ctx.fillRect(this.bgWidth - 100 - this.ctxPos.x, -this.ctxPos.y, 100, 40);
    context.ctx.fillStyle = 'red';
    context.ctx.fillText(`TTR: ${endDraw - startDraw}`, this.bgWidth - 90 - this.ctxPos.x, 15 - this.ctxPos.y);
  }

  AppendGameObject(element: IGameObject) {
    element.SetResolution(this.resolution);
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
