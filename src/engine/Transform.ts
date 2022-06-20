import {Vector} from "./Classes";
import {IGameObject, ITransform} from "../types/GameObject";
import {ICoordinates, Nullable} from "../types/common";

type TransformOptions = {
    lP?: Vector,
    lS?: Vector,
    lR?: number,
    lRDeg?: number,
    parent?: ITransform,
    anchors?: { x: number, y: number }
}

class Transform implements ITransform {
    private localPosition: Vector;
    private worldPosition: Vector;
    private localScale: Vector;
    private scale: Vector;
    private localRotationDeg: number;
    private localRotation: number;
    private rotation: number;
    private rotationDeg: number;
    private parent: Nullable<ITransform>;
    public gameObject: IGameObject;
    public anchors: { x: number, y: number };

    public scaleUpdated: boolean;
    public positionUpdated: boolean;
    public rotationUpdated: boolean;


    constructor(go: IGameObject, params: TransformOptions) {
        const { lP = Vector.Zero, lS = Vector.One, lR, lRDeg, parent = null, anchors = { x: 0.5, y: 0.5 } } = params;
        this.gameObject = go;
        this.parent = parent;
        this.localPosition = lP.Copy();
        this.localScale = lS.Copy();
        if(typeof lR === 'number') this.LocalRotation = lR;
        if(typeof lRDeg === 'number') this.LocalRotationDeg = lRDeg;
        this.anchors = anchors;
        this.worldPosition = parent ? parent.WorldPosition.Add(lP) : lP.Copy();
        this.scale = parent ? Vector.MultiplyCoordinates(parent.Scale, lS) : lS.Copy();
    }
    get Parent(): Nullable<ITransform> {
        return this.parent;
    }

    public SetParent(newParent: Nullable<ITransform>) {
        this.parent = newParent;
        this.LocalPosition = this.localPosition;
        this.LocalScale = this.localScale;
    }

    public SetParentAwarePosition() {
        if(this.parent === null || !this.parent.positionUpdated) return;
        this.worldPosition = this.parent.WorldPosition.Add(this.LocalPosition.MultiplyCoordinates(this.scale.Normalized));
        console.log(this.worldPosition);
    }

    public SetParentAwareScale() {
        if(this.parent === null || !this.parent.scaleUpdated) return;
        this.scale = this.parent.Scale.MultiplyCoordinates(this.localScale);
    }

    public SetParentAwareRotation() {
        if(this.parent === null || !this.parent.rotationUpdated) return;
        this.rotation = this.parent.Rotation + this.localRotation;
        this.rotationDeg = this.parent.RotationDeg + this.localRotationDeg;
    }

    get LocalPosition(): Vector {
        return this.localPosition.Copy();
    }

    set LocalPosition(newLocalPos: Vector) {
        this.localPosition = newLocalPos.Copy();
        this.worldPosition = newLocalPos.Copy();
        this.positionUpdated = true;
    }

    get WorldPosition(): Vector {
        return this.worldPosition.Copy();
    }

    get LocalScale(): Vector {
        return this.localScale.Copy();
    }

    set LocalScale(newLocalScale: Vector) {
        this.localScale = newLocalScale.Copy();
        this.scale = newLocalScale.Copy();
        this.scaleUpdated = true;
    }

    get Scale(): Vector {
        return this.scale.Copy();
    }

    get RotationDeg(): number {
        return this.rotationDeg;
    }

    get Rotation() {
        return this.rotation;
    }

    get LocalRotation() {
        return this.localRotation;
    }

    get LocalRotationDeg() {
        return this.localRotationDeg;
    }

    set LocalRotationDeg(newRotation: number) {
        this.rotationUpdated = true;
        const radians = newRotation * Math.PI / 180;
        this.localRotationDeg = newRotation;
        this.localRotation = radians;
        this.rotationDeg = newRotation;
        this.rotation = radians;
    }

    set LocalRotation(newRotation: number) {
        this.rotationUpdated = true;
        const degrees = newRotation / Math.PI * 180;
        this.localRotationDeg = newRotation;
        this.rotationDeg = newRotation;
        this.localRotation = degrees
        this.rotation = degrees;
    }

    public Translate(amount: ICoordinates): ITransform {
        this.LocalPosition = this.localPosition.Add(amount);
        return this;
    }

    public RotateDeg(amount: number): ITransform {
        this.LocalRotationDeg = this.localRotationDeg + amount;
        return this;
    }

}

export default Transform;