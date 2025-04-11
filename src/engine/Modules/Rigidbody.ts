import Module from './Module';
import {Point, Vector} from '../Classes';
import Time from '../Globals/Time';
import {ICoordinates} from '../../types/common';
import {IGameObject} from '../../types/GameObject';

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
}

const G_CONSTANT = 9.82;
const AIR_RESISTANCE = 0.2;

class RigidBody extends Module {
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
	public collidedRb?: RigidBody;


	constructor(params: RigidBodyParams) {
		super({ name: 'RigidBody' });
		const {
			mass = 1, velocity = new Vector(), angularDrag = 0.5,
			useGravity = true, drag = 0.5, angularVelocity = 0,
			gravityScale = 1, centerOfMass = new Point(), bounciness = 1,
			isStatic = false,
		} = params;
		this.mass = isStatic ? Infinity : mass;
		this.invertedMass = isStatic ? 0 : 1 / mass;
		this.velocity = isStatic ? Vector.Zero : velocity;
		this.useGravity = isStatic ? false : useGravity;
		this.angularDrag = isStatic ? Infinity : angularDrag;
		this.centerOfMass = centerOfMass;
		this.drag = isStatic ? Infinity : drag;
		this.bounciness = bounciness;
		this.angularVelocity = isStatic ? 0 : angularVelocity;
		this.force = Vector.Zero;
		this.torque = 0;
		this.gravityScale = isStatic ? 0 : gravityScale;
		this.isStatic = isStatic;
		this.prevPosition = this.gameObject?.transform.WorldPosition || new Point();
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
		return this.bounciness;
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

	AddForceToPoint(applyPoint: Vector, force: Vector): void {
		if(this.isStatic) return;
		const armVector = Vector.Subtract(applyPoint, this.centerOfMass);
		const forceDot = Vector.Dot(armVector, force);
		const selfDot = Vector.Dot(armVector, armVector);
		const parallelComponent = Vector.MultiplyCoordinates(forceDot/selfDot, applyPoint);
		const angularForce = Vector.Subtract(force, parallelComponent);
		this.AddForce(force.Subtract(angularForce));
		this.AddTorque(angularForce.MultiplyCoordinates(armVector.Magnitude).Magnitude);
	}

	AddForce(force: Vector): void {
		if(this.isStatic) return;
		this.force.Add(force);
	}

	AddTorque(torque: number) {
		if(this.isStatic) return;
		this.angularVelocity += torque;
	}

	private ApplyGravity() {
		if(!this.useGravity) return;
		this.AddForce(Vector.MultiplyCoordinates(G_CONSTANT * this.gravityScale, Vector.Up));
	}

	private CalcAngularVelocity() {
		this.angularVelocity = this.angularVelocity + this.torque / this.mass;
		this.gameObject?.transform.RotateDeg(this.angularVelocity * Time.DeltaTimeSeconds);
		this.torque = 0;
		this.angularVelocity *= (1 - this.angularDrag);
	}

	private CalcVelocityByForces() {
		const accelerationVector = Vector.DivideCoordinates(this.mass, this.force);
		this.velocity.Add(accelerationVector);
		this.force = Vector.Zero;
		const physicalMovement = Vector.MultiplyCoordinates(Time.DeltaTimeSeconds * 10, this.velocity);
		this.gameObject?.transform.Translate(physicalMovement);
	}


	private ApplyDrag() {
		const drag = ((this.collidedRb ? this.collidedRb.drag : AIR_RESISTANCE) + this.drag) / 2;
		//const dragMultiplier = 1 - Time.DeltaTimeSeconds * drag;
		const dragMultiplier = Math.exp(-drag * Time.DeltaTimeSeconds);
		this.velocity.MultiplyCoordinates(dragMultiplier);
	}

	override Start() {
		super.Start();
		if(!this.gameObject) throw 'GameObject not found';
		this.prevPosition = this.gameObject.transform.WorldPosition;
	}

	override Update(): void {
		if(this.isStatic) return;
		this.ApplyGravity();
		this.CalcVelocityByForces();
		this.CalcAngularVelocity();
		this.ApplyDrag();
		const go = this.gameObject as IGameObject;
		this.prevPosition = go.transform.WorldPosition;
	}
}

export default RigidBody;