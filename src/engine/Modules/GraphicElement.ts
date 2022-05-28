import Module from "../Module";
import {IGameObject} from "../../types/GameObject";
import {ICoordinates} from "../../types/common";

class GraphicElement extends Module {
    private width: number;
    private height: number;
    private image: HTMLImageElement;
    public gameObject: IGameObject;

    constructor(params: { url: string, width: number, height: number }) {
        super();
        this.image = new Image();
        this.SetSize(params.width, params.height);
        this.SetImageContent(params.url);
    }

    SetGameObject(gameObject: IGameObject) {
        this.gameObject = gameObject;
    }

    SetSize(width?: number, height?: number) {
        this.width = width || this.width;
        this.height = height || this.height;
        if(!this.gameObject) return;
        this.image.width = this.width * this.gameObject.resolution * this.gameObject.scale.x;
        this.image.height = this.height * this.gameObject.resolution * this.gameObject.scale.y;
    }

    SetImageContent(image: HTMLImageElement | string) {
        if(image instanceof Image) {
            this.image = image;
            return;
        }
        if(typeof image !== "string") throw 'unacceptable image content provided';
        const newImage = new Image();
        newImage.onload = e => {
            this.image = newImage;
            this.SetSize();
        }
        newImage.src = image;
    }

    GetImage() {
        return this.image;
    }

    Update() {
        const ctx = this.gameObject.context.ctx;
        this.SetSize();
        const scale = this.gameObject.GetScale();
        const dir = scale.Normalized;
        if(!ctx) return;
        ctx.save();
        ctx.scale(scale.x, scale.y);
        const { x, y } = this.gameObject.worldPosition;
        ctx.drawImage(
            this.image,
            x * dir.x, y * dir.y,
            this.width * this.gameObject.resolution * dir.x,
            this.height * this.gameObject.resolution * dir.y
        );
        ctx.restore();
    }
}

export default GraphicElement;
