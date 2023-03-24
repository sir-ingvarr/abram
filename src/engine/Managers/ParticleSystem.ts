import {ExecutableManager} from './ExecutableManager';
import {IGameObject, IGameObjectConstructable} from '../../types/GameObject';
import Particle, {IFollower, ParticleConstructorOptions} from '../Objects/Particle';
import {Maths, PolarCoordinates, RGBAColor, Stack, Vector} from '../Classes';
import Sprite from '../Modules/Sprite';
import {ICoordinates, Nullable} from '../../types/common';
import Rigidbody from '../Modules/Rigidbody';
import ImageWrapper from '../Modules/ImageWrapper';
import Collider2D from '../Modules/Collider';
import {GraphicPrimitive, IGraphicPrimitive} from '../Canvas/GraphicPrimitives/GraphicPrimitive';
import Engine from '../Engine';
import {BasicObjectsConstructorParams} from '../Objects/BasicObject';

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
	drag?: ValueOrFunction<number>,
	emitOverTime?: ValueOrFunction<number>,
    emitOverDistance?: ValueOrFunction<number>,
    emitEachTimeFrame?: ValueOrFunction<number>;
	burstEmit?: ValueOrFunction<{ repeat: boolean, every: number, emit: ValueOrFunction<number>, skipFirst?: boolean }>
    initialVelocity?: ValueOrFunction<Vector>,
    initialPosition?: ValueOrFunction<Vector>,
    initialRotation?: ValueOrFunction<number>,
    initialColor?: ValueOrFunction<RGBAColor>,
    initialSize?: ValueOrFunction<number>,
	particleFollowers?: ValueOrFunction<Array<IGameObjectConstructable<any>>>,
    colorOverLifeTime?: PureFunction<RGBAColor>,
    velocityOverLifeTime?: PureFunction<Vector>,
    rotationOverLifeTime?: PureFunction<number>,
    scaleOverLifeTime?: PureFunction<{x: number, y: number}>;
    subEmitter?: ParticleSystem,
    onParticleCollision?: (self: Collider2D, other: Collider2D) => void,
	onParticleDestroy?: (pos: ICoordinates) => void,
}

class ParticleSystem extends ExecutableManager {
	public isPlaying: boolean;
	protected particleBuffering: boolean;
	protected occlusionCulling: boolean;
	protected particleBufferingSize: number;
	protected inheritVelocity: boolean;
	protected simulationTime: number;
	protected maxParticles: number;
	protected layer: number;
	protected gravityForceScale: number;
	protected renderingStyle: RenderingStyle;
	protected attachedRigidbody?: Rigidbody;
	protected graphic: Nullable<ValueOrFunction<ImageWrapper | GraphicPrimitive<any>>>;
	protected lifeTime: ValueOrFunction<number>;
	protected drag?: ValueOrFunction<number>;
	protected initialVelocity: ValueOrFunction<Vector>;
	protected initialPosition: ValueOrFunction<Vector>;
	protected initialRotation: ValueOrFunction<number>;
	protected initialColor: ValueOrFunction<RGBAColor>;
	protected initialSize: ValueOrFunction<number>;
	protected emitOverTime: ValueOrFunction<number>;
	protected burstEmit?: ValueOrFunction<{ repeat: boolean, every: number, emit: ValueOrFunction<number>, skipFirst?: boolean }>;
	protected emitEachTimeFrame: ValueOrFunction<number>;
	protected emitOverDistance: ValueOrFunction<number>;
	protected particleFollowers?: ValueOrFunction<Array<IGameObjectConstructable<any>>>;
	protected lastPointEmitted: Vector;
	protected timeLastEmitted: number;
	protected timeLastBurstEmitted: number;
	protected colorOverLifeTime?: PureFunction<RGBAColor>;
	protected rotationOverLifeTime?: PureFunction<number>;
	protected velocityOverLifeTime?: PureFunction<Vector>;
	protected scaleOverLifeTime?: PureFunction<{x: number, y: number}>;
	protected onParticleCollision?: (self: Collider2D, other: Collider2D) => void;
	protected onParticleDestroy?: (pos: ICoordinates) => void;

