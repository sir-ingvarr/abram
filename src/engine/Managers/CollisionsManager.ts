import {ExecutableManager} from './ExecutableManager';
import {ICollider2D} from '../../types/GameObject';
import Collider2D, {Collider2DEvent} from '../Modules/Collider';
import {Vector} from '../Classes';

class CollisionsManager extends ExecutableManager {
	protected override readonly modules: Map<string, ICollider2D>;
	private static instance: CollisionsManager;

	constructor(params: { modules: Array<ICollider2D> }) {
		super(params);
		CollisionsManager.instance = this;
	}

	public static GetInstance(): CollisionsManager {
		if(!CollisionsManager.instance) {
			return new CollisionsManager({ modules: [] });
		}
		return CollisionsManager.instance;
	}

	override RegisterModule(module: Collider2D): string {
		super.RegisterModule(module);
		module.On(Collider2DEvent.Destroy, () => this.UnregisterModuleById(module.Id));
		return module.Id;
	}

	private CollisionResponse(collider1: ICollider2D, collider2: ICollider2D, penetrationDepth: number) {
		const rb1 = collider1.connectedRigidbody;
		const rb2 = collider2.connectedRigidbody;
		const velocity1 = rb1.Velocity;
		const velocity2 = rb2.Velocity;

		const relativeVelocity = Vector.Subtract(velocity2, velocity1);
		const collisionNormal = Vector.Subtract(
			collider2.connectedRigidbody.PrevPosition,
			collider1.connectedRigidbody.PrevPosition,
		).Normalized;

		const velocityAlongNormal = Vector.Dot(relativeVelocity, collisionNormal);
		// if(velocityAlongNormal > 0) {
		// 	collisionNormal.MultiplyCoordinates(-1);
		// 	velocityAlongNormal = Vector.Dot(relativeVelocity, collisionNormal);
		// }

		const restitution = (rb1.Bounciness + rb2.Bounciness) / 2;
		const j = -(1 + restitution) * velocityAlongNormal / (rb1.InvertedMass + rb2.InvertedMass);

		const impulse = Vector.MultiplyCoordinates(j, collisionNormal);
		rb1.AddForce(Vector.MultiplyCoordinates(-1, impulse));
		rb2.AddForce(impulse);

		const percent = 0.95;
		const slop = 0.01;

		const correctionMagnitude = Math.max(-penetrationDepth - slop, 0) * percent;
		const correction = Vector.MultiplyCoordinates(correctionMagnitude, collisionNormal);

		const transform1 = rb1.gameObject?.transform;
		if(!transform1) return;
		const transform2 = rb2.gameObject?.transform;
		if(!transform2) return;
		transform1.LocalPosition = transform1.LocalPosition.Subtract(Vector.MultiplyCoordinates(rb1.InvertedMass, correction));
		transform2.LocalPosition = transform2.LocalPosition.Add(Vector.MultiplyCoordinates(rb2.InvertedMass, correction));

		collider1.Collide(collider2);
		collider2.Collide(collider1);
	}

	override Update() {
		super.Update();
		const arr = Array.from(this.modules);
		for(let i = 0; i < arr.length; i++) {
			const collider1 = arr[i][1];
			if(!collider1.parent?.gameObject.active) continue;
			for(let j = i + 1; j < arr.length; j++) {
				const collider2 = arr[j][1];
				if(!collider2.parent?.gameObject.active) continue;
				if(collider1.shape.IsIntersectingOther(collider2.shape)) {
					const depth = collider1.shape.GetCollisionDepth(collider2.shape);
					this.CollisionResponse(collider1, collider2, depth);
				} else {
					collider1.Leave(collider2);
					collider2.Leave(collider1);
				}
			}
		}
	}

}

export default CollisionsManager;
