import Rigidbody from './Rigidbody';
import {CircleArea, Rect} from '../Canvas/GraphicPrimitives/Shapes';
import {Point, RGBAColor, Vector} from '../Classes';
import EventEmitterModule from './EventEmitterModule';
import CollisionsManager from '../Managers/CollisionsManager';
import {ICollider2D, ITransform} from '../../types/GameObject';
import {
	GraphicPrimitive,
	PrimitiveType,
	ShapeDrawMethod,
} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import SpriteRenderer from '../Managers/SpriteRenderer';
import {ColliderShape, OBBShape} from '../Collision/CollisionDetection';

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
	public parent: ITransform;
	public shape: ColliderShape;
	public connectedRigidbody: Rigidbody;
	private activeContacts: Set<string> = new Set();
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
		this.connectedRigidbody = rb;
		this.type = type;
		this.colliderGraphic = this.createColliderGraphic(shape);

		CollisionsManager.GetInstance().RegisterModule(this);
	}

	private createColliderGraphic(shape: ColliderShape): GraphicPrimitive<any> {
		if (shape instanceof OBBShape) {
			return new GraphicPrimitive({
				type: PrimitiveType.Rect,
				shape: new Rect(
					new Point(),
					new Point(shape.halfWidth * 2, shape.halfHeight * 2),
				),
				options: { strokeStyle: new RGBAColor(0, 180).ToHex() },
				layer: 3,
				drawMethod: ShapeDrawMethod.Stroke,
				parent: this.parent
			});
		}

		return new GraphicPrimitive({
			type: PrimitiveType.Circle,
			shape: this.shape as CircleArea,
			options: { strokeStyle: new RGBAColor(0, 180).ToHex() },
			layer: 3,
			drawMethod: ShapeDrawMethod.Stroke,
			parent: this.parent
		});
	}

	Collide(other: Collider2D) {
		this.activeContacts.add(other.Id);
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
		if(SpriteRenderer.GetInstance().Debug) {
			SpriteRenderer.GetInstance().AddToRenderQueue(this.colliderGraphic);
		}
	}

	get IsColliding() {
		return this.activeContacts.size > 0;
	}

}

export default Collider2D;
