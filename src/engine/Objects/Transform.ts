import {Vector} from '../Classes';
import {IGameObject, ITransform} from '../../types/GameObject';
import {ICoordinates, IPoint, Nullable} from '../../types/common';
import BasicObject from './BasicObject';

type TransformOptions = {
    localPosition?: ICoordinates,
    localScale?: ICoordinates,
    localRotation?: number,
    localRotationDegrees?: number,
    parent?: ITransform,
    anchors?: { x: number, y: number }
}

const DEG_TO_RAD = Math.PI / 180;

class Transform implements ITransform {
	private localPosition: ICoordinates;
	private localScale: ICoordinates;
	private localRotationDeg: number;
	private localRotation: number;
	private parent: Nullable<ITransform>;
	public gameObject: IGameObject | BasicObject;
	private anchors: { x: number, y: number };

	constructor(go: IGameObject | BasicObject, params: TransformOptions) {
		const {
			localPosition = Vector.Zero,
			localScale = Vector.One,
			localRotation,
			localRotationDegrees,
			parent = null,
			anchors = { x: 0.5, y: 0.5 } } = params;
		this.gameObject = go;
		this.parent = parent;
		this.localPosition = localPosition.Copy();
		this.localScale = localScale.Copy();
		if(typeof localRotationDegrees === 'number') this.LocalRotationDeg = localRotationDegrees;
		else if(typeof localRotation === 'number') this.LocalRotation = localRotation;
		this.anchors = anchors;
	}

	get Anchors() {
		return Object.assign({}, this.anchors);
	}

	set Anchors(newVal: IPoint) {
		this.anchors = { x: newVal.x, y: newVal.y };
	}

	get Parent(): Nullable<ITransform> {
		return this.parent;
	}

	set Parent(newParent: Nullable<ITransform>) {
		this.parent = newParent;
	}

	get LocalPosition(): Vector {
		return Vector.From(this.localPosition);
	}

	set LocalPosition(newLocalPos: Vector) {
		this.localPosition = newLocalPos.Copy();
	}

	get WorldPosition(): Vector {
		let position = this.localPosition.ToVector();
		let current = this.parent;

		while (current) {
			position = Vector.MultiplyCoordinates(position, current.LocalScale);
			const flipX = current.LocalScale.x < 0;
			const flipY = current.LocalScale.y < 0;
			position = position.Rotate(current.LocalRotation * (flipX !== flipY ? -1 : 1));
			position = position.Add(current.LocalPosition);
			current = current.Parent;
		}

		return position;
	}

	get WorldRotation(): number {
		if(!this.parent) return this.localRotation;
		return this.localRotation + this.parent.WorldRotation;
	}

	get LocalScale(): Vector {
		return Vector.From(this.localScale);
	}

	set LocalScale(newLocalScale: Vector) {
		this.localScale = newLocalScale.Copy();
	}

	get Scale(): Vector {
		if(!this.parent) return this.LocalScale;
		return Vector.MultiplyCoordinates(this.parent.Scale, this.localScale);
	}

	get LocalRotation() {
		return this.localRotation;
	}

	set LocalRotation(newRotation: number) {
		const degrees = newRotation / DEG_TO_RAD;
		this.localRotationDeg = degrees;
		this.localRotation = newRotation;
	}

	get LocalRotationDeg() {
		return this.localRotationDeg;
	}

	set LocalRotationDeg(newRotation: number) {
		const radians = newRotation * DEG_TO_RAD;
		this.localRotationDeg = newRotation;
		this.localRotation = radians;
	}

	public Translate(amount: ICoordinates): ITransform {
		this.localPosition.Set(this.localPosition.x + amount.x, this.localPosition.y + amount.y);
		return this;
	}

	public RotateDeg(amount: number): ITransform {
		this.LocalRotationDeg = this.localRotationDeg + amount;
		return this;
	}

}

export default Transform;