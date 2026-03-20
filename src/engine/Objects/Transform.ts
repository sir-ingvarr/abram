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
	private localPosition: Vector;
	private localScale: Vector;
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
		this.localPosition = Vector.From(localPosition);
		this.localScale = Vector.From(localScale);
		if(typeof localRotationDegrees === 'number') this.LocalRotationDeg = localRotationDegrees;
		else if(typeof localRotation === 'number') this.LocalRotation = localRotation;
		this.anchors = anchors;
	}

	get Anchors() {
		return this.anchors;
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

	get LocalPositionMutable(): Vector {
		return this.localPosition;
	}

	get WorldPosition(): Vector {
		const position = new Vector(this.localPosition.x, this.localPosition.y);
		let current: Nullable<ITransform> = this.parent;

		while (current !== null) {
			const parentLocalScale = current.LocalScaleMutable;
			const parentLocalPosition = current.LocalPositionMutable;
			const parentLocalRotation = current.LocalRotation;
			position.MultiplyCoordinates(parentLocalScale);
			const flipX = parentLocalScale.x < 0;
			const flipY = parentLocalScale.y < 0;
			const rotation = parentLocalRotation * (flipX !== flipY ? -1 : 1);
			const cos = Math.cos(rotation);
			const sin = Math.sin(rotation);
			const rx = position.x * cos - position.y * sin;
			const ry = position.x * sin + position.y * cos;
			position.x = rx + parentLocalPosition.x;
			position.y = ry + parentLocalPosition.y;
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

	get LocalScaleMutable(): Vector {
		return this.localScale;
	}

	get Scale(): Vector {
		if(!this.parent) return new Vector(this.localScale.x, this.localScale.y);
		const ps = this.parent.Scale;
		return new Vector(ps.x * this.localScale.x, ps.y * this.localScale.y);
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