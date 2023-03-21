import {Vector} from "../Classes";
import {IBasicObject, IGameObject, ITransform} from "../../types/GameObject";
import {ICoordinates, Nullable} from "../../types/common";

type TransformOptions = {
    localPosition?: Vector,
    localScale?: Vector,
    localRotation?: number,
    localRotationDegrees?: number,
    parent?: ITransform,
    anchors?: { x: number, y: number }
}

class Transform implements ITransform {
    private localPosition: Vector;
    private localScale: Vector;
    private localRotationDeg: number;
    private localRotation: number;
    private rotation: number;
    private rotationDeg: number;
    private parent: Nullable<ITransform>;
    public gameObject: IGameObject | IBasicObject;
    public anchors: { x: number, y: number };

    constructor(go: IGameObject | IBasicObject, params: TransformOptions) {
        const { localPosition = Vector.Zero, localScale = Vector.One, localRotation, localRotationDegrees, parent = null, anchors = { x: 0.5, y: 0.5 } } = params;
        this.gameObject = go;
        this.parent = parent;
        this.localPosition = localPosition.Copy();
        this.localScale = localScale.Copy();
        if(typeof localRotationDegrees === 'number') this.LocalRotationDeg = localRotationDegrees;
        else if(typeof localRotation === 'number') this.LocalRotation = localRotation;
        this.anchors = anchors;
    }
    get Parent(): Nullable<ITransform> {
        return this.parent;
    }

    set Parent(newParent: Nullable<ITransform>) {
        this.parent = newParent;
    }

    get LocalPosition(): Vector {
        return this.localPosition.Copy();
    }

    set LocalPosition(newLocalPos: Vector) {
        this.localPosition = newLocalPos.Copy();
    }

    get WorldPosition(): Vector {
        if(this.parent) return this.parent.WorldPosition.Add(Vector.MultiplyCoordinates(this.localPosition, this.Scale.ToBinary()));
        return this.localPosition.Copy();
    }

    get LocalScale(): Vector {
        return this.localScale.Copy();
    }

    set LocalScale(newLocalScale: Vector) {
        this.localScale = newLocalScale.Copy();
    }

    get Scale(): Vector {
        if(!this.parent) return this.LocalScale;
        return this.parent.Scale.MultiplyCoordinates(this.localScale);
    }

    get LocalRotation() {
        return this.localRotation;
    }

    get LocalRotationDeg() {
        return this.localRotationDeg;
    }

    set LocalRotationDeg(newRotation: number) {
        const radians = newRotation * Math.PI / 180;
        this.localRotationDeg = newRotation;
        this.localRotation = radians;
    }

    set LocalRotation(newRotation: number) {
        const degrees = newRotation / Math.PI * 180;
        this.localRotationDeg = newRotation;
        this.localRotation = degrees
    }

    get Rotation(): number {
        if(this.parent) return this.parent.Rotation + this.localRotation;
        return this.localRotation;
    }

    get RotationDeg(): number {
        if(this.parent) return this.parent.RotationDeg + this.localRotationDeg;
        return this.localRotationDeg;
    }

    public Translate(amount: ICoordinates): ITransform {
        this.localPosition.Add(amount);
        return this;
    }

    public RotateDeg(amount: number): ITransform {
        this.LocalRotationDeg = this.localRotationDeg + amount;
        return this;
    }

}

export default Transform;