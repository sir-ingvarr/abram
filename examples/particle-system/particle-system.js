
const { GameObject, GraphicPrimitives: { GraphicPrimitive, PrimitiveType, ShapeDrawMethod }, Shapes: { Circle, Rect }, ImageWrapper, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

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
                graphic: () => {
                    const random = Math.random();
                    return new GraphicPrimitive({
                        type: random < 0.5 ? PrimitiveType.Circle : PrimitiveType.Rect,
                        shape: random < 0.5 ? new Circle(20, new Point()) : new Rect(new Point, new Point(20, 20)),
                        parent: this.Transform,
                        drawMethod: ShapeDrawMethod.Fill,
                    })
                },
                lifeTime: () => Maths.RandomRange(7, 10) * 1000,
                maxParticles: 5000,
                emitOverTime: 15,
                emitEachTimeFrame: 40,
                initialColor: () => new RGBAColor(Maths.RandomRange(0, 255), Maths.RandomRange(0, 255), Maths.RandomRange(0, 255), 190),
                colorOverLifeTime: (initial, factor) => {
                    const color = initial.Copy();
                    color.Alpha = 0;
                    return initial.LerpTo(color, factor)
                },
                gravityForceScale: 0.4,
                rotationOverLifeTime: factor => Maths.Lerp(0, -20, factor),
                initialVelocity: () => Vector.Zero,
                initialSize: () => Maths.RandomRange(5, 10),
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
