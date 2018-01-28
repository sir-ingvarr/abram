//----DRAW ENGINE CLASS-----//
function DrawEngine() {

  let bg = null;
  let context = null;
  let bgWidth = 200;
  let bgHeight = 200;


  let canvasResolution;

  const children = [];

  let clearCanvas = function (color, w, h, debug) {
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(0, 0, w, h);
    context.closePath();
    if(debug) drawDebugGrid(canvasResolution);
  }

  const drawDebugGrid = function (resolution) {
    if(resolution > 10) {
    for(let xPos = 0; xPos <= bgWidth; xPos += resolution)
      for(let yPos = 0; yPos <= bgHeight; yPos += resolution) {
        context.beginPath();
        context.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        context.rect(xPos, yPos, resolution, resolution);
        context.stroke();
        context.closePath();
      }
    }
  }

  this.createCanvas = function(parent, options = {width, height, color, resolution, debug}) {
    const newCavas = document.createElement('canvas');
    const { width = 200, height = 200, color = 'black', resolution = 1, debug =false } = options;
    canvasResolution = resolution;
    bgWidth = newCavas.width = width;
    bgHeight = newCavas.height = height;
    const id = `${Date.now()}_canvas_${Math.random()}`;
    newCavas.id = id;
    let parentElement = document;
    if(parent) {
      switch (parent[0]) {
        case '#': {
          parentElement = document.getElementById(parent.slice(1));
          break;
        }
        case '.': {
          parentElement = document.getElementsByClassName(parent)[0];
          break;
        }
        default: 
          parentElement = document.getElementsByTagName(parent)[0];
          break;
      }
    }
    parentElement.appendChild(newCavas);
    context = newCavas.getContext('2d');
    clearCanvas = clearCanvas.bind(null, color, width, height, debug);
    this.processRendering(60, debug);
    bg = newCavas;

    return {
      id,
      newCavas,
    };
  }

  this.processRendering = function(fps = 60, debug) {
    setInterval(() => this.render(debug), 1000/fps);
  }

  this.render = function(debug) {
    let startDraw, endDraw;
    if(debug)  startDraw = Date.now();
    clearCanvas();
    if(context) {
      for(let childId in children) {
        const { type, style, color, shape } = children[childId];
        if(type !== 'drawImage') {
          context.beginPath();
          context[`${style}Style`] = color;
          context[type](...shape);
          context[style]();
          context.closePath();
        }
      }
    }

    // draw time needed to draw the whole frame //
    if(debug) {
      endDraw = Date.now();
      context.beginPath();
      context.fillStyle= 'white';
      context.fillRect(bgWidth - 100, 0, 100, 40);
      context.closePath();
      context.beginPath();
      context.fillStyle = 'red';
      context.fillText(`${endDraw - startDraw}`, bgWidth - 90, 15);
      context.closePath();
    }
  } 
 
  this.circle = function (x=0, y=0, radius=10, style='fill', color='white') {
    const shape = new Shape({ type: 'arc', style, color, shape: [x, y, radius, 0, 360, false], canvasResolution});
    children.push(shape);
    this.render();
    return children[children.length - 1];
  }

  this.rect = function (x=0, y=0, w=20, h=20, style='fill', color='white',) {
    const shape = new Shape({ type: 'rect', style, color, shape: [x, y, w, h], canvasResolution});
    children.push(shape);
    this.render();
    return children[children.length - 1];
  }

  this.image = function (x=0, y=0, w=20, h=20, src) {
    const shape = new Shape({ type: 'drawImage', src, shape: [x, y, w, h], canvasResolution});
    children.push(shape);
    this.render();
    return children[children.length - 1];
  }
}
//----SHAPE CLASS-----//
function Shape(params) {

  let paramsToAppplyResolution = params.type === 'rect' ? 4 : 3;

  for(let i = 0; i < paramsToAppplyResolution; i++) {
    params.shape[i] *= params.canvasResolution;
  }

  Object.assign(this, params);
  
  this.moveTo = function(newX, newY) {
    this.shape[0] = newX * this.canvasResolution;
    this.shape[1] = newY * this.canvasResolution;  
  }

  this.moveRelative = function(x, y) {
    this.shape[0] += x * this.canvasResolution;
    this.shape[1] += y * this.canvasResolution;  
  }

  this.setSize = function(w, h) {
    switch(this.type) {
      case 'arc':
        this.shape[2] = w * this.canvasResolution;
        this.shape[3] = h * this.canvasResolution;
      break;
      case 'rect':
        this.shape[2] = w * this.canvasResolution;
      break;
    }
  }

  this.rotate = function(deg){

  }
}
