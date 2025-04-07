import Rigidbody from './Rigidbody';
import {CircleArea} from '../Canvas/GraphicPrimitives/Shapes';
import {RGBAColor, Vector} from '../Classes';
import EventEmitterModule from './EventEmitterModule';
import CollisionsManager from '../Managers/CollisionsManager';
import {ITransform} from '../../types/GameObject';
import {
	GraphicPrimitive,
	PrimitiveShape,
	PrimitiveType,
	ShapeDrawMethod,
} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import SpriteRenderer from '../Managers/SpriteRenderer';

type Collider2DParams = {
    rb?: Rigidbody,
    shape: PrimitiveShape,
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
	public shape: PrimitiveShape;
	private prevState = false;
	private isColliding = false;
	private type: Collider2DType;
	private colliderGraphic: GraphicPrimitive<any>;


	constructor(params: Collider2DParams) {
		super({name: 'Collider2D'});
		this.parent = params.parent;
		const parentPos = this.parent.WorldPosition;
		const {
			shape = new CircleArea(10, new Vector(0,0), parentPos), type = Collider2DType.Collider
		} = params;
		this.shape = shape;
		this.colliderGraphic = new GraphicPrimitive({
			type: PrimitiveType.Circle,
			shape:	this.shape,
			options: { strokeStyle: new RGBAColor(0, 180).ToHex() },
			layer: 5,
			drawMethod: ShapeDrawMethod.Stroke,
			parent: this.parent
		});
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
		if(this.prevState) return;
		this.prevState = false;
		this.isColliding = true;
		this.Emit(Collider2DEvent.OnCollision2DEnter, this, other);
	}

	OnCollision2DLeave() {
		if(!this.prevState) return;
		this.prevState = true;
		this.isColliding = false;
		this.Emit(Collider2DEvent.OnCollision2DLeave, this);
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
		// this.shape.Offset = this.parent.WorldPosition;
		this.colliderGraphic.shape = this.shape;
		SpriteRenderer.GetInstance().AddToRenderQueue(this.colliderGraphic);
	}

	get IsColliding() {
		return this.isColliding;
	}

}

export default Collider2D;
