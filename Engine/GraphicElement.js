class GraphicElement {
    constructor({ url, width, height, resolution = 1 }) {
        this._image = new Image();
        this._resolution = resolution;
        this.scaleX = 1;
        this.scaleY = 1;
        this.ctx = null;
        this.SetSize(width, height);
        this.SetImageContent(url);
    }

    SetScale(x = this.scaleX, y = this.scaleY) {
        this.scaleY = y;
        this.scaleX = x;
    }

    SetContext(ctx) {
        this.ctx = ctx;
    }

    SetSize(width, height) {
        this.width = width;
        this.height = height;
        this._image.width = width * this._resolution;
        this._image.height = height * this._resolution;
    }

    SetResolution(newRes) {
        const oldRes = this._resolution;
        this._resolution = newRes;
        this.SetSize(this.width / oldRes, this.height / oldRes);
    }

    SetImageContent(image) {
        if(image instanceof Image) {
            this._image = image;
            return;
        }
        if(typeof image !== "string") throw 'unacceptable image content provided';
        const newImage = new Image(this.width * this._resolution, this.height * this._resolution);
        newImage.onload = e => {
            this._image = newImage;
        }
        newImage.src = image;

    }

    GetImage() {
        return this._image;
    }

    Render(posX, posY) {
        const {scaleX, scaleY, ctx} = this;
        if(!ctx) return;
        ctx.save();
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(
            this._image,
            posX * scaleX, posY * scaleY,
            this.width * this._resolution * scaleX,
            this.height * this._resolution * scaleY
        );
        ctx.restore();
    }
}
