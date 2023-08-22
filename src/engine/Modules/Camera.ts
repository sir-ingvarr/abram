import {Point, Vector} from '../Classes';
import CanvasContext2D from '../Canvas/Context2d';
import {ICoordinates} from '../../types/common';


export type CameraConstructorParams = {
	width?: number,
	height?: number,
	position?: Vector,
	scale?: ICoordinates,
}
class Camera {
	static #instance: Camera;
	protected context: CanvasContext2D;
	private centerX: number;
	private centerY: number;
	private scale: ICoordinates;
	private position: ICoordinates = new Vector(0,0);

	private constructor(props: CameraConstructorParams)
	{
		const { position = Vector.Zero, width = 1280, height = 800 } = props;
		this.scale = Vector.One;
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

	ResetCenterPoint(width: number, height?: number) {
		this.centerX = width / 2;
		if(height) this.centerY = height / 2;
	}

	static GetInstance(props: CameraConstructorParams) {
		if(Camera.#instance) return Camera.#instance;
		const instance = new Camera(props);
		Camera.#instance = instance;
		return instance;
	}
}

export default Camera;