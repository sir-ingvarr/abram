import Rigidbody from './Rigidbody';
import {CircleArea} from '../Canvas/GraphicPrimitives/Shapes';
import {RGBAColor, Vector} from '../Classes';
import EventEmitterModule from './EventEmitterModule';
import CollisionsManager from '../Managers/CollisionsManager';
import {ICollider2D, ITransform} from '../../types/GameObject';
import {
	GraphicPrimitive,
	// PrimitiveShape,
	PrimitiveType,
	ShapeDrawMethod,
} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import SpriteRenderer from '../Managers/SpriteRenderer';

type Collider2DParams = {
    rb: Rigidbody,
    shape: CircleArea, // PrimitiveShape,
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
	public parent: ITransform;
	public shape: CircleArea; // PrimitiveShape;
	public connectedRigidbody: Rigidbody;
	private prevState = false;
	private isColliding = false;
	private type: Collider2DType;
	private colliderGraphic: GraphicPrimitive<any>;


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
		this.colliderGraphic = new GraphicPrimitive({
			type: PrimitiveType.Circle,
			shape:	this.shape,
			options: { strokeStyle: new RGBAColor(0, 180).ToHex() },
			layer: 3,
			drawMethod: ShapeDrawMethod.Stroke,
			parent: this.parent
		});
		this.connectedRigidbody = rb;
		this.type = type;
		CollisionsManager.GetInstance().RegisterModule(this);
	}

	Collide(other: Collider2D) {
		if(this.type === Collider2DType.Collider) return this.OnCollision2DEnter(other);
		return this.OnTriggerEnter(other);
	}

	Leave(other: Collider2D) {
		if(this.type === Collider2DType.Collider) return this.OnCollision2DLeave(other);
		return this.OnTriggerLeave(other);
	}

	OnCollision2DEnter(other: Collider2D) {
		if(this.prevState) return;
		this.prevState = this.isColliding;
		this.isColliding = true;
		this.Emit(Collider2DEvent.OnCollision2DEnter, this, other);
	}

	OnCollision2DLeave(other: Collider2D) {
		if(!this.prevState) return;
		this.prevState = this.isColliding;
		this.isColliding = false;
		this.Emit(Collider2DEvent.OnCollision2DLeave, this, other);
	}

	OnTriggerEnter(other: Collider2D) {
		// this.isColliding = true;
		this.Emit(Collider2DEvent.OnTriggerEnter, this, other);
	}

	OnTriggerLeave(other: Collider2D) {
		// this.isColliding = false;
		this.Emit(Collider2DEvent.OnTriggerExit, this, other);
	}

	// IsCollidingOther(other: Collider2D): boolean {
			// const shape = other.shape;
			// return this.shape.IsIntersectingOther(shape);
			// return false;
	// }

	override Destroy() {
		super.Destroy();
		this.Emit(Collider2DEvent.Destroy);
	}

	override Update() {
		super.Update();
		this.shape.Offset = this.parent.WorldPosition;
		this.colliderGraphic.shape = this.shape;
		SpriteRenderer.GetInstance().AddToRenderQueue(this.colliderGraphic);
	}

	get IsColliding() {
		return this.isColliding;
	}

}

export default Collider2D;
