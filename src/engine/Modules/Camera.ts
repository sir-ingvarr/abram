import {Maths, Point, Vector} from '../Classes';
import CanvasContext2D from '../Canvas/Context2d';
import {ICoordinates, Nullable} from '../../types/common';
import {BoundingBox} from '../Canvas/GraphicPrimitives/Shapes';
import {ITransform} from '../../types/GameObject';
import Time from '../Globals/Time';

export type CameraUpdateMode = 'fixedUpdate' | 'update';

export type TrackingOptions = {
	deadZone?: ICoordinates,
	softEdge?: number,
	damping?: number,
	updateMode?: CameraUpdateMode,
}

export type CameraConfiner = {
	minX?: number,
	maxX?: number,
	minY?: number,
	maxY?: number,
}

export type CameraConstructorParams = {
	width?: number,
	height?: number,
	position?: Vector,
	scale?: ICoordinates,
	confiner?: CameraConfiner | BoundingBox,
}
class Camera {
	static #instance: Camera;
	protected context: CanvasContext2D;
	private centerX: number;
	private centerY: number;
	private scale: ICoordinates;
	private position: ICoordinates = new Vector(0,0);
	private confiner: Nullable<CameraConfiner> = null;
	private trackTarget: Nullable<ITransform> = null;
	private trackDeadZone: ICoordinates = Vector.Zero;
	private trackDamping: number = 0;
	private trackSoftEdge: number = 0;
	private trackUpdateMode: CameraUpdateMode = 'update';

	private constructor(props: CameraConstructorParams)
	{
		const { position = Vector.Zero, width = 1280, height = 800, confiner = null } = props;
		this.scale = Vector.One;
		this.confiner = Camera.NormalizeConfiner(confiner);
		this.position = position;
		this.ResetCenterPoint(width, height);
	}

	private static NormalizeConfiner(confiner: Nullable<CameraConfiner | BoundingBox>): Nullable<CameraConfiner> {
		if(!confiner) return null;
		if(confiner instanceof BoundingBox) {
			return {
				minX: Math.min(confiner.From.x, confiner.To.x),
				maxX: Math.max(confiner.From.x, confiner.To.x),
				minY: Math.min(confiner.From.y, confiner.To.y),
				maxY: Math.max(confiner.From.y, confiner.To.y),
			};
		}
		return confiner;
	}

	set Scale(newScale: ICoordinates) {
		this.scale = Vector.From(newScale);
	}

	get Scale() {
		return this.scale.Copy();
	}

	get Position() {
		return this.position.Copy();
	}

	set Position(newPosition: ICoordinates) {
		this.position = newPosition.Copy();
	}

	get Center() {
		return Point.Of(this.centerX, this.centerY);
	}

	set Center(pos: ICoordinates) {
		this.position = new Vector(pos.x - this.centerX, pos.y - this.centerY);
	}

	get Confiner(): Nullable<CameraConfiner> {
		return this.confiner;
	}

	set Confiner(bounds: Nullable<CameraConfiner | BoundingBox>) {
		this.confiner = Camera.NormalizeConfiner(bounds);
	}

	Track(target: ITransform, options?: TrackingOptions) {
		this.trackTarget = target;
		this.trackDeadZone = options?.deadZone?.Copy() ?? Vector.Zero;
		this.trackSoftEdge = Maths.Clamp(options?.softEdge ?? 0, 0, 1);
		this.trackDamping = options?.damping ?? 0;
		this.trackUpdateMode = options?.updateMode ?? 'update';
	}

	Untrack() {
		this.trackTarget = null;
	}

	Update() {
		if(this.trackUpdateMode === 'update') this.ApplyTracking(Time.DeltaTimeSeconds);
		this.Confine();
	}

	FixedUpdate() {
		if(this.trackUpdateMode === 'fixedUpdate') this.ApplyTracking(Time.FixedDeltaTimeSeconds);
	}

	private AxisCorrection(offset: number, deadZone: number, softEdge: number, damping: number, dt: number): number {
		const absOffset = Math.abs(offset);
		const innerBound = deadZone * softEdge;

		if(absOffset <= innerBound) return 0;

		if(absOffset > deadZone) {
			return offset - Math.sign(offset) * deadZone;
		}

		const overflow = offset - Math.sign(offset) * innerBound;
		if(Math.abs(overflow) < 0.5) return overflow;
		const factor = Maths.Clamp(damping * dt, 0, 1);
		return overflow * factor;
	}

	private ApplyTracking(dt: number) {
		if(!this.trackTarget) return;
		if(this.trackTarget.gameObject.IsWaitingDestroy) {
			this.trackTarget = null;
			return;
		}

		const targetPos = this.trackTarget.WorldPosition;
		const camCenterX = this.position.x + this.centerX;
		const camCenterY = this.position.y + this.centerY;
		const dx = targetPos.x - camCenterX;
		const dy = targetPos.y - camCenterY;

		const correctionX = this.AxisCorrection(dx, this.trackDeadZone.x, this.trackSoftEdge, this.trackDamping, dt);
		const correctionY = this.AxisCorrection(dy, this.trackDeadZone.y, this.trackSoftEdge, this.trackDamping, dt);

		if(correctionX === 0 && correctionY === 0) return;

		this.position.x += correctionX;
		this.position.y += correctionY;
	}

	private Confine() {
		if(!this.confiner) return;
		const { minX, maxX, minY, maxY } = this.confiner;

		if(minX !== undefined && maxX !== undefined) {
			const halfViewW = this.centerX / this.scale.x;
			if(maxX - minX <= halfViewW * 2) {
				this.position.x = (minX + maxX) / 2 - this.centerX;
			} else {
				this.position.x = Maths.Clamp(this.position.x, minX + halfViewW - this.centerX, maxX - halfViewW - this.centerX);
			}
		} else if(minX !== undefined) {
			const halfViewW = this.centerX / this.scale.x;
			this.position.x = Math.max(this.position.x, minX + halfViewW - this.centerX);
		} else if(maxX !== undefined) {
			const halfViewW = this.centerX / this.scale.x;
			this.position.x = Math.min(this.position.x, maxX - halfViewW - this.centerX);
		}

		if(minY !== undefined && maxY !== undefined) {
			const halfViewH = this.centerY / this.scale.y;
			if(maxY - minY <= halfViewH * 2) {
				this.position.y = (minY + maxY) / 2 - this.centerY;
			} else {
				this.position.y = Maths.Clamp(this.position.y, minY + halfViewH - this.centerY, maxY - halfViewH - this.centerY);
			}
		} else if(minY !== undefined) {
			const halfViewH = this.centerY / this.scale.y;
			this.position.y = Math.max(this.position.y, minY + halfViewH - this.centerY);
		} else if(maxY !== undefined) {
			const halfViewH = this.centerY / this.scale.y;
			this.position.y = Math.min(this.position.y, maxY - halfViewH - this.centerY);
		}
	}

	ResetCenterPoint(width: number, height?: number) {
		this.centerX = width / 2;
		if(height) this.centerY = height / 2;
	}

	Reset() {
		this.position = new Vector(0, 0);
		this.scale = Vector.One;
		this.confiner = null;
		this.trackTarget = null;
		this.trackDeadZone = Vector.Zero;
		this.trackDamping = 0;
		this.trackSoftEdge = 0;
		this.trackUpdateMode = 'update';
	}

	static GetInstance(props: CameraConstructorParams) {
		if(Camera.#instance) {
			if(props.confiner !== undefined) Camera.#instance.confiner = Camera.NormalizeConfiner(props.confiner);
			if(props.position) Camera.#instance.position = props.position.Copy();
			if(props.width !== undefined || props.height !== undefined) {
				Camera.#instance.ResetCenterPoint(
					props.width ?? Camera.#instance.centerX * 2,
					props.height ?? Camera.#instance.centerY * 2
				);
			}
			return Camera.#instance;
		}
		const instance = new Camera(props);
		Camera.#instance = instance;
		return instance;
	}
}

export default Camera;