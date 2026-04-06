import Rigidbody from './Rigidbody';
import {CircleArea} from '../Canvas/GraphicPrimitives/Shapes';
import {Vector} from '../Classes';
import EventEmitterModule from './EventEmitterModule';
import CollisionsManager from '../Managers/CollisionsManager';
import {ICollider2D, ITransform} from '../../types/GameObject';
import {ColliderShape, OBBShape} from '../Collision/CollisionDetection';
import Debug from '../Debug/Debug';

type Collider2DParams = {
    rb: Rigidbody,
    shape: ColliderShape,
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


class Collider2D extends EventEmitterModule implements ICollider2D {
	static override readonly dependencies = [Rigidbody];
	static override readonly canBeDuplicated = false;

	public parent: ITransform;
	public shape: ColliderShape;
	public connectedRigidbody: Rigidbody;
	private activeContacts: Set<string> = new Set();
	private type: Collider2DType;


	constructor(params: Collider2DParams) {
		super({name: 'Collider2D'});
		this.parent = params.parent;
		const parentPos = this.parent.WorldPosition;
		const {
			shape = new CircleArea(10, new Vector(0,0), parentPos),
			type = Collider2DType.Collider,
			rb,
		} = params;

		this.shape = shape;
		this.connectedRigidbody = rb;
		this.type = type;

		if(rb.material?.density) {
			rb.ApplyDensityFromArea(shape instanceof OBBShape ? shape.Area : (shape as CircleArea).Area);
		}

		CollisionsManager.GetInstance().RegisterModule(this);
	}

	private drawDebugGizmo() {
		if(!Debug.Enabled) return;
		if(this.shape instanceof OBBShape) {
			const corners = this.shape.GetCorners();
			for(let i = 0; i < 4; i++) {
				Debug.DrawLine(corners[i], corners[(i + 1) % 4], Debug.Colors.collider);
			}
		} else {
			const circle = this.shape as CircleArea;
			Debug.DrawCircle(circle.Center, circle.radius, Debug.Colors.collider);
		}
	}

	Collide(other: Collider2D) {
		if(!other.IsWaitingDestroy) {
			this.activeContacts.add(other.Id);
		}
		if(this.type === Collider2DType.Collider) {
			this.Emit(Collider2DEvent.OnCollision2DEnter, this, other);
		} else {
			this.Emit(Collider2DEvent.OnTriggerEnter, this, other);
		}
	}

	Leave(other: Collider2D) {
		this.activeContacts.delete(other.Id);
		if(this.type === Collider2DType.Collider) {
			this.Emit(Collider2DEvent.OnCollision2DLeave, this, other);
		} else {
			this.Emit(Collider2DEvent.OnTriggerExit, this, other);
		}
	}

	override Destroy() {
		super.Destroy();
		this.Emit(Collider2DEvent.Destroy);
	}

	SyncShape() {
		const worldPos = this.parent.WorldPosition;
		if (this.shape instanceof OBBShape) {
			this.shape.Offset = worldPos;
			this.shape.Rotation = this.parent.WorldRotation;
		} else {
			(this.shape as CircleArea).Offset = worldPos;
		}
	}

	override Update() {
		super.Update();
		this.SyncShape();
		this.drawDebugGizmo();
	}

	get IsColliding() {
		return this.activeContacts.size > 0;
	}

}

export default Collider2D;
