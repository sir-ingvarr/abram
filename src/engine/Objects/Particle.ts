import BasicObject from './BasicObject';
import {ICoordinates, Nullable} from '../../types/common';
import {Sprite, Time} from '../../index';
import {RGBAColor, Vector} from '../Classes';
import Collider2D, {Collider2DEvent, Collider2DType} from '../Modules/Collider';
import {CircleArea} from '../Canvas/GraphicPrimitives/Shapes';
import {GraphicPrimitive, IGraphicPrimitive} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import SpriteRenderer from '../Managers/SpriteRenderer';

export type ParticleConstructorOptions =  {
    graphic: Nullable<IGraphicPrimitive | Sprite>;
    size?: number;
    lifeTime?: number;
    initialColor?: RGBAColor;
    initialVelocity?: Vector;
    OnCollide?: (self: Collider2D, other: Collider2D) => void;
    collider?: Collider2D;
}

class Particle extends BasicObject {
	public graphic: Nullable<IGraphicPrimitive | Sprite>;
	private size: number;
	public initialScale: ICoordinates;
	public age: number;
	public lifeTime: number;
	public initialColor: RGBAColor;
	public color: RGBAColor;
	public velocity: Vector;
	public OnCollide?: (self: Collider2D, other: Collider2D) => void;
	public collider: Collider2D;

	constructor(params: ParticleConstructorOptions) {
		super(params);
		this.SetParams(params);
	}

	SetParams(params: ParticleConstructorOptions) {
		const {
			graphic, lifeTime = 10,
			initialColor = new RGBAColor(),
			size = 10, initialVelocity = new Vector(), OnCollide, collider
		} = params;
		this.graphic = graphic;
		this.lifeTime = lifeTime;
		this.size = size;
		this.age = 0;
		this.initialColor = initialColor?.Copy();
		this.initialScale = this.transform.Scale;
		this.velocity = initialVelocity.Copy();
		this.color = this.initialColor.Copy();
		if(this.graphic) this.graphic.parent = this.transform;
		this.OnCollide = OnCollide;
		if(!this.OnCollide) return;
		this.collider = collider || new Collider2D({
			shape: new CircleArea(this.size * Math.max(this.initialScale.x, this.initialScale.y), this.transform.WorldPosition.Copy()),
			type: Collider2DType.Collider,
			parent: this.transform,
		});
		this.collider.On(Collider2DEvent.OnCollision2DEnter, this.OnCollide);
	}

	Start() {
		super.Start();
		this.collider?.Start();
	}

	Destroy() {
		super.Destroy();
	}

	UpdateAge() {
		this.age += Time.deltaTime;
		if(this.age > this.lifeTime) return this.Destroy();
	}

	Update() {
		this.collider?.Update();
		this.transform.Translate(Vector.MultiplyCoordinates(Time.deltaTime / 1000, this.velocity));
		if(this.graphic instanceof GraphicPrimitive) {
			this.graphic.options.fillStyle = this.color;
		}
		if(!this.graphic) return;
		SpriteRenderer.GetInstance().AddToRenderQueue(this.graphic);
	}
}

export default Particle;