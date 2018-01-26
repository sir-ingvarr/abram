function DrawEngine() {

  this.canvas = null;

  this.children = [];

  this.createCanvas = function(parent, options = {width: 200, height: 200}) {
    const newCavas = document.createElement('canvas');
    newCavas.width = `${options.width}px`;
    newCavas.height = `${options.height}px`;
    const id = `${Date.now()}_canvas_${Math.random()}`;
    newCavas.id = id;
    let parentElement = document;
    if(parent) {
      switch (parent[0]) {
        case '#': {
          parentElement = document.getElementById(parent);
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
    this.canvas = newCavas;
    return {
      id,
      newCavas,
    };
  }

  this.processRendering = function(fps = 60) {
    setInterval(this.render, 1000/fps);
  }

  this.render = function() {
    if(this.canvas) {
      for(let childId in index) {
        
      }
    }
  } 
 
  this.drawCircle = function () {
    arc(x, y, radius, 0, 360, false)
  }
}