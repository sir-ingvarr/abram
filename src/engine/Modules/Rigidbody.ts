import Module from './Module';
import {Point, Vector} from '../Classes';
import Time from '../Globals/Time';
import {ICoordinates, Nullable} from '../../types/common';
import {IGameObject} from '../../types/GameObject';
import PhysicsMaterial from './PhysicsMaterial';

type RigidBodyParams = {
	mass?: number,
	velocity?: Vector,
	useGravity?: boolean,
	bounciness?: number,
	angularVelocity?: number,
	imaginaryRadius?: number
	centerOfMass?: ICoordinates,
	angularDrag?: number,
	drag?: number,
	gravityScale?: number,
	isStatic?: boolean,
	freezeRotation?: boolean,
	velocityLimit?: Vector,
	material?: PhysicsMaterial,
	interpolate?: boolean,
}

export const G_CONSTANT = 9.82;
const AIR_RESISTANCE = 0.2;

class RigidBody extends Module {
	static override readonly canBeDuplicated = false;

	private prevPosition: ICoordinates;
	private velocity: Vector;
	private centerOfMass: ICoordinates;
	private bounciness: number;
	private isStatic: boolean;
	private angularVelocity: number;
	private angularDrag: number;
	private drag: number;
	private mass: number;
	private useGravity: boolean;
	private gravityScale: number;
	private force: Vector;
	private torque: number;
	private invertedMass: number;
	private freezeRotation: boolean;
	private velocityLimit: Nullable<Vector>;
	private interpolate: boolean;
	private sleeping: boolean;
	private sleepFrameCounter: number;
	private prevLocalPosition: ICoordinates;
	private savedLocalPosition: Nullable<ICoordinates>;
	public material: Nullable<PhysicsMaterial>;
	public collidedRb?: RigidBody;

	private static activeBodies: Set<RigidBody> = new Set();


	constructor(params: RigidBodyParams) {
		super({ name: 'RigidBody' });
		const {
			mass = 1, velocity = new Vector(), angularDrag = 0.5,
			useGravity = true, drag = 0.5, angularVelocity = 0,
			gravityScale = 1, centerOfMass = new Point(), bounciness = 1,
			isStatic = false, freezeRotation = false,
			velocityLimit = null, material = null, interpolate = false,
		} = params;
		this.interpolate = interpolate;
		this.freezeRotation = freezeRotation;
		this.velocityLimit = velocityLimit;
		this.material = material;
		this.sleeping = false;
		this.sleepFrameCounter = 0;
		this.mass = isStatic ? Infinity : mass;
		this.invertedMass = isStatic ? 0 : 1 / mass;
		this.velocity = isStatic ? Vector.ZeroMutable : velocity;
		this.useGravity = isStatic ? false : useGravity;
		this.angularDrag = isStatic ? Infinity : angularDrag;
		this.centerOfMass = centerOfMass;
		this.drag = isStatic ? Infinity : drag;
		this.bounciness = bounciness;
		this.angularVelocity = isStatic ? 0 : angularVelocity;
		this.force = Vector.ZeroMutable;
		this.torque = 0;
		this.gravityScale = isStatic ? 0 : gravityScale;
		this.isStatic = isStatic;
		this.prevPosition = this.gameObject?.transform.WorldPosition || new Point();
		this.prevLocalPosition = this.gameObject?.transform.LocalPosition || new Point();
		this.savedLocalPosition = null;
	}

	get PrevPosition() {
		return this.prevPosition.Copy();
	}

	get InvertedMass() {
		return this.invertedMass;
	}

	get IsStatic() {
		return this.isStatic;
	}

	set IsStatic(isStatic: boolean) {
		this.isStatic = isStatic;
	}

	get Mass() {
		return this.mass;
	}

	set Mass(val: number) {
		if(this.isStatic) return;
		this.mass = val;
		this.invertedMass = 1 / val;
	}

	get UseGravity() {
		return this.useGravity;
	}

	set UseGravity(val: boolean) {
		if(this.isStatic) return;
		this.useGravity = val;
	}

	get Bounciness() {
		return this.material?.bounciness ?? this.bounciness;
	}

