import Module from './Module';
import {Point, Vector} from '../Classes';
import Time from '../Globals/Time';
import {ICoordinates} from '../../types/common';

type RigidBodyParams = {
	mass?: number,
	velocity?: Vector,
	useGravity?: boolean,
	angularVelocity?: number,
	imaginaryRadius?: number
	centerOfMass?: ICoordinates,
	angularDrag?: number,
	drag?: number,
	gravityScale?: number,
}

const G_CONSTANT = 9.82;
const AIR_RESISTANCE = 0.2;

class RigidBody extends Module {
	private velocity: Vector;
	private centerOfMass: ICoordinates;
	private angularVelocity: number;
	private angularDrag: number;
	private imaginaryRadius: number;
	private drag: number;
	private mass: number;
	private useGravity: boolean;
	private gravityScale: number;
	private forces: Array<Vector>;
	private torque: number;
	public collidedRb?: RigidBody;


	constructor(params: RigidBodyParams) {
		super({ name: 'RigidBody' });
		const { mass = 1, velocity = new Vector(), angularDrag = 0.5, useGravity = true, drag = 0.5, angularVelocity = 0, gravityScale = 1, centerOfMass = new Point() } = params;
		this.mass = mass;
		this.velocity = velocity;
		this.useGravity = useGravity;
		this.angularDrag = angularDrag;
		this.centerOfMass = centerOfMass;
		this.drag = drag;
		this.angularVelocity = angularVelocity;
		this.forces = [];
		this.torque = 0;
		this.gravityScale = gravityScale;
	}

	get Mass() {
		return this.mass;
	}

	set Mass(val: number) {
		this.mass = val;
	}

	get UseGravity() {
		return this.useGravity;
	}

	set UseGravity(val: boolean) {
		this.useGravity = val;
	}

	get Velocity() {
		return this.velocity.Copy();
	}

	set Velocity(val: Vector) {
		this.velocity = val.Copy();
	}

	get GravityScale() {
		return this.gravityScale;
	}

	set GravityScale(val: number) {
		this.gravityScale = val;
	}

	get Drag() {
		return this.drag;
	}

	set Drag(val: number) {
		this.drag = val;
	}

	get AngularVelocity() {
		return this.angularVelocity;
	}

	set AngularVelocity(val: number) {
		this.angularVelocity = val;
	}

	get AngularDrag() {
		return this.angularDrag;
	}

	set AngularDrag(val: number) {
		this.angularDrag = val;
	}

	get ImaginaryRadius() {
		return this.imaginaryRadius;
	}

	set ImaginaryRadius(val: number) {
		this.imaginaryRadius = val;
	}

	private ApplyGravity() {
		if(!this.useGravity) return;
		this.AddForce(Vector.MultiplyCoordinates(G_CONSTANT * this.gravityScale, Vector.Up));
	}

	AddForceToPoint(applyPoint: Vector, force: Vector): void {
		const armVector = Vector.Subtract(applyPoint, this.centerOfMass);
		const forceDot = Vector.Dot(armVector, force);
		const selfDot = Vector.Dot(armVector, armVector);
		const parallelComponent = Vector.MultiplyCoordinates(forceDot/selfDot, applyPoint);
		const angularForce = Vector.Subtract(force, parallelComponent);
		this.AddForce(force.Subtract(angularForce));
		this.AddTorque(angularForce.MultiplyCoordinates(armVector.Magnitude).Magnitude);
	}

	AddForce(force: Vector): void {
		this.forces.push(force.Copy());
	}

	AddTorque(torque: number) {
		this.angularVelocity += torque;
	}

	private CalcAngularVelocity() {
		this.angularVelocity = this.angularVelocity + this.torque / this.mass;
		this.gameObject?.transform.RotateDeg(this.angularVelocity * Time.deltaTime / 1000);
		this.torque = 0;
		this.angularVelocity *= (1 - this.angularDrag);
	}

	private CalcVelocityByForces() {
		const resultingForce = Vector.Add(Vector.Zero, ...this.forces);
		const accelerationVector = Vector.MultiplyCoordinates(1 / this.mass, resultingForce);
		this.velocity.Add(accelerationVector);
		this.forces = [];
		this.ApplyDrag();
		const physicalMovement = Vector.MultiplyCoordinates(Time.deltaTime / 100, this.velocity);
		this.gameObject?.transform.Translate(physicalMovement);
	}


	private ApplyDrag() {
		const drag = ((this.collidedRb ? this.collidedRb.drag : AIR_RESISTANCE) + this.drag) / 2;
		const dragMultiplier = 1 - (Time.deltaTime / 1000) * drag;
		this.velocity.MultiplyCoordinates(dragMultiplier);
	}

	override Update(): void {
		this.ApplyGravity();
		this.CalcVelocityByForces();
		this.CalcAngularVelocity();
	}
}

export default RigidBody;