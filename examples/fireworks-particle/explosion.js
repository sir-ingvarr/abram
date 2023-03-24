const { GameObject,Time, GraphicPrimitives: { GraphicPrimitive, PrimitiveType, ShapeDrawMethod }, Shapes: { Circle, Rect }, ImageWrapper, Classes: {RGBAColor, Vector, Maths, PolarCoordinates}, ParticleSystem } = window.Abram;

const colors = [
    new RGBAColor(255),
    new RGBAColor(0, 255),
    new RGBAColor(252, 235, 3),
    new RGBAColor(140, 3, 252),
    new RGBAColor(250, 170, 20),
]

class Explosion extends GameObject {
    lifetime;
    constructor(params) {
        super(params);
        this.lifetime = params.lifetime || 5;
    }

    Start() {
        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => new GraphicPrimitive({
                    type: PrimitiveType.Rect,
                    shape: new Rect(new Point, new Point(10, 10)),
                    parent: this.Transform,
                    drawMethod: ShapeDrawMethod.Fill,
                }),
                lifeTime: () => Maths.RandomRange(1.5, 2) * 1000,
                emitOverTime: 0,
                maxParticles: 20000,
                burstEmit: () => ({ repeat: false, emit: 120, every: 500, skipFirst: false }),
                initialColor: () => colors[Maths.RandomRange(0, colors.length - 1, true)],
                colorOverLifeTime: (initial, factor) => {
                    const color = initial.Copy();
                    color.Alpha = 180;
                    return initial.LerpTo(color, factor)
                },
                gravityForceScale: 0.3,
                rotationOverLifeTime: factor => Maths.Lerp(0, -20, factor),
                initialVelocity: () => Vector.Of(Maths.RandomRange(-300, 300), Maths.RandomRange(-300, 300)),
                initialSize: () => Maths.RandomRange(2, 4),
                scaleOverLifeTime: factor => ({ x: Maths.Clamp(1 - factor, 0.1, 1.5), y: Maths.Clamp(1 - factor, 0.1, 1.5)}),
                initialPosition: Vector.Zero
            },
        });
        // this.particleSystem.Pause();
    }

    Update() {
        this.lifetime -= Time.deltaTime;
        if(this.lifetime < 0) return this.Destroy();
        super.Update();
        this.particleSystem.Update();

    }
}