	set Bounciness(val: number) {
		this.bounciness = val;
	}

	get Velocity() {
		return this.velocity.Copy();
	}

	set Velocity(val: Vector) {
		if(this.isStatic) return;
		this.velocity = val.Copy();
	}

	get GravityScale() {
		return this.gravityScale;
	}

	set GravityScale(val: number) {
		if(this.isStatic) return;
		this.gravityScale = val;
	}

	get Drag() {
		return this.drag;
	}

	set Drag(val: number) {
		if(this.isStatic) return;
		this.drag = val;
	}

	get AngularVelocity() {
		return this.angularVelocity;
	}

	set AngularVelocity(val: number) {
		if(this.isStatic) return;
		this.angularVelocity = val;
	}

	get AngularDrag() {
		return this.angularDrag;
	}

	set AngularDrag(val: number) {
		if(this.isStatic) return;
		this.angularDrag = val;
	}

	get FreezeRotation() {
		return this.freezeRotation;
	}

	set FreezeRotation(val: boolean) {
		this.freezeRotation = val;
		if(val) this.angularVelocity = 0;
	}

	get VelocityLimit(): Nullable<Vector> {
		return this.velocityLimit;
	}

	set VelocityLimit(val: Nullable<Vector>) {
		this.velocityLimit = val;
	}

	get IsSleeping(): boolean {
		return this.sleeping;
	}

	Wake() {
		if(!this.sleeping) return;
		this.sleeping = false;
		this.sleepFrameCounter = 0;
	}

	Sleep() {
		this.sleeping = true;
		this.velocity.x = 0;
		this.velocity.y = 0;
		this.angularVelocity = 0;
		this.force.x = 0;
		this.force.y = 0;
		this.torque = 0;
	}

	CancelVelocityAlongNormal(intoSurface: Vector, invert = false): void {
		const sign = invert ? -1 : 1;
		const nx = intoSurface.x * sign;
		const ny = intoSurface.y * sign;
		const dot = this.velocity.x * nx + this.velocity.y * ny;
		if(dot > 0) {
			this.velocity.x -= dot * nx;
			this.velocity.y -= dot * ny;
		}
	}

	ApplyFriction(friction: number): void {
		this.velocity.MultiplyCoordinates(1 - friction);
	}

	ApplyDensityFromArea(area: number) {
		if(!this.material?.density || this.isStatic) return;
		this.Mass = this.material.density * area;
	}

	AddForceToPoint(applyPoint: Vector, force: Vector): void {
		if(this.isStatic) return;
		const armVector = Vector.Subtract(applyPoint, this.centerOfMass);
		const forceDot = Vector.Dot(armVector, force);
		const selfDot = Vector.Dot(armVector, armVector);
		const parallelComponent = Vector.MultiplyCoordinates(forceDot/selfDot, armVector);
		const angularForce = Vector.Subtract(force, parallelComponent);
		this.AddForce(force.Subtract(angularForce));
		this.AddTorque(angularForce.MultiplyCoordinates(armVector.Magnitude).Magnitude);
	}

	AddForce(force: Vector): void {
		if(this.isStatic) return;
		this.Wake();
		this.force.Add(force);
	}

	AddImpulse(impulse: Vector) {
		if(this.isStatic) return;
		this.Wake();
		this.velocity.x += impulse.x * this.invertedMass;
		this.velocity.y += impulse.y * this.invertedMass;
	}

	AddImpulseAtPoint(applyPoint: Vector, impulse: Vector) {
		if(this.isStatic) return;
		this.AddImpulse(impulse);
		if(this.freezeRotation) return;
		const leverX = applyPoint.x - this.centerOfMass.x;
		const leverY = applyPoint.y - this.centerOfMass.y;
		if(leverX === 0 && leverY === 0) return;
		const impulseTorque = leverX * impulse.y - leverY * impulse.x;
		this.angularVelocity += impulseTorque * this.invertedMass;
	}

	AddTorque(torque: number) {
		if(this.isStatic || this.freezeRotation) return;
		this.angularVelocity += torque;
	}

	private ApplyGravity() {
		if(!this.useGravity) return;
		this.force.y += G_CONSTANT * this.gravityScale * this.mass;
	}

