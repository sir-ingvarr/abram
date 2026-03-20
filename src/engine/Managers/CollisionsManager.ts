import {ExecutableManager} from './ExecutableManager';
import {ICollider2D} from '../../types/GameObject';
import Collider2D, {Collider2DEvent} from '../Modules/Collider';
import {Vector} from '../Classes';
import {detectCollision} from '../Collision/CollisionDetection';

const LEAVE_GRACE_FRAMES = 3;

class CollisionsManager extends ExecutableManager {
	protected override readonly modules: Map<string, ICollider2D>;
	private static instance: CollisionsManager;
	private activePairs: Map<string, number> = new Map();

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
		module.On(Collider2DEvent.Destroy, () => {
			this.UnregisterModuleById(module.Id);
			for(const key of this.activePairs.keys()) {
				if(key.includes(module.Id)) this.activePairs.delete(key);
			}
		});
		return module.Id;
	}

	private PairKey(id1: string, id2: string): string {
		return id1 < id2 ? `${id1}:${id2}` : `${id2}:${id1}`;
	}

	private CollisionResponse(collider1: ICollider2D, collider2: ICollider2D, normal: Vector, depth: number, contactPoint: Vector) {
		const rb1 = collider1.connectedRigidbody;
		const rb2 = collider2.connectedRigidbody;

		const relativeVelocity = Vector.Subtract(rb2.Velocity, rb1.Velocity);
		const velocityAlongNormal = Vector.Dot(relativeVelocity, normal);

		if(velocityAlongNormal <= 0) {
			const restitution = (rb1.Bounciness + rb2.Bounciness) / 2;
			const j = -(1 + restitution) * velocityAlongNormal / (rb1.InvertedMass + rb2.InvertedMass);

			const impulse = Vector.MultiplyCoordinates(j, normal);
			rb1.AddImpulseAtPoint(contactPoint, Vector.MultiplyCoordinates(-1, impulse));
			rb2.AddImpulseAtPoint(contactPoint, impulse);
		}

		const slop = 0.01;
		const percent = 0.8;
		const correctionMagnitude = Math.max(depth - slop, 0) * percent;
		if(correctionMagnitude > 0) {
			const inverseMassSum = rb1.InvertedMass + rb2.InvertedMass;
			if(inverseMassSum > 0) {
				const correction = Vector.MultiplyCoordinates(correctionMagnitude / inverseMassSum, normal);
				const transform1 = rb1.gameObject?.transform;
				const transform2 = rb2.gameObject?.transform;
				if(transform1 && !rb1.IsStatic) {
					transform1.LocalPosition = transform1.LocalPosition.Subtract(Vector.MultiplyCoordinates(rb1.InvertedMass, correction));
				}
				if(transform2 && !rb2.IsStatic) {
					transform2.LocalPosition = transform2.LocalPosition.Add(Vector.MultiplyCoordinates(rb2.InvertedMass, correction));
				}
			}
		}
	}

	override Update() {
		super.Update();
		const arr = Array.from(this.modules);
		const touchedThisFrame = new Set<string>();

		for(let i = 0; i < arr.length; i++) {
			const collider1 = arr[i][1];
			if(!collider1.parent?.gameObject.active) continue;
			for(let j = i + 1; j < arr.length; j++) {
				const collider2 = arr[j][1];
				if(!collider2.parent?.gameObject.active) continue;

				collider1.SyncShape();
				collider2.SyncShape();

				const pairKey = this.PairKey(collider1.Id, collider2.Id);
				const result = detectCollision(collider1.shape, collider2.shape);

				if(result) {
					this.CollisionResponse(collider1, collider2, result.normal, result.depth, result.contactPoint);
					touchedThisFrame.add(pairKey);

					if(!this.activePairs.has(pairKey)) {
						(collider1 as Collider2D).Collide(collider2 as Collider2D);
						(collider2 as Collider2D).Collide(collider1 as Collider2D);
					}
					this.activePairs.set(pairKey, 0);
				}
			}
		}

		// Tick grace period for pairs not touched this frame
		for(const [key, framesSinceContact] of this.activePairs) {
			if(touchedThisFrame.has(key)) continue;

			if(framesSinceContact >= LEAVE_GRACE_FRAMES) {
				const [id1, id2] = key.split(':');
				const c1 = this.modules.get(id1);
				const c2 = this.modules.get(id2);
				if(c1 && c2) {
					(c1 as Collider2D).Leave(c2 as Collider2D);
					(c2 as Collider2D).Leave(c1 as Collider2D);
				}
				this.activePairs.delete(key);
			} else {
				this.activePairs.set(key, framesSinceContact + 1);
			}
		}
	}

}

export default CollisionsManager;
