import CanvasContext2D from "../Canvas/Context2d";
import {RGBAColor, Stack} from "../Classes";
import Sprite from "../Modules/Sprite";
import {IStack} from "../../types/Iterators";
import {GraphicPrimitive, IGraphicPrimitive} from "../Canvas/GraphicPrimitives/GraphicPrimitive";

type Graphic = Sprite | GraphicPrimitive<any, any>

class SpriteRenderer {
    private context: CanvasContext2D;
    private renderingStackList: Array<IStack<Sprite | IGraphicPrimitive>> = [];
    private static instance: SpriteRenderer;

    constructor(context: CanvasContext2D) {
        this.context = context;
        SpriteRenderer.instance = this;
    }

    public static GetInstance(context?: CanvasContext2D): SpriteRenderer {
        if(!SpriteRenderer.instance) {
            if(!context) throw `no instance of ${this.constructor.name} was found. cannot create a new one without CanvasContext2D`;
            return new SpriteRenderer(context);
        }
        return SpriteRenderer.instance;
    }

    public AddToRenderQueue(graphic: Sprite | IGraphicPrimitive) {
        const { layer } = graphic;
        const layerStack = this.renderingStackList[layer];
        if(!layerStack) {
            this.renderingStackList[layer] = new Stack<Sprite | IGraphicPrimitive>({ data: [graphic] });
            return;
        }
        this.renderingStackList[layer].Push(graphic);
    }

    private RenderElement(graphic: Sprite | IGraphicPrimitive) {
        const {
            parent: {
                WorldPosition: worldPosition,
                Scale: scale,
                Rotation: rotation,
                anchors
            }
        } = graphic;

        const {x, y} = worldPosition;
        const dir = scale.ToBinary();
        let width = 1;
        let height = 1;

        this.context
            .Save()
            .ContextRespectivePosition(false);

            let anchoredX = 0;
            let anchoredY = 0;
            if(graphic instanceof Sprite) {
                width = graphic.width;
                height = graphic.height;
                if (!graphic.image.Data) return;
                anchoredX = anchors.x * width;
                anchoredY = anchors.y * height;
            }
            this.context.Translate(x + anchoredX, y + anchoredY);


            this.context
                .Rotate(rotation * dir.x * dir.y)
                .SetScale(scale.x, scale.y);
            if(graphic instanceof Sprite) {
                this.context.DrawImage(graphic.image.Data, -anchoredX , -anchoredY, width, height);
            } else {
                this.context.Draw(graphic);
            }

        this.context
            // .ContextRespectivePosition(false)
            // .StrokeStyle(new RGBAColor(0, 120).ToHex())
            // .StrokeRect(0, 0, 1, 1)
            // .StrokeRect(-anchoredX, -anchoredY, width + anchoredX, height + anchoredY)
            .Restore();
    }

    public Render() {
        for(let i = 0; i < this.renderingStackList.length; i++) {
            const layerStack = this.renderingStackList[i];
            if(!layerStack) {
                // this.renderingStackList[i] = new Stack<Sprite>({data: []});
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