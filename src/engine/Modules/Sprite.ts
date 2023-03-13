import Module from "../Module";
import {IBasicObject, IGameObject} from "../../types/GameObject";
import SpriteRenderer from "../Managers/SpriteRenderer";
import ImageWrapper from "./ImageWrapper";

class Sprite extends Module {
    public width: number;
    public height: number;
    public image: ImageWrapper;
    public gameObject: IBasicObject;
    public layer: number;

    constructor(params: { image: ImageWrapper, width?: number, height?: number, layer?: number, gameObject?: IBasicObject}) {
        super({name: 'SpriteRenderer'});
        const { width = 100, height = 100, layer = 0, image } = params;
        this.layer = layer;
        this.image = image;
        this.SetSize(width, height);
    }

    SetGameObject(gameObject: IGameObject) {
        this.gameObject = gameObject;
        this.SetSize()
    }

    SetSize(width?: number, height?: number) {
        this.width = width || this.width;
        this.height = height || this.height;
        if(!this.gameObject || !this.image.isReady) return;
        const { Scale: scale } = this.gameObject.transform;
        this.image.Data.width = this.width * scale.x;
        this.image.Data.height = this.height * scale.y;
    }

    get Image(): HTMLImageElement {
        return this.image.Data;
    }

    Update(): void {
        this.SetSize();
        SpriteRenderer.AddToRenderQueue(this);
    }
}

export default Sprite;
