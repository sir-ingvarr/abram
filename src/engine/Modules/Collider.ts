import Rigidbody from './Rigidbody';
import {IShape} from '../../types/common';
import {CircleArea} from '../Canvas/GraphicPrimitives/Shapes';
import {Vector} from '../Classes';
import EventEmitterModule from './EventEmitterModule';
import CollisionsManager from '../Managers/CollisionsManager';
import {ITransform} from '../../types/GameObject';

type Collider2DParams = {
    rb?: Rigidbody,
    shape: IShape,
    type: Collider2DType,
    parent: ITransform,
}

export enum Collider2DEvent {
    OnCollision2DEnter,
    OnCollision2DLeave,
    OnTriggerEnter,
    OnTriggerExit,
    Destroy
}

export enum Collider2DType {
    Trigger,
    Collider
}


class Collider2D extends EventEmitterModule {
	public parent: ITransform;
	public shape: IShape;
	private isColliding = false;
	private type: Collider2DType;


	constructor(params: Collider2DParams) {
		super({name: 'Collider2D'});
		this.parent = params.parent;
		const parentPos = this.parent.WorldPosition;
		const {
			shape = new CircleArea(10, new Vector(0,0), parentPos), type = Collider2DType.Collider
		} = params;
		this.shape = shape;
		this.type = type;
		CollisionsManager.GetInstance().RegisterModule(this);
	}

	Collide(other: Collider2D) {
		if(this.type === Collider2DType.Collider) return this.OnCollision2DEnter(other);
		return this.OnTriggerEnter(other);
	}

	Leave(other: Collider2D) {
		if(this.type === Collider2DType.Collider) return this.OnCollision2DLeave();
		return this.OnTriggerLeave(other);
	}

	OnCollision2DEnter(other: Collider2D) {
		this.isColliding = true;
		this.Emit(Collider2DEvent.OnCollision2DEnter, this, other);
	}

	OnCollision2DLeave() {
		this.isColliding = true;
		this.Emit(Collider2DEvent.OnCollision2DLeave, this);
	}

	OnTriggerEnter(other: Collider2D) {
		this.isColliding = true;
		this.Emit(Collider2DEvent.OnCollision2DEnter, this, other);
	}

	OnTriggerLeave(other: Collider2D) {
		this.isColliding = false;
		this.Emit(Collider2DEvent.OnCollision2DLeave, this, other);
	}

	IsCollidingOther(other: Collider2D): boolean {
		const shape = other.shape;
		return this.shape.IsIntersectingOther(shape);
	}

	Destroy() {
		super.Destroy();
		this.Emit(Collider2DEvent.Destroy);
	}

	Update() {
		super.Update();
		this.shape.Offset = this.parent.WorldPosition;
	}

	Start() {
		super.Start();
	}
}

export default Collider2D;
