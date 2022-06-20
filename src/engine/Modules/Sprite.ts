import Module from "../Module";
import {IGameObject} from "../../types/GameObject";
import SpriteRenderer from "../Managers/SpriteRenderer";

class Sprite extends Module {
    public width: number;
    public height: number;
    public image: HTMLImageElement;
    public gameObject: IGameObject;
    public layer: number;

    constructor(params: { url: string, width: number, height: number, layer: number}) {
        super();
        const { url, width, height, layer = 0 } = params;
        this.layer = layer;
        this.image = new Image();
        this.SetSize(width, height);
        this.SetImageContent(url);
    }

    SetGameObject(gameObject: IGameObject) {
        this.gameObject = gameObject;
    }

    SetSize(width?: number, height?: number) {
        this.width = width || this.width;
        this.height = height || this.height;
        if(!this.gameObject) return;
        const { Scale: scale } = this.gameObject.transform;
        this.image.width = this.width * scale.x;
        this.image.height = this.height * scale.y;
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

    get Image(): HTMLImageElement {
        return this.image;
    }

    Update(): void {
        this.SetSize();
        SpriteRenderer.AddToRenderQueue(this);
    }
}

export default Sprite;
