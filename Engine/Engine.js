class Engine {
  constructor ({
    width = 200,
    height = 200,
    canvasResolution = 1,
    debug = false
  }) {
    this._bgWidth = width;
    this._bgHeight = height;
    this._resolution = canvasResolution;
    this._gameObjects = new Map();
    this._debug = debug;
    this._context = null;
    this._canvas = null;
    this._bgColor = null;
  }

  ClearCanvas () {
    this._context.clearRect(0, 0, this._bgWidth, this._bgHeight);
  }

  DrawDebugGrid () {
    const { _resolution: resolution, _bgHeight: height, _bgWidth: width } = this;
    if(this._resolution < 10) return;
    for(let xPos = 0; xPos <= width; xPos += resolution)
      for(let yPos = 0; yPos <= height; yPos += resolution) {
        this._context.beginPath();
        this._context.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        this._context.rect(xPos, yPos, resolution, resolution);
        this._context.stroke();
        this._context.closePath();
      }
  }

  SetBackgroundColor(rgbaColor) {
    if(!(rgbaColor instanceof RGBAColor)) throw 'color should be an instance of RGBAColor class';
    this._bgColor = rgbaColor;
    if(!this._debug) return;
    console.log('bg color changed', rgbaColor);
  }

  RenderBackground() {
    if(!this._bgColor) return;
    this._context.beginPath();
    this._context.fillStyle = this._bgColor;
    this._context.rect(0, 0, this._bgWidth, this._bgHeight);
    this._context.fill();
    this._context.closePath();
    if(!this._debug) return;
    this.DrawDebugGrid(this._resolution);
  }

  CreateCanvas (parent = null) {
    const canvas = this._canvas = document.createElement('canvas');
    this._context = canvas.getContext('2d');
    const { _bgWidth: width, _bgHeight: height } = this;
    canvas.width = width;
    canvas.height = height;
    canvas.id = `${Date.now()}_canvas_${Math.random()}`;
    if(!parent) return;
    this.InsertCanvas(parent);
  }

  InsertCanvas (parent = document) {
    if(!(parent instanceof Element) && !(parent instanceof Document)) throw 'parent should be html Element or Document.';
    parent.appendChild(this._canvas);
  }

  Start (fps = 60) {
    if(typeof InputSystem !== 'undefined') InputSystem.SetEventListeners();
    setInterval(this.Render.bind(this), 1000/fps);
  }

  Render () {
    let startDraw, endDraw;
    if(this._debug)  startDraw = Date.now();
    this.ClearCanvas();
    this.RenderBackground();
    const { _context: context } = this;
    const currentChildren = this._gameObjects.values();
    for(let child of currentChildren) {
      if(child.needDestroy) {
        this.DeleteGameObjectById(child.id);
        continue;
      }
      child.Render();
      const graphic = child.GetGraphicsContent();
      if(!graphic) continue;
      graphic.Render(child.position.x, child.position.y);
    }

    // draw time needed to draw the whole frame //
    if(!this._debug) return;
    endDraw = Date.now();
    context.beginPath();
    context.fillStyle = 'white';
    context.fillRect(this._bgWidth - 100, 0, 100, 40);
    context.closePath();
    context.beginPath();
    context.fillStyle = 'red';
    context.fillText(`${endDraw - startDraw}`, this._bgWidth - 90, 15);
    context.closePath();
  }

  AppendGameObject(element) {
    if(!(element instanceof GameObject)) throw 'child is not GameObject';
    element.SetResolution(this._resolution);
    element.SetContext(this._context);
    element.Start();
    this._gameObjects.set(element.id, element);
  }

  GetGameObjectById(id) {
    if(!id) return;
    return this._gameObjects.get(id);
  }

  DeleteGameObjectById(id) {
    if(!id) return;
    this._gameObjects.delete(id);
  }
}
