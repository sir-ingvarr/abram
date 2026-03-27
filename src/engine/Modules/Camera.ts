import {Maths, Point, Vector} from '../Classes';
import CanvasContext2D from '../Canvas/Context2d';
import {ICoordinates, Nullable} from '../../types/common';
import {BoundingBox} from '../Canvas/GraphicPrimitives/Shapes';


export type CameraConstructorParams = {
	width?: number,
	height?: number,
	position?: Vector,
	scale?: ICoordinates,
	confiner?: BoundingBox,
}
class Camera {
	static #instance: Camera;
	protected context: CanvasContext2D;
	private centerX: number;
	private centerY: number;
	private scale: ICoordinates;
	private position: ICoordinates = new Vector(0,0);
	private confiner: Nullable<BoundingBox> = null;

	private constructor(props: CameraConstructorParams)
	{
		const { position = Vector.Zero, width = 1280, height = 800, confiner = null } = props;
		this.scale = Vector.One;
		this.confiner = confiner;
		this.position = position;
		this.ResetCenterPoint(width, height);
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

	get Confiner(): Nullable<BoundingBox> {
		return this.confiner;
	}

	set Confiner(bounds: Nullable<BoundingBox>) {
		this.confiner = bounds;
	}

	Confine() {
		if(!this.confiner) return;
		const viewW = (this.centerX * 2) / this.scale.x;
		const viewH = (this.centerY * 2) / this.scale.y;
		const minX = Math.min(this.confiner.From.x, this.confiner.To.x);
		const minY = Math.min(this.confiner.From.y, this.confiner.To.y);
		const maxX = Math.max(this.confiner.From.x, this.confiner.To.x);
		const maxY = Math.max(this.confiner.From.y, this.confiner.To.y);
		if(maxX - minX <= viewW) {
			this.position.x = minX + (maxX - minX - viewW) / 2;
		} else {
			this.position.x = Maths.Clamp(this.position.x, minX, maxX - viewW);
		}
		if(maxY - minY <= viewH) {
			this.position.y = minY + (maxY - minY - viewH) / 2;
		} else {
			this.position.y = Maths.Clamp(this.position.y, minY, maxY - viewH);
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
	}

	static GetInstance(props: CameraConstructorParams) {
		if(Camera.#instance) return Camera.#instance;
		const instance = new Camera(props);
		Camera.#instance = instance;
		return instance;
	}
}

export default Camera;