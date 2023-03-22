import {ExecutableManager} from './ExecutableManager';
import {IGameObject} from '../../types/GameObject';
import Particle, {ParticleConstructorOptions} from '../Objects/Particle';
import {Maths, PolarCoordinates, RGBAColor, Vector} from '../Classes';
import Sprite from '../Modules/Sprite';
import {Nullable} from '../../types/common';
import Rigidbody from '../Modules/Rigidbody';
import ImageWrapper from '../Modules/ImageWrapper';
import Collider2D from '../Modules/Collider';
import {GraphicPrimitive, IGraphicPrimitive} from '../Canvas/GraphicPrimitives/GraphicPrimitive';

export enum RenderingStyle {
    Local,
    World,
}

type PureFunction<T> = (...args: any) => T;
type ValueOrFunction<T> =
    | T
    | PureFunction<T>;

export type ParticleSystemOptions = {
    isPlaying?: boolean,
    particleBuffering?: boolean,
    occlusionCulling?: boolean,
    particleBufferSize?: number,
    inheritVelocity?: boolean
    maxParticles?: number,
	layer: number;
    gravityForceScale?: number,
    timeLastEmitted?: number;
    attachedRigidbody?: Rigidbody;
    renderingStyle?: RenderingStyle,
    graphic?: ValueOrFunction<ImageWrapper | GraphicPrimitive<any>>,
    lifeTime?: ValueOrFunction<number>,
    emitOverTime?: ValueOrFunction<number>,
    emitOverDistance?: ValueOrFunction<number>,
    emitEachTimeFrame?: ValueOrFunction<number>;
    initialVelocity?: ValueOrFunction<Vector>,
    initialPosition?: ValueOrFunction<Vector>,
    initialRotation?: ValueOrFunction<number>,
    initialColor?: ValueOrFunction<RGBAColor>,
    initialSize?: ValueOrFunction<number>,
    colorOverLifeTime?: PureFunction<RGBAColor>,
    velocityOverLifeTime?: PureFunction<Vector>,
    rotationOverLifeTime?: PureFunction<number>,
    scaleOverLifeTime?: PureFunction<{x: number, y: number}>;
    subEmitter?: ParticleSystem,
    onParticleCollision?: (self: Collider2D, other: Collider2D) => void,
}

class ParticleSystem extends ExecutableManager {
	public isPlaying: boolean;
	protected particleBuffering: boolean;
	protected occlusionCulling: boolean;
	protected particleBufferingSize: number;
	protected inheritVelocity: boolean;
	protected maxParticles: number;
	protected layer: number;
	protected gravityForceScale: number;
	protected renderingStyle: RenderingStyle;
	protected attachedRigidbody?: Rigidbody;
	protected graphic: Nullable<ValueOrFunction<ImageWrapper | GraphicPrimitive<any>>>;
	protected lifeTime: ValueOrFunction<number>;
	protected initialVelocity: ValueOrFunction<Vector>;
	protected initialPosition: ValueOrFunction<Vector>;
	protected initialRotation: ValueOrFunction<number>;
	protected initialColor: ValueOrFunction<RGBAColor>;
	protected initialSize: ValueOrFunction<number>;
	protected emitOverTime: ValueOrFunction<number>;
	protected emitEachTimeFrame: ValueOrFunction<number>;
	protected emitOverDistance: ValueOrFunction<number>;
	protected timeLastEmitted: number;
	protected colorOverLifeTime?: PureFunction<RGBAColor>;
	protected rotationOverLifeTime?: PureFunction<number>;
	protected velocityOverLifeTime?: PureFunction<Vector>;
	protected scaleOverLifeTime?: PureFunction<{x: number, y: number}>;
	protected onParticleCollision?: (self: Collider2D, other: Collider2D) => void;
	// protected readonly modules: Map<string, Particle>;
	protected readonly buffer: Array<Particle> = [];

	constructor(params: { modules?: Array<Particle>, parent: IGameObject, params: ParticleSystemOptions }) {
		super(params);
		const { params: {
			isPlaying = true,
			inheritVelocity = false,
			particleBuffering = false,
			occlusionCulling = true,
			particleBufferSize,
			attachedRigidbody,
			maxParticles = 10,
			gravityForceScale = 1,
			graphic = null,
			layer = 0,
			renderingStyle = RenderingStyle.Local,
			lifeTime = 5000,
			emitOverTime = 10,
			emitOverDistance = 0,
			emitEachTimeFrame = 0.2,
			initialPosition = () => {
				const { x = 0, y = 0 } = this.parent?.transform.WorldPosition as Vector;
				return new PolarCoordinates({ x, y, r: Maths.RandomRange(0, 2), angle: Maths.RandomRange(0, 6.18) })
						.ToCartesian().ToVector();
			},
			initialVelocity = new Vector(),
			initialRotation = function () {
				return Maths.RandomRange(0, 360);
			},
			initialSize = function () {
				return Maths.RandomRange(-10, 10);
			},
			initialColor = new RGBAColor(255, 255, 255),
			colorOverLifeTime,
			velocityOverLifeTime,
			rotationOverLifeTime,
			scaleOverLifeTime,
			onParticleCollision,
		} } = params;
		this.inheritVelocity = inheritVelocity;
		if(this.inheritVelocity && !attachedRigidbody) throw 'attached rigidbbody is required for the inherit velocity usage';
		this.attachedRigidbody = attachedRigidbody;
		this.isPlaying = isPlaying;
		this.renderingStyle = renderingStyle;
		this.maxParticles = maxParticles;
		this.gravityForceScale = gravityForceScale;
		this.graphic = graphic;
		this.occlusionCulling = occlusionCulling;
		this.lifeTime = lifeTime;
		this.layer = layer;
		this.initialVelocity = initialVelocity;
		this.initialRotation = initialRotation;
		this.initialColor = initialColor;
		this.initialSize = initialSize;
		this.initialPosition = initialPosition;
		this.colorOverLifeTime = colorOverLifeTime;
		this.velocityOverLifeTime = velocityOverLifeTime;
		this.rotationOverLifeTime = rotationOverLifeTime;
		this.scaleOverLifeTime = scaleOverLifeTime;
		this.timeLastEmitted = Date.now();
		this.emitEachTimeFrame = emitEachTimeFrame;
		this.emitOverDistance = emitOverDistance;
		this.emitOverTime = emitOverTime;
		this.particleBuffering = particleBuffering;
		this.onParticleCollision = onParticleCollision;
		if(particleBuffering) {
			this.particleBufferingSize = particleBufferSize || maxParticles + 50;
		}
	}

	public Play() {
		this.isPlaying = true;
	}

	public Pause() {
		this.isPlaying = false;
	}

	protected SetOrExecute<T = any>(val: ValueOrFunction<T>, ...args: any): T {
		if(typeof val === 'function') {
			return (val as (...args: any) => T)(...args);
		}
		return val;
	}

	protected PostModuleRegister(module: Particle) {
		super.PostModuleRegister(module);
		if(this.parent) {
			module.context = this.parent.Context;
			module.transform.Parent = this.parent.transform;
		}
	}

	protected PreUpdate(module: Particle): boolean {
		if(!super.PreUpdate(module)) return false;
		if(module.IsWaitingDestroy) {
			this.DestroyParticleSequence(module);
			return false;
		}
		module.UpdateAge();
		this.ExecuteLifeTimeCalculations(module);
		if(!this.occlusionCulling || this.modules.size === 0) return true;
		return (module.age < 1000 || !!this.parent?.Context?.TrueBoundingBox.IsPointInside(module.transform.WorldPosition));
	}

	Update() {
		super.Update();
		if(!this.isPlaying) return;
		const now = Date.now();
		const timeSinceLastEmitted = now - this.timeLastEmitted;
		if(this.TotalParticles < this.maxParticles && this.SetOrExecute(this.emitEachTimeFrame, now) < timeSinceLastEmitted) {
			this.timeLastEmitted = now;
			const emitAmount = this.SetOrExecute(this.emitOverTime);
			for(let i = 0; i < emitAmount; i++) {
				this.RegisterModule(this.CreateOrObtainParticle());
			}
		}
	}

	get TotalParticles(): number {
		return this.modules.size;
	}

	private DestroyParticleSequence(particle: Particle) {
		particle.NeedDestroy = false;
		particle.age = 0;
		if(this.particleBuffering && this.buffer.length < this.particleBufferingSize) {
			this.buffer.push(particle);
		} else {
			particle.collider?.Destroy();
		}
		this.UnregisterModuleById(particle.Id);
	}

	ExecuteLifeTimeCalculations(particle: Particle) {
		const lifetimeFactor = particle.age / particle.lifeTime;
		if(this.colorOverLifeTime) particle.color = this.colorOverLifeTime(particle.initialColor, lifetimeFactor);
		if(this.rotationOverLifeTime) particle.transform.LocalRotationDeg += this.rotationOverLifeTime(lifetimeFactor);
		if(this.velocityOverLifeTime) particle.velocity.Add(this.velocityOverLifeTime(lifetimeFactor));
		if(this.gravityForceScale) particle.velocity.Add(new Vector(0, 9.8 * this.gravityForceScale));
		if(this.scaleOverLifeTime) {
			const scale = this.scaleOverLifeTime(lifetimeFactor);
			particle.transform.LocalScale = new Vector(
				particle.initialScale.x * scale.x,
				particle.initialScale.y *  scale.y
			);
		}
	}


	private CreateOrObtainParticle(): Particle {
		let particle: Particle;
		if(this.particleBuffering && this.buffer.length > 0) {
			particle = this.buffer.pop() as Particle;
			const props = this.GetParticleInitialProps(particle.graphic);
			particle.SetParams(props);
			particle.initialScale = Vector.One;
		} else {
			const graphic = this.SetOrExecute(this.graphic);
			const props = this.GetParticleInitialProps(graphic);
			particle = new Particle(props);
		}
		const initialPosVal = this.SetOrExecute(this.initialPosition);
		particle.transform.LocalPosition = this.parent?.transform?.LocalPosition.Add(initialPosVal) || initialPosVal;
		particle.transform.LocalRotationDeg = this.SetOrExecute(this.initialRotation);
		return particle;
	}

	GetParticleInitialProps(graphic: Nullable<Sprite | ImageWrapper | IGraphicPrimitive>): ParticleConstructorOptions {
		const size = this.SetOrExecute(this.initialSize);
		let graphicObj;
		if(graphic instanceof Sprite || graphic instanceof GraphicPrimitive) graphicObj = graphic;
		else graphicObj = new Sprite({
			image: graphic as ImageWrapper,
			width: size,
			height: size
		});
		return {
			initialColor: this.SetOrExecute(this.initialColor),
			graphic: graphicObj,
			layer: this.layer,
			lifeTime: this.SetOrExecute(this.lifeTime),
			size: this.SetOrExecute(this.initialSize),
			OnCollide: this.onParticleCollision,
			initialVelocity: this.SetOrExecute(this.initialVelocity),
		};
	}
}

export default ParticleSystem;