	protected readonly buffer: Stack<Particle>;

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
			burstEmit,
			drag = 0,
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
			onParticleDestroy,
			particleFollowers
		} } = params;
		this.inheritVelocity = inheritVelocity;
		if(this.inheritVelocity && !attachedRigidbody) throw 'attached rigidbbody is required for the inherit velocity usage';
		this.attachedRigidbody = attachedRigidbody;
		this.isPlaying = isPlaying;
		this.drag = drag;
		this.renderingStyle = renderingStyle;
		this.maxParticles = maxParticles;
		this.gravityForceScale = gravityForceScale;
		this.graphic = graphic;
		this.occlusionCulling = occlusionCulling;
		this.lifeTime = lifeTime;
		this.layer = layer;
		this.particleFollowers = particleFollowers;
		this.lastPointEmitted = this.parent?.transform.WorldPosition || new Vector();
		this.simulationTime = 0;
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
		this.burstEmit = burstEmit;
		this.particleBuffering = particleBuffering;
		this.onParticleCollision = onParticleCollision;
		this.onParticleDestroy = onParticleDestroy;
		if(particleBuffering) {
			this.particleBufferingSize = particleBufferSize || maxParticles + 50;
			this.buffer = new Stack<Particle>({ data: [] });
		}

		if(this.burstEmit) {
			this.timeLastBurstEmitted = Date.now();
			const { skipFirst, emit } = this.SetOrExecute(this.burstEmit);
			if(skipFirst) return;
			this.EmitNParticles(this.SetOrExecute(emit));
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
		module.UpdateAge();
		if(module.IsWaitingDestroy) {
			this.DestroyParticleSequence(module);
			return false;
		}
		this.ExecuteLifeTimeCalculations(module);
		if(!this.occlusionCulling || this.modules.size === 0) return true;
		return (module.age < 1000 || !!this.parent?.Context?.TrueBoundingBox.IsPointInside(module.transform.WorldPosition));
	}

	Update() {
		super.Update();
		if(!this.isPlaying) return;
		if(this.TotalParticles < this.maxParticles) {
			this.ExecuteEmitOverTime();
		}
		this.ExecuteEmitOverDistance();
	}

	private ExecuteEmitOverDistance() {
		if(!this.emitOverDistance || !this.parent) return;
		const amountForDist = this.SetOrExecute(this.emitOverTime);
		this.EmitNParticles(amountForDist * Vector.Distance(this.parent.transform.WorldPosition, this.lastPointEmitted));
		this.lastPointEmitted = this.parent.transform.WorldPosition;
	}

	private ExecuteEmitOverTime() {
		const now = Date.now();
		let amountToEmit = 0;
		if(this.burstEmit) {
			const timeSinceLastBurstEmitted = now - this.timeLastBurstEmitted;

			const { repeat, every = 0, emit = 0 } = this.SetOrExecute(this.burstEmit);
			if(repeat && every && every <= timeSinceLastBurstEmitted) {
				amountToEmit += this.SetOrExecute(emit);
			}
			if(amountToEmit > 0) this.timeLastBurstEmitted = Date.now();
		}
		const timeSinceLastEmitted = now - this.timeLastEmitted;
		if(this.SetOrExecute(this.emitEachTimeFrame, now) < timeSinceLastEmitted) {
			this.timeLastEmitted = now;
			amountToEmit += this.SetOrExecute(this.emitOverTime);
		}
		this.EmitNParticles(amountToEmit);
	}

	private async EmitNParticles(n: number) {
		for(let i = 0; i < n; i++) {
			this.RegisterModule(await this.CreateOrObtainParticle());
		}
	}

	get TotalParticles(): number {
		return this.modules.size;
	}

	private DestroyParticleSequence(particle: Particle) {
		if(this.onParticleDestroy) this.onParticleDestroy(particle.transform.LocalPosition);
		particle.age = 0;
		if(this.particleBuffering && this.buffer.Count < this.particleBufferingSize) {
			this.buffer.Push(particle);
		} else {
			particle.collider?.Destroy();
		}
		this.UnregisterModuleById(particle.Id);
		particle.NeedDestroy = false;
	}

	private ExecuteLifeTimeCalculations(particle: Particle) {
		const lifetimeFactor = particle.age / particle.lifeTime;
		if(this.colorOverLifeTime) particle.color = this.colorOverLifeTime(particle.initialColor, lifetimeFactor);
		if(this.rotationOverLifeTime) particle.transform.LocalRotationDeg += this.rotationOverLifeTime(lifetimeFactor);
		if(this.velocityOverLifeTime) particle.velocity.Add(this.velocityOverLifeTime(lifetimeFactor));
		if(this.gravityForceScale) particle.velocity.Add(new Vector(0, 9.8 * this.gravityForceScale));
		if(this.drag) particle.velocity.MultiplyCoordinates((1 - particle.drag));
		if(this.scaleOverLifeTime) {
			const scale = this.scaleOverLifeTime(lifetimeFactor);
			particle.transform.LocalScale = new Vector(
				particle.initialScale.x * scale.x,
				particle.initialScale.y *  scale.y
			);
		}
	}

	private async CreateOrObtainParticle(): Promise<Particle> {
		let particle: Particle;
		if(this.particleBuffering && this.buffer.Count > 0) {
			particle = this.buffer.Pop() as Particle;
			const props = this.GetParticleInitialProps(particle.graphic);

			const followersConstructs = this.SetOrExecute(this.particleFollowers);
			if(followersConstructs) {
				const followerPromises = followersConstructs.map(follower => Engine.Instantiate<IFollower & BasicObjectsConstructorParams>({gameObject: follower, params: {}}));
				props.followers = await Promise.all(followerPromises);
			}
			particle.SetParams(props);
			particle.initialScale = Vector.One;
		} else {
			const graphic = this.SetOrExecute(this.graphic);
			const props = this.GetParticleInitialProps(graphic);
			const followersConstructs = this.SetOrExecute(this.particleFollowers);
			if(followersConstructs) {
				const followerPromises = followersConstructs.map(follower => Engine.Instantiate<IFollower & BasicObjectsConstructorParams>({gameObject: follower, params: {}}));
				props.followers = await Promise.all(followerPromises);
			}
			particle = new Particle(props);
		}
		const initialPosVal = this.SetOrExecute(this.initialPosition);
		particle.transform.LocalPosition = this.parent?.transform?.LocalPosition.Add(initialPosVal) || initialPosVal;
		particle.transform.LocalRotationDeg = this.SetOrExecute(this.initialRotation);
		return particle;
	}

	GetParticleInitialProps(graphic: Nullable<Sprite | ImageWrapper | IGraphicPrimitive<any>>): ParticleConstructorOptions {
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
			drag: this.SetOrExecute(this.drag),
			lifeTime: this.SetOrExecute(this.lifeTime),
			size: this.SetOrExecute(this.initialSize),
			OnCollide: this.onParticleCollision,
			initialVelocity: this.SetOrExecute(this.initialVelocity),
		};
	}
}

export default ParticleSystem;
