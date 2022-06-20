import CanvasContext2D from "../Context2d";
import {Point, RGBAColor, Segment, Stack, Vector} from "../Classes";
import {Rect} from "../GraphicPrimitives/GraphicPrimitive";
import Sprite from "../Modules/Sprite";
import {IStack} from "../../types/Iterators";

class SpriteRenderer {
    private context: CanvasContext2D;
    private ctx: CanvasRenderingContext2D;
    private static renderingStackList: Array<IStack<Sprite>> = [];

    constructor(context: CanvasContext2D) {
        this.context = context;
        this.ctx = context.ctx;
    }

    public static AddToRenderQueue(graphic: Sprite) {
        const { layer } = graphic;
        const layerStack = SpriteRenderer.renderingStackList[layer];
        if(!layerStack) {
            this.renderingStackList[layer] = new Stack<Sprite>({ data: [graphic] });
            return;
        }
        this.renderingStackList[layer].Push(graphic);
    }

    private RenderElement(graphic: Sprite) {
        const {
            gameObject: {
                name,
                transform: {
                    WorldPosition: worldPosition,
                    Scale: scale,
                    Rotation: rotation,
                    anchors
                }
            }, width, height, image
        } = graphic;
        // if(name === 'Man1_gun')
        // console.log(name, scale, localPosition);
        const { x, y } = worldPosition;

        const dir = scale.Normalized;
        const anchoredX = width * anchors.x;
        const anchoredY = height * anchors.y;
        this.ctx.save();
        this.ctx.translate(x + anchoredX, y + anchoredY);
        this.ctx.rotate(rotation * dir.x * dir.y);
        this.ctx.scale(scale.x, scale.y);
        this.ctx.drawImage(
            image,
            -anchoredX, -anchoredY,
            width,
            height
        );



        const centerDot = new Rect(
            new Segment(
                Vector.Zero,
                Vector.One
            ), { fillStyle: new RGBAColor(255, 0, 0).toString() }
        );
        this.context.DrawRect(centerDot, 1);
        const pos2 = new Point(width, height);
        const spriteBorder = new Rect(new Segment(new Vector(-anchoredX, -anchoredY), pos2), { strokeStyle: new RGBAColor(0, 120).toString() })
        this.context.DrawRect(spriteBorder, 1)
        this.ctx.restore();

    }

    public Render() {
        for(let i = 0; i < SpriteRenderer.renderingStackList.length; i++) {
            const layerStack = SpriteRenderer.renderingStackList[i];
            if(!layerStack) {
                SpriteRenderer.renderingStackList[i] = new Stack<Sprite>({data: []});
                continue;
            }
            while(layerStack.Count) {
                const sprite = layerStack.Pop();
                this.RenderElement(sprite);
            }
        }
    }
}

export default SpriteRenderer;