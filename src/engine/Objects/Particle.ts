import BasicObject, {BasicObjectsConstructorParams} from './BasicObject';
import {ICoordinates, Nullable} from '../../types/common';
import {Sprite, Time} from '../../index';
import {Maths, RGBAColor, Vector} from '../Classes';
import Collider2D, {Collider2DEvent, Collider2DType} from '../Modules/Collider';
import {CircleArea} from '../Canvas/GraphicPrimitives/Shapes';
import {GraphicPrimitive, IGraphicPrimitive} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import SpriteRenderer from '../Managers/SpriteRenderer';
import {IBasicObject} from '../../types/GameObject';

export interface IFollower {
	Destroy(): void
}

export type ParticleConstructorOptions = BasicObjectsConstructorParams & {
    graphic?: IGraphicPrimitive<any> | Sprite;
    size?: number;
	layer: number;
	drag?: number;
    lifeTime?: number;
	gravityScale?: number;
    initialColor?: RGBAColor;
    initialVelocity?: Vector;
    OnCollide?: (self: Collider2D, other: Collider2D) => void;
    collider?: Collider2D;
	followers?: Array<IBasicObject>;
}

class Particle extends BasicObject {
	public graphic: Nullable<IGraphicPrimitive<any> | Sprite>;
	private size: number;
	public drag: number;
	public initialScale: ICoordinates;
	public age: number;
	public lifeTime: number;
	public gravityScale: number;
	public initialColor: RGBAColor;
	public color: RGBAColor;
	public velocity: Vector;
	public OnCollide?: (self: Collider2D, other: Collider2D) => void;
	public collider: Collider2D;
	private followers?: Array<IBasicObject>;

	constructor(params: ParticleConstructorOptions) {
		super(params);
		this.SetParams(params);
	}

	SetParams(params: ParticleConstructorOptions) {
		const {
			graphic, lifeTime = 10, layer, drag = 0,
			initialColor = new RGBAColor(), followers,
			size = 10, initialVelocity = new Vector(), OnCollide, collider, gravityScale = 1
		} = params;
		if(graphic) {
			graphic.layer = layer;
			this.graphic = graphic;
		}
		this.drag = Maths.Clamp(drag, -1 ,1);
		this.lifeTime = lifeTime;
		this.size = size;
		this.gravityScale = gravityScale;
		this.age = 0;
		this.followers = followers;
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

	override Start() {
		super.Start();
		this.collider?.Start();
	}

	override Destroy() {
		if(this.followers) {
			this.followers.forEach(val => val.Destroy());
		}
		super.Destroy();
	}

	UpdateAge() {
		this.age += Time.deltaTime;
		if(this.age > this.lifeTime) return this.Destroy();
	}

	override Update() {
		this.collider?.Update();
		this.transform.Translate(Vector.MultiplyCoordinates(Time.deltaTime / 1000, this.velocity));

		if(!this.graphic) return;
		if(this.graphic instanceof GraphicPrimitive) {
			this.graphic.options.fillStyle = this.color.ToHex();
		}
		SpriteRenderer.GetInstance().AddToRenderQueue(this.graphic);
		if(this.followers) {
			const {x, y} = this.transform.WorldPosition;

			for (const follower of this.followers) {
				follower.transform.LocalPosition = new Vector(x,y);
			}
		}
	}
}

export default Particle;