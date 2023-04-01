import {Vector} from '../Classes';
import CanvasContext2D from '../Canvas/Context2d';
import {ICoordinates} from '../../types/common';
import SpriteRendererManager from '../Managers/SpriteRendererManager';


export type CameraConstructorParams = {
	width: number,
	height: number,
	position: Vector,
	scale?: ICoordinates,
}
class Camera {
	static #instance: Camera;
	protected context: CanvasContext2D;
	private centerX: number;
	private centerY: number;
	private position: Vector = new Vector(0,0);
	// private scale: ICoordinates = new Point(1, 1);

	private constructor(props: CameraConstructorParams)
	{
		const { position = Vector.Zero, width = 1280, height = 800 } = props;
		const clientWidth = width;
		const clientHeight = height;
		this.position = position;
		// this.scale = scale;
		// this.context.SetScale(scale.x, scale.y);
		this.ResetCenterPoint(clientWidth, clientHeight);
	}

	ResetCenterPoint(width: number, height?: number) {
		this.centerX = width / 2;
		if(height) this.centerY = height / 2;
	}

	CenterTo(pos: ICoordinates): void {
		this.position = new Vector(this.centerX - pos.x, this.centerY - pos.y);
		SpriteRendererManager.GetInstance().SetCameraPosition(this.position.x, this.position.y);
	}

	// SetScale(scale: ICoordinates = new Point(1, 1)) {
	// this.scale = scale;
	// this.context.SetScale(this.scale.x, this.scale.y);
	// }

	static GetInstance(props: CameraConstructorParams) {
		if(Camera.#instance) return Camera.#instance;
		const instance = new Camera(props);
		Camera.#instance = instance;
		return instance;
	}
}

export default Camera;
