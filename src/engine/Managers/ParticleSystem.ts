import {ExecutableManager} from "./ExecutableManager";
import {IGameObject} from "../../types/GameObject";
import Particle from "../Particle";
import {Maths, RGBAColor, Vector} from "../Classes";
import Sprite from "../Modules/Sprite";
import {Nullable} from "../../types/common";
import Rigidbody from "../Modules/Rigidbody";
import ImageWrapper from "../Modules/ImageWrapper";

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
    particleBufferSize?: number,
    inheritVelocity?: boolean
    maxParticles?: number,
    gravityForceScale?: number,
    timeLastEmitted?: number;
    attachedRigidbody?: Rigidbody;
    renderingStyle?: RenderingStyle,
    sprite?: ValueOrFunction<ImageWrapper>,
    lifeTime?: ValueOrFunction<number>,
    emitOverTime?: ValueOrFunction<number>,
    emitOverDistance?: ValueOrFunction<number>,
    emitEachTimeFrame?: ValueOrFunction<number>;
    initialVelocity?: ValueOrFunction<Vector>,
    initialRotation?: ValueOrFunction<number>,
    initialColor?: ValueOrFunction<RGBAColor>,
    initialSize?: ValueOrFunction<number>,
    colorOverLifeTime?: PureFunction<RGBAColor>,
    velocityOverLifeTime?: PureFunction<Vector>,
    rotationOverLifeTime?: PureFunction<number>,
    sizeOverLifeTime?: PureFunction<number>;
    subEmitter?: ParticleSystem,
}

class ParticleSystem extends ExecutableManager {
    public isPlaying: boolean;
    protected particleBuffering: boolean;
    protected particleBufferingSize: number;
    protected inheritVelocity: boolean;
    protected maxParticles: number;
    protected gravityForceScale: number;
    protected renderingStyle: RenderingStyle;
    protected attachedRigidbody?: Rigidbody;
    protected sprite: Nullable<ValueOrFunction<ImageWrapper>>;
    protected lifeTime: ValueOrFunction<number>;
    protected initialVelocity: ValueOrFunction<Vector>;
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
    protected sizeOverLifeTime?: PureFunction<number>;
    protected readonly modules: Map<string, Particle>;
    protected readonly buffer: Array<Particle> = [];

    constructor(params: { modules?: Array<Particle>, parent: IGameObject, params: ParticleSystemOptions }) {
        super(params);
        const { params: {
            isPlaying = true,
            inheritVelocity = false,
            particleBuffering = false,
            particleBufferSize,
            attachedRigidbody,
            maxParticles = 10,
            gravityForceScale = 1,
            sprite = null,
            renderingStyle = RenderingStyle.Local,
            lifeTime = 5000,
            emitOverTime = 10,
            emitOverDistance = 0,
            emitEachTimeFrame = 0.2,
            initialVelocity = function () {
                return new Vector(Maths.RandomRange(-1,1), Maths.RandomRange(-1, 1));
            },
            initialRotation = function () {
                return Maths.RandomRange(0, 360)
            },
            initialSize = function () {
                return Maths.RandomRange(-10, 10)
            },
            initialColor = new RGBAColor(255, 255, 255),
            colorOverLifeTime,
            velocityOverLifeTime,
            rotationOverLifeTime,
            sizeOverLifeTime,
        } } = params;
        this.inheritVelocity = inheritVelocity;
        if(this.inheritVelocity && !attachedRigidbody) throw "attached rigidbbody is required for the inherit velocity usage";
        this.attachedRigidbody = attachedRigidbody;
        this.isPlaying = isPlaying;
        this.renderingStyle = renderingStyle;
        this.maxParticles = maxParticles;
        this.gravityForceScale = gravityForceScale;
        this.sprite = sprite;
        this.lifeTime = lifeTime;
        this.initialVelocity = initialVelocity;
        this.initialRotation = initialRotation;
        this.initialColor = initialColor;
        this.initialSize = initialSize;
        this.colorOverLifeTime = colorOverLifeTime;
        this.velocityOverLifeTime = velocityOverLifeTime;
        this.rotationOverLifeTime = rotationOverLifeTime;
        this.sizeOverLifeTime = sizeOverLifeTime;
        this.timeLastEmitted = Date.now();
        this.emitEachTimeFrame = emitEachTimeFrame;
        this.emitOverDistance = emitOverDistance;
        this.emitOverTime = emitOverTime;
        this.particleBuffering = particleBuffering;
        if(particleBuffering) {
            this.particleBufferingSize = particleBufferSize || maxParticles;
        }
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
            module.transform.SetParent(this.parent.transform);
        }
    }

    protected PreUpdate(module: Particle): boolean {
        if(!super.PreUpdate(module)) return false;
        if(module.IsWaitingDestroy) {
            this.UnregisterModuleById(module.Id);
            return false;
        }
        return true;
    }

    Update() {
        super.Update();
        const now = Date.now();
        const timeSinceLastEmitted = now - this.timeLastEmitted;
        const particles = this.modules.values();
        for(let particle of particles) {
            if(particle.IsWaitingDestroy) {
                particle.age = 0;
                if(this.particleBuffering && this.buffer.length < this.particleBufferingSize) this.buffer.push(particle);
                this.UnregisterModuleById(particle.Id);
                continue;
            }
            const lifetimeFactor = particle.age / particle.lifetime;
            if(this.colorOverLifeTime) particle.color = this.colorOverLifeTime(lifetimeFactor);
            if(this.rotationOverLifeTime) particle.transform.LocalRotationDeg = this.rotationOverLifeTime(lifetimeFactor);
            if(this.velocityOverLifeTime) particle.velocity.Add(this.velocityOverLifeTime(lifetimeFactor));
            if(this.sizeOverLifeTime) particle.SetSize(this.sizeOverLifeTime(lifetimeFactor));
            if(this.gravityForceScale) particle.velocity.Add(new Vector(0, 9.8 * this.gravityForceScale));
        }
        // emit more if needed
        if(this.modules.size < this.maxParticles && this.SetOrExecute(this.emitEachTimeFrame, now) < timeSinceLastEmitted) {
            this.timeLastEmitted = now;
            const emitAmount = this.SetOrExecute(this.emitOverTime);
            for(let i = 0; i < emitAmount; i++) {
                const initialSize = this.SetOrExecute(this.initialSize);
                const particle = this.particleBuffering && this.buffer.length
                    ? this.buffer.pop() as Particle
                    : new Particle({
                        sprite: new Sprite({
                            image: this.SetOrExecute(this.sprite) as ImageWrapper,
                            width: initialSize,
                            height: initialSize
                        }),
                        lifeTime: this.SetOrExecute(this.lifeTime),
                        initialSize: initialSize
                    });
                particle.velocity = this.SetOrExecute(this.initialVelocity);
                particle.transform.LocalPosition = this.parent?.transform?.LocalPosition || new Vector();
                particle.transform.LocalRotationDeg = this.SetOrExecute(this.initialRotation);
                particle.color = this.SetOrExecute(this.initialColor);
                this.RegisterModule(particle);
            }
        }
    }
}

export default ParticleSystem;