	private CalcAngularVelocity() {
		this.angularVelocity = this.angularVelocity + this.torque / this.mass;
		this.gameObject?.transform.RotateDeg(this.angularVelocity * Time.FixedDeltaTimeSeconds);
		this.torque = 0;
		this.angularVelocity *= (1 - this.angularDrag);
	}

	private CalcVelocityByForces() {
		const dt = Time.FixedDeltaTimeSeconds;
		this.velocity.x += (this.force.x * this.invertedMass) * dt;
		this.velocity.y += (this.force.y * this.invertedMass) * dt;
		this.force.x = 0;
		this.force.y = 0;
		if(this.velocityLimit) {
			this.velocity.Clamp(
				[-this.velocityLimit.x, this.velocityLimit.x],
				[-this.velocityLimit.y, this.velocityLimit.y],
			);
		}
		const pxPerStep = dt * PhysicsMaterial.PixelsPerMeter;
		const pos = this.gameObject?.transform.LocalPositionMutable;
		if(pos) {
			pos.x += this.velocity.x * pxPerStep;
			pos.y += this.velocity.y * pxPerStep;
		}
	}


	private ApplyDrag() {
		const drag = ((this.collidedRb ? this.collidedRb.drag : AIR_RESISTANCE) + this.drag) / 2;
		const dragMultiplier = Math.exp(-drag * Time.FixedDeltaTimeSeconds);
		this.velocity.MultiplyCoordinates(dragMultiplier);
	}

	override Start() {
		super.Start();
		if(!this.gameObject) throw new Error('GameObject not found');
		this.prevPosition = this.gameObject.transform.WorldPosition;
		this.prevLocalPosition = this.gameObject.transform.LocalPosition;
		if(!this.isStatic) RigidBody.activeBodies.add(this);
	}

	override Destroy() {
		RigidBody.activeBodies.delete(this);
		super.Destroy();
	}

	private static readonly SLEEP_DISPLACEMENT_THRESHOLD = 0.01;
	private static readonly SLEEP_FRAMES_REQUIRED = 15;

	private checkSleep() {
		const currentPos = (this.gameObject as IGameObject).transform.WorldPosition;
		const dx = currentPos.x - this.prevPosition.x;
		const dy = currentPos.y - this.prevPosition.y;
		const displacement = dx * dx + dy * dy;
		if(displacement < RigidBody.SLEEP_DISPLACEMENT_THRESHOLD * RigidBody.SLEEP_DISPLACEMENT_THRESHOLD) {
			this.sleepFrameCounter++;
			if(this.sleepFrameCounter >= RigidBody.SLEEP_FRAMES_REQUIRED) {
				this.Sleep();
			}
		} else {
			this.sleepFrameCounter = 0;
		}
		this.prevPosition = currentPos;
	}

	override FixedUpdate(): void {
		if(this.isStatic || this.sleeping) return;
		this.prevLocalPosition = (this.gameObject as IGameObject).transform.LocalPosition;
		this.checkSleep();
		this.ApplyGravity();
		this.CalcVelocityByForces();
		this.CalcAngularVelocity();
		this.ApplyDrag();
	}

	static InterpolateAll(alpha: number): void {
		for(const rb of RigidBody.activeBodies) {
			if(!rb.interpolate || rb.isStatic || rb.sleeping || !rb.gameObject) continue;
			const current = rb.gameObject.transform.LocalPosition;
			rb.savedLocalPosition = current;
			const interpX = rb.prevLocalPosition.x + (current.x - rb.prevLocalPosition.x) * alpha;
			const interpY = rb.prevLocalPosition.y + (current.y - rb.prevLocalPosition.y) * alpha;
			rb.gameObject.transform.LocalPosition = new Vector(interpX, interpY);
		}
	}

	static RestoreAll(): void {
		for(const rb of RigidBody.activeBodies) {
			if(!rb.savedLocalPosition || !rb.gameObject) continue;
			rb.gameObject.transform.LocalPosition = new Vector(rb.savedLocalPosition.x, rb.savedLocalPosition.y);
			rb.savedLocalPosition = null;
		}
	}
}

export default RigidBody;