import Module from "./Module";
import SpriteRenderer from "../Managers/SpriteRenderer";
import ImageWrapper from "./ImageWrapper";
import {ITransform} from "../../types/GameObject";

class Sprite extends Module {
    public width: number;
    public height: number;
    public image: ImageWrapper;
    public parent: ITransform;
    public layer: number;

    constructor(params: { image: ImageWrapper, width?: number, height?: number, layer?: number}) {
        super({name: 'SpriteRenderer'});
        const { width = 100, height = 100, layer = 0, image } = params;
        this.layer = layer;
        this.image = image;
        this.width = width;
        this.height = height;
    }


    get Image(): HTMLImageElement {
        return this.image.Data;
    }

    Update(): void {
        SpriteRenderer.GetInstance().AddToRenderQueue(this);
    }
}

export default Sprite;
