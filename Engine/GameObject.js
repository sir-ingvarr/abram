class GameObject {
    constructor({ position = new Vector(), name = 'GameObject' }) {
        if(!position instanceof Vector) throw 'position should be a Vector';
        this.position = position;
        this.graphic = null;
        this.needDestroy = false;
        this.resolution = 1;
        this.name = name;
        this.id = this.GenerateId();
    }

    SetContext(ctx) {
        if(!(ctx instanceof CanvasRenderingContext2D)) throw 'ctx should be CanvasRenderingContext2D';
        this.ctx = ctx;
        if(!this.graphic) return;
        this.graphic.SetContext(ctx);
    }

    GenerateId() {
        return this.name + Date.now() + Math.random();
    }

    SetResolution(newRes) {
        if(typeof newRes !== 'number') throw 'invalid resolution type';
        this.resolution = newRes;
        this.position.ApplyResolution(newRes);
        if(!this.graphic) return;
        this.graphic.SetResolution(newRes);
    }

    GetGraphicsContent() {
        return this.graphic;
    }

    SetGraphicsContent(graphics) {
        if(typeof graphics === 'string') {
            this.graphic = new GraphicElement({ url: graphics, resolution: this.resolution });
            return;
        }
        if(graphics instanceof GraphicElement) {
            this.graphic = graphics;
            this.graphic.SetResolution(this.resolution);
            this.graphic.SetContext(this.ctx);
            return;
        }
        throw 'invalid type of graphics, should be a string(url) or GraphicsElement'
    }

    Destroy() {
        delete this.position;
        this.needDestroy = true;
    }
}
