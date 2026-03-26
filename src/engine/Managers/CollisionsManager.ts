import {ExecutableManager} from './ExecutableManager';
import {ICollider2D} from '../../types/GameObject';
import Collider2D, {Collider2DEvent} from '../Modules/Collider';
import {Vector} from '../Classes';
import {detectCollision} from '../Collision/CollisionDetection';
import PhysicsMaterial from '../Modules/PhysicsMaterial';

const LEAVE_GRACE_FRAMES = 10;
const MAX_LAYERS = 16;

class CollisionsManager extends ExecutableManager {
	protected override readonly modules: Map<string, ICollider2D>;
	private static instance: CollisionsManager;
	private activePairs: Map<string, number> = new Map();
	private static collisionMatrix: boolean[][] = CollisionsManager.createCollisionMatrix();

	constructor(params: { modules: Array<ICollider2D> }) {
		super(params);
		CollisionsManager.instance = this;
	}

	private static createCollisionMatrix(): boolean[][] {
		const matrix: boolean[][] = [];
		for(let i = 0; i < MAX_LAYERS; i++) {
			matrix[i] = [];
			for(let j = 0; j < MAX_LAYERS; j++) {
				matrix[i][j] = true;
			}
		}
		return matrix;
	}

	public static SetLayerCollision(layerA: number, layerB: number, enabled: boolean) {
		if(layerA < 0 || layerA >= MAX_LAYERS || layerB < 0 || layerB >= MAX_LAYERS) return;
		CollisionsManager.collisionMatrix[layerA][layerB] = enabled;
		CollisionsManager.collisionMatrix[layerB][layerA] = enabled;
	}

	public static GetLayerCollision(layerA: number, layerB: number): boolean {
		if(layerA < 0 || layerA >= MAX_LAYERS || layerB < 0 || layerB >= MAX_LAYERS) return false;
		return CollisionsManager.collisionMatrix[layerA][layerB];
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

	private static readonly RESTING_VELOCITY_THRESHOLD = 0.5;

	private applyCollisionImpulse(collider1: ICollider2D, collider2: ICollider2D, normal: Vector, contactPoint: Vector, isResting: boolean) {
		const rigidbody1 = collider1.connectedRigidbody;
		const rigidbody2 = collider2.connectedRigidbody;

		if(isResting) {
			rigidbody1.CancelVelocityAlongNormal(normal);
			rigidbody2.CancelVelocityAlongNormal(normal, true);
			const friction = PhysicsMaterial.CombineFriction(rigidbody1.material, rigidbody2.material);
			if(friction > 0) {
				rigidbody1.ApplyFriction(friction);
				rigidbody2.ApplyFriction(friction);
			}
			return;
		}

		const v1 = rigidbody1.Velocity;
		const v2 = rigidbody2.Velocity;
		const relVelX = v2.x - v1.x;
		const relVelY = v2.y - v1.y;
		const velocityAlongNormal = relVelX * normal.x + relVelY * normal.y;

		if(velocityAlongNormal > 0) return;

		const restitution = (rigidbody1.Bounciness + rigidbody2.Bounciness) / 2;
		const impulseMagnitude = -(1 + restitution) * velocityAlongNormal / (rigidbody1.InvertedMass + rigidbody2.InvertedMass);

		const impulseX = impulseMagnitude * normal.x;
		const impulseY = impulseMagnitude * normal.y;
		const negImpulse = new Vector(-impulseX, -impulseY);
		const impulse = new Vector(impulseX, impulseY);
		rigidbody1.AddImpulseAtPoint(contactPoint, negImpulse);
		rigidbody2.AddImpulseAtPoint(contactPoint, impulse);
	}

	private static readonly WAKE_CORRECTION_THRESHOLD = 0.1;

	private correctPenetration(collider1: ICollider2D, collider2: ICollider2D, normal: Vector, depth: number, isResting: boolean) {
		const rigidbody1 = collider1.connectedRigidbody;
		const rigidbody2 = collider2.connectedRigidbody;

		const slop = isResting ? 0 : 0.01;
		const correctionPercent = isResting ? 1.0 : 0.8;
		const correctionMagnitude = Math.max(depth - slop, 0) * correctionPercent;
		if(correctionMagnitude <= 0) return;

		const inverseMassSum = rigidbody1.InvertedMass + rigidbody2.InvertedMass;
		if(inverseMassSum <= 0) return;

		const correctionFactor = correctionMagnitude / inverseMassSum;
		const transform1 = rigidbody1.gameObject?.transform;
		const transform2 = rigidbody2.gameObject?.transform;
		if(transform1 && !rigidbody1.IsStatic) {
			const amount = rigidbody1.InvertedMass * correctionFactor;
			const pos1 = transform1.LocalPositionMutable;
			pos1.x -= normal.x * amount;
			pos1.y -= normal.y * amount;
			if(rigidbody1.IsSleeping && correctionMagnitude > CollisionsManager.WAKE_CORRECTION_THRESHOLD) {
				rigidbody1.Wake();
			}
		}
		if(transform2 && !rigidbody2.IsStatic) {
			const amount = rigidbody2.InvertedMass * correctionFactor;
			const pos2 = transform2.LocalPositionMutable;
			pos2.x += normal.x * amount;
			pos2.y += normal.y * amount;
			if(rigidbody2.IsSleeping && correctionMagnitude > CollisionsManager.WAKE_CORRECTION_THRESHOLD) {
				rigidbody2.Wake();
			}
		}
	}

	private CollisionResponse(collider1: ICollider2D, collider2: ICollider2D, normal: Vector, depth: number, contactPoint: Vector, isPairActive: boolean) {
		const rigidbody1 = collider1.connectedRigidbody;
		const rigidbody2 = collider2.connectedRigidbody;

		const v1 = rigidbody1.Velocity;
		const v2 = rigidbody2.Velocity;
		const velocityAlongNormal = (v2.x - v1.x) * normal.x + (v2.y - v1.y) * normal.y;
		const isResting = isPairActive && velocityAlongNormal <= 0
			&& Math.abs(velocityAlongNormal) < CollisionsManager.RESTING_VELOCITY_THRESHOLD;

		if(!isResting) {
			if(rigidbody1.IsSleeping) rigidbody1.Wake();
			if(rigidbody2.IsSleeping) rigidbody2.Wake();
		}

		this.applyCollisionImpulse(collider1, collider2, normal, contactPoint, isResting);
		this.correctPenetration(collider1, collider2, normal, depth, isResting);
	}

	private processCollisionPair(collider1: ICollider2D, collider2: ICollider2D, touchedThisFrame: Set<string>) {
		const layer1 = collider1.parent?.gameObject?.collisionLayer ?? 0;
		const layer2 = collider2.parent?.gameObject?.collisionLayer ?? 0;
		if(!CollisionsManager.collisionMatrix[layer1][layer2]) return;

		collider1.SyncShape();
		collider2.SyncShape();

		const pairKey = this.PairKey(collider1.Id, collider2.Id);
		const result = detectCollision(collider1.shape, collider2.shape);

		if(result) {
			const isResting = this.activePairs.has(pairKey);
			this.CollisionResponse(collider1, collider2, result.normal, result.depth, result.contactPoint, isResting);
			touchedThisFrame.add(pairKey);

			if(!isResting) {
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
					const rbA = colliderA.connectedRigidbody;
					const rbB = colliderB.connectedRigidbody;
					if(rbA.collidedRb === rbB) rbA.collidedRb = undefined;
					if(rbB.collidedRb === rbA) rbB.collidedRb = undefined;
				}
				this.activePairs.delete(pairKey);
			} else {
				this.activePairs.set(pairKey, framesSinceContact + 1);
			}
		}
	}

