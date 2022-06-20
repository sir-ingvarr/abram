import Module from "../Module";
import {Vector} from "../Classes";
import Time from "../globals/Time";

type RigidBodyParams = {
    mass?: number,
    velocity?: Vector,
    useGravity?: boolean,
    angularVelocity?: number,
    drag?: number,
    gravityScale?: number,
}

const G_CONSTANT = 9.82;
const AIR_RESISTANCE = 0.2;

class RigidBody extends Module {
    private velocity: Vector;
    private angularVelocity: number;
    private drag: number;
    private mass: number;
    private useGravity: boolean;
    private gravityScale: number;
    private forces: Array<Vector>;
    private isColliding: boolean;
    public collidedRb?: RigidBody;


    constructor(params: RigidBodyParams) {
        super();
        const { mass = 1, velocity = new Vector(), useGravity = true, drag = 1, angularVelocity = 1, gravityScale = 1 } = params;
        this.mass = mass;
        this.velocity = velocity;
        this.useGravity = useGravity;
        this.drag = drag;
        this.angularVelocity = angularVelocity;
        this.forces = [];
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

    private ApplyGravity() {
        this.AddForce(Vector.MultiplyCoordinates(G_CONSTANT * this.gravityScale, Vector.Up));
    }

    AddForce(force: Vector): void {
        this.forces.push(force.Copy());
    }

    private CalcVelocityByForces() {
        const resultingForce = Vector.Add(Vector.Zero, ...this.forces);
        const accelerationVector = Vector.MultiplyCoordinates(1 / this.mass, resultingForce);
        this.velocity.Add(accelerationVector);
        this.forces = [];
        this.ApplyDrag();
        const physicalMovement = Vector.MultiplyCoordinates(Time.deltaTime / 100, this.velocity);
        this.gameObject.transform.Translate(physicalMovement);
    }

    private ApplyDrag() {
        const drag = ((this.collidedRb ? this.collidedRb.drag : AIR_RESISTANCE) + this.drag) / 2;
        const dragMultiplier = 1 - (Time.deltaTime / 1000) * drag;
        this.velocity.Multiply(dragMultiplier);
    }

    Update(): void {
        if(this.useGravity) this.ApplyGravity();
        this.ApplyDrag();
        this.CalcVelocityByForces();
    }
}

export default RigidBody;
