const { GameObject,Time, GraphicPrimitives: { GraphicPrimitive, PrimitiveType, ShapeDrawMethod }, Shapes: { Rect, Circle }, Sprite, ImageWrapper, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

class Explosion extends GameObject {
    lifetime;
    color

    constructor(params) {
        super(params);
        this.lifetime = params.lifetime || 5;
        this.color = params.color || new RGBAColor();
    }

    Start() {
        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => new GraphicPrimitive({
                    layer: 10,
                    type: PrimitiveType.Rect,
                    shape: new Rect(new Point(), new Point(10, 10)),
                    parent: this.Transform,
                    drawMethod: ShapeDrawMethod.Fill,
                }),
                lifeTime: () => Maths.RandomRange(1, 2) * 1000,
                emitOverTime: 0,
                maxParticles: 20000,
                burstEmit: () => ({ repeat: false, emit: 120, every: 500, skipFirst: false }),
                initialColor: this.color,
                colorOverLifeTime: (initial, factor) => {
                    const color = initial.Copy();
                    color.Alpha = 180;
                    return initial.LerpTo(color, factor)
                },
                gravityForceScale: 0.1,
                rotationOverLifeTime: factor => Maths.Lerp(0, -3, factor),
                initialVelocity: () => Vector.Of(Maths.RandomRange(-150, 150), Maths.RandomRange(-150, 150)),
                initialSize: () => Maths.RandomRange(10, 30),
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
