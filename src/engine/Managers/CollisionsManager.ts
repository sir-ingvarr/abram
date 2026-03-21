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

	private applyCollisionImpulse(collider1: ICollider2D, collider2: ICollider2D, normal: Vector, contactPoint: Vector) {
		const rigidbody1 = collider1.connectedRigidbody;
		const rigidbody2 = collider2.connectedRigidbody;

		const relativeVelocity = Vector.Subtract(rigidbody2.Velocity, rigidbody1.Velocity);
		const velocityAlongNormal = Vector.Dot(relativeVelocity, normal);

		if(velocityAlongNormal <= 0) {
			const restitution = (rigidbody1.Bounciness + rigidbody2.Bounciness) / 2;
			const impulseMagnitude = -(1 + restitution) * velocityAlongNormal / (rigidbody1.InvertedMass + rigidbody2.InvertedMass);

			const impulse = Vector.MultiplyCoordinates(impulseMagnitude, normal);
			rigidbody1.AddImpulseAtPoint(contactPoint, Vector.MultiplyCoordinates(-1, impulse));
			rigidbody2.AddImpulseAtPoint(contactPoint, impulse);
		}
	}

	private correctPenetration(collider1: ICollider2D, collider2: ICollider2D, normal: Vector, depth: number) {
		const rigidbody1 = collider1.connectedRigidbody;
		const rigidbody2 = collider2.connectedRigidbody;

		const slop = 0.01;
		const correctionPercent = 0.8;
		const correctionMagnitude = Math.max(depth - slop, 0) * correctionPercent;
		if(correctionMagnitude <= 0) return;

		const inverseMassSum = rigidbody1.InvertedMass + rigidbody2.InvertedMass;
		if(inverseMassSum <= 0) return;

		const correction = Vector.MultiplyCoordinates(correctionMagnitude / inverseMassSum, normal);
		const transform1 = rigidbody1.gameObject?.transform;
		const transform2 = rigidbody2.gameObject?.transform;
		if(transform1 && !rigidbody1.IsStatic) {
			transform1.LocalPosition = transform1.LocalPosition.Subtract(Vector.MultiplyCoordinates(rigidbody1.InvertedMass, correction));
		}
		if(transform2 && !rigidbody2.IsStatic) {
			transform2.LocalPosition = transform2.LocalPosition.Add(Vector.MultiplyCoordinates(rigidbody2.InvertedMass, correction));
		}
	}

	private CollisionResponse(collider1: ICollider2D, collider2: ICollider2D, normal: Vector, depth: number, contactPoint: Vector) {
		this.applyCollisionImpulse(collider1, collider2, normal, contactPoint);
		this.correctPenetration(collider1, collider2, normal, depth);
	}

	private processCollisionPair(collider1: ICollider2D, collider2: ICollider2D, touchedThisFrame: Set<string>) {
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

	private updateGracePeriods(touchedThisFrame: Set<string>) {
		for(const [pairKey, framesSinceContact] of this.activePairs) {
			if(touchedThisFrame.has(pairKey)) continue;

			if(framesSinceContact >= LEAVE_GRACE_FRAMES) {
				const [colliderId1, colliderId2] = pairKey.split(':');
				const colliderA = this.modules.get(colliderId1);
				const colliderB = this.modules.get(colliderId2);
				if(colliderA && colliderB) {
					(colliderA as Collider2D).Leave(colliderB as Collider2D);
					(colliderB as Collider2D).Leave(colliderA as Collider2D);
				}
				this.activePairs.delete(pairKey);
			} else {
				this.activePairs.set(pairKey, framesSinceContact + 1);
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
				this.processCollisionPair(collider1, collider2, touchedThisFrame);
			}
		}

		this.updateGracePeriods(touchedThisFrame);
	}

}

export default CollisionsManager;