	private static readonly CORRECTION_ITERATIONS = 3;

	private penetrationCorrectionPass(arr: [string, ICollider2D][]) {
		for(let i = 0; i < arr.length; i++) {
			const collider1 = arr[i][1];
			if(!collider1.parent?.gameObject.active) continue;
			const sleeping1 = collider1.connectedRigidbody.IsSleeping;
			for(let j = i + 1; j < arr.length; j++) {
				const collider2 = arr[j][1];
				if(!collider2.parent?.gameObject.active) continue;
				if(sleeping1 && collider2.connectedRigidbody.IsSleeping) continue;

				const layer1 = collider1.parent?.gameObject?.collisionLayer ?? 0;
				const layer2 = collider2.parent?.gameObject?.collisionLayer ?? 0;
				if(!CollisionsManager.collisionMatrix[layer1][layer2]) continue;

				collider1.SyncShape();
				collider2.SyncShape();

				const result = detectCollision(collider1.shape, collider2.shape);
				if(result) {
					this.correctPenetration(collider1, collider2, result.normal, result.depth, true);
				}
			}
		}
	}

	override FixedUpdate() {
		super.FixedUpdate();
		const arr = Array.from(this.modules);
		const touchedThisFrame = new Set<string>();

		for(let i = 0; i < arr.length; i++) {
			const collider1 = arr[i][1];
			if(!collider1.parent?.gameObject.active) continue;
			const sleeping1 = collider1.connectedRigidbody.IsSleeping;
			for(let j = i + 1; j < arr.length; j++) {
				const collider2 = arr[j][1];
				if(!collider2.parent?.gameObject.active) continue;
				if(sleeping1 && collider2.connectedRigidbody.IsSleeping) continue;
				this.processCollisionPair(collider1, collider2, touchedThisFrame);
			}
		}

		for(let iter = 0; iter < CollisionsManager.CORRECTION_ITERATIONS; iter++) {
			this.penetrationCorrectionPass(arr);
		}

		this.updateGracePeriods(touchedThisFrame);
	}

}

export default CollisionsManager;
