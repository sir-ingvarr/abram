import {IBasicObject, ITransform} from '../../types/GameObject';
import {ICoordinates} from '../../types/common';
import Module, {ModuleConstructorParams} from '../Modules/Module';
import {Vector} from '../Classes';
import CanvasContext2D from '../Canvas/Context2d';
import Transform from './Transform';

export type BasicObjectsConstructorParams = ModuleConstructorParams & {
	position?: ICoordinates,
	scale?: ICoordinates,
	rotation?: number,
	rotationDeg?: number,
}

abstract class BasicObject extends Module implements IBasicObject {
	public transform: ITransform;

	protected constructor(params: BasicObjectsConstructorParams) {
		const { position = new Vector(), scale = Vector.One, rotation = 0, rotationDeg } = params;
		super(params);
		this.transform = new Transform(this, {
			localPosition: position,
			localScale: scale,
			localRotation: rotation,
			localRotationDegrees: rotationDeg
		});
	}

	override set Context(ctx: CanvasContext2D) {
		this.context = ctx;
	}

	override get Context() {
		return this.context || this.transform.Parent?.gameObject?.Context as CanvasContext2D;
	}
}

export default BasicObject;