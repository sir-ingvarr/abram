
const { GameObject, GraphicPrimitives: { CirclePrimitive, RectPrimitive }, Shapes: { Circle, Rect }, ImageWrapper, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

class ParticleSystemTest extends GameObject {
    constructor(cam, params) {
        super(params);
        this.cam = cam;
    }

    Start() {
        const blue = new RGBAColor(0, 0, 200);
        const orange = new RGBAColor(250, 170, 20, 100);

        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => Math.random() < 0.5 ? new CirclePrimitive(new Circle(20, new Point()), this)
                : new RectPrimitive(new Rect(new Point, new Point(50, 50)), this),
                lifeTime: () => Maths.RandomRange(8, 10) * 1000,
                maxParticles: 5000,
                emitOverTime: 15,
                emitEachTimeFrame: 40,
                initialColor: new RGBAColor(255, 0, 0),
                colorOverLifeTime: (initial, factor) => initial.LerpTo(orange, factor),
                gravityForceScale: 0.4,
                rotationOverLifeTime: factor => Maths.Lerp(0, -20, factor),
                initialVelocity: () => Vector.zero,
                initialSize: () => Maths.RandomRange(5, 30),
                scaleOverLifeTime: factor => ({ x: Maths.Clamp(1 - factor, 0.1, 1), y: 1 }),
                initialPosition: () => new Vector(Maths.RandomRange(-550, 550), Maths.RandomRange(-10, 50))
            },
        });
        // this.particleSystem.Pause();
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
