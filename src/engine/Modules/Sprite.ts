import Module from "../Module";
import {IGameObject} from "../../types/GameObject";
import {Rect} from "../Primitives/Primitive";
import {Point, RGBAColor, Segment} from "../Classes";

class Sprite extends Module {
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
        const { scale } = this.gameObject;
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
        const { context: { ctx }, worldPosition, scale } = this.gameObject;
        this.SetSize();
        const dir = scale.Normalized;
        if(!ctx) return;
        ctx.save();
        ctx.scale(dir.x, dir.y);
        const { x, y } = worldPosition;
        ctx.drawImage(
            this.image,
            x * dir.x, y * dir.y,
            this.width * scale.x,
            this.height * scale.y
        );
        ctx.restore();
        const pos2 = new Point(this.width * Math.abs(scale.x), this.height * Math.abs(scale.y));
        const spriteBorder = new Rect(new Segment(worldPosition, pos2), { strokeStyle: new RGBAColor(0, 120).toString() })
        this.gameObject.context.DrawRect(spriteBorder, 1)
    }
}

export default Sprite;
