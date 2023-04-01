import Module from './Module';
import {ITransform} from '../../types/GameObject';
import {RGBAColor} from '../Classes';
import Time from '../Globals/Time';
// import SpriteRenderer from '../Managers/SpriteRenderer';
import {GraphicPrimitive, PrimitiveType} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import {PolygonalChain} from '../Canvas/GraphicPrimitives/Shapes';
// import SpriteRenderer from '../Managers/SpriteRenderer';

type TrailRendererConstructorParams = {
	resolution?: number,
	lifeTime?: number,
	widthOverTrail?: (factor: number) => number,
	color?: RGBAColor,
	max?: number,
	layer?: number,
	width?: number,
	colorOverTrail?: (factor: number, current: RGBAColor) => RGBAColor,
}

class TrailRenderer extends Module {
	#parentTransform?: ITransform;
	#points: Array<[number, number]>;
	#lifetimes: Array<number>;
	#resolution: number;
	#max: number;
	#chain: GraphicPrimitive<PolygonalChain>;
	#sinceSpawn: number;
	#lifeTime: number;
	#color: RGBAColor;
	#width: number;
	#layer: number;
	#widthOverTrail: (factor: number) => number;
	#colorOverTrail: (factor: number, current: RGBAColor) => RGBAColor;

	constructor(params: TrailRendererConstructorParams) {
		super({});
		const {
			resolution = 10, lifeTime = 1000,
			widthOverTrail = (factor) => -factor,
			color = new RGBAColor(255, 255, 255),
			layer = 1, width = 2, max = 50,
		} = params;
		this.#lifeTime = lifeTime;
		this.#color = color;
		this.#widthOverTrail = widthOverTrail;
		this.#resolution = resolution;
		this.#points = [];
		this.#lifetimes = [];
		this.#sinceSpawn = 0;
		this.#layer = layer;
		this.#width = width;
		this.#max = max;
	}

	get WidthOverTrail() {
		return this.#widthOverTrail;
	}

	get ColorOverTrail() {
		return this.#colorOverTrail;
	}

	override Start() {
		super.Start();
		this.#parentTransform = this.gameObject?.transform;
		if(!this.#parentTransform) throw 'parent transform required';
		this.#chain = new GraphicPrimitive({
			type: PrimitiveType.Polygon,
			parent: this.#parentTransform as ITransform,
			shape: new PolygonalChain(this.#points, false),
			layer: this.#layer,
			options: {
				strokeStyle: this.#color.ToHex(),
				lineWidth: this.#width,
			},
		});
	}

	private AddPoint(point: [number, number]) {
		this.#points.splice(0, 0, point);
		this.#lifetimes.splice(0, 0, 0);
	}

	override Update() {
		super.Update();
		for (let i = this.#points.length - 1; i > -1; i--) {
			this.#lifetimes[i] += Time.deltaTime;
			if(this.#lifetimes[i] > this.#lifeTime) {
				this.#points.splice(i, 1);
				this.#lifetimes.splice(i, 1);
			}
		}
		this.#sinceSpawn += Time.deltaTime;
		if(this.#sinceSpawn < 1000 / this.#resolution || this.#points.length >= this.#max) return;
		const parentPosition = this.gameObject?.transform.WorldPosition.MultiplyCoordinates(this.gameObject?.transform.Scale.ToBinary());
		if(!parentPosition) throw 'parent not found';
		this.AddPoint([parentPosition.x, parentPosition.y]);
		this.#sinceSpawn = 0;
		this.#chain.shape.Points = this.#points;
		// SpriteRenderer.GetInstance().AddToRenderQueue(this.#chain);
	}

}

export default TrailRenderer;
