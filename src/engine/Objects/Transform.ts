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
			localRotation = 0,
			localRotationDegrees,
			parent = null,
			anchors = { x: 0.5, y: 0.5 } } = params;
		this.gameObject = go;
		this.parent = parent;
		this.localPosition = Vector.From(localPosition);
		this.localScale = Vector.From(localScale);
		this.localRotation = 0;
		this.localRotationDeg = 0;
		if(typeof localRotationDegrees === 'number') this.LocalRotationDeg = localRotationDegrees;
		else if(localRotation !== 0) this.LocalRotation = localRotation;
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
		if(newParent) {
			let current: Nullable<ITransform> = newParent;
			while(current) {
				if(current === (this as ITransform)) {
					console.error('Transform: circular parent chain detected, assignment rejected');
					return;
				}
				current = current.Parent;
			}
		}
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
		let rotation = this.localRotation;
		let current: Nullable<ITransform> = this.parent;
		while (current) {
			const parentScale = current instanceof Transform ? current.localScale : current.LocalScale;
			const flipX = parentScale.x < 0;
			const flipY = parentScale.y < 0;
			rotation = current.LocalRotation + rotation * (flipX !== flipY ? -1 : 1);
			current = current.Parent;
		}
		return rotation;
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

	public Rotate(amountRad: number): ITransform {
		this.localRotation += amountRad;
		this.localRotationDeg = this.localRotation / DEG_TO_RAD;
		return this;
	}

	public RotateDeg(amount: number): ITransform {
		this.LocalRotationDeg = this.localRotationDeg + amount;
		return this;
	}

	public LookAt(target: ICoordinates): ITransform {
		const worldPos = this.WorldPosition;
		this.LocalRotation = Math.atan2(target.y - worldPos.y, target.x - worldPos.x);
		return this;
	}

	public TransformPoint(localPoint: ICoordinates): Vector {
		const cos = Math.cos(this.WorldRotation);
		const sin = Math.sin(this.WorldRotation);
		const scale = this.Scale;
		const worldPos = this.WorldPosition;
		return new Vector(
			worldPos.x + (localPoint.x * scale.x * cos - localPoint.y * scale.y * sin),
			worldPos.y + (localPoint.x * scale.x * sin + localPoint.y * scale.y * cos),
		);
	}

	public InverseTransformPoint(worldPoint: ICoordinates): Vector {
		const cos = Math.cos(-this.WorldRotation);
		const sin = Math.sin(-this.WorldRotation);
		const scale = this.Scale;
		const worldPos = this.WorldPosition;
		const deltaX = worldPoint.x - worldPos.x;
		const deltaY = worldPoint.y - worldPos.y;
		return new Vector(
			(deltaX * cos - deltaY * sin) / scale.x,
			(deltaX * sin + deltaY * cos) / scale.y,
		);
	}

	get Right(): Vector {
		const worldRotation = this.WorldRotation;
		const scale = this.Scale;
		const signX = scale.x < 0 ? -1 : 1;
		const signY = scale.y < 0 ? -1 : 1;
		const direction = new Vector(signX * Math.cos(worldRotation), signY * Math.sin(worldRotation));
		return direction.Magnitude > 0 ? direction.SetMagnitude(1) : direction;
	}

	get Left(): Vector {
		const right = this.Right;
		return new Vector(-right.x, -right.y);
	}

	get Up(): Vector {
		const worldRotation = this.WorldRotation;
		const scale = this.Scale;
		const signX = scale.x < 0 ? -1 : 1;
		const signY = scale.y < 0 ? -1 : 1;
		const direction = new Vector(-signX * Math.sin(worldRotation), signY * Math.cos(worldRotation));
		return direction.Magnitude > 0 ? direction.SetMagnitude(1) : direction;
	}

	get Down(): Vector {
		const up = this.Up;
		return new Vector(-up.x, -up.y);
	}

}

export default Transform;