import {IBasicObject, ITransform} from "../types/GameObject";
import {Dictionary} from "../types/common";
import Module from "./Module";
import {Vector} from "./Classes";
import CanvasContext2D from "./Context2d";
import Transform from "./Transform";


abstract class BasicObject extends Module implements IBasicObject {
    public transform: ITransform;
    protected needDestroy: boolean;

    protected constructor(params: Dictionary) {
        const { position = new Vector(), scale = Vector.One, rotation = 0, rotationDeg } = params;
        super({} );
        this.transform = new Transform(this, {
            localPosition: position,
            localScale: scale,
            localRotation: rotation,
            localRotationDegrees: rotationDeg
        });
        this.needDestroy = false;
    }

    Update() {
        this.transform.scaleUpdated = false;
        this.transform.positionUpdated = false;
        this.transform.rotationUpdated = false;
    }

    set Context(ctx: CanvasContext2D) {
        this.context = ctx;
    }

    get IsWaitingDestroy(): boolean {
        return this.needDestroy;
    }

    Destroy() {
        this.needDestroy = true;
    }
}

export default BasicObject;