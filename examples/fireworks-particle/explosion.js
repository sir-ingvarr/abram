
const { Time, GraphicPrimitives: { GraphicPrimitive, PrimitiveType, ShapeDrawMethod }, Shapes: { Rect, Circle }, Sprite, ImageWrapper, Classes: {RGBAColor, Vector, Maths, PolarCoordinates}, ParticleSystem } = window.Abram;

class Explosion extends GameObject {
    lifetime;
    color

    constructor(params) {
        super(params);
        this.lifetime = params.lifetime || 500;
        this.color = params.color || new RGBAColor();
        this.onParticleDestroy = params.onParticleDestroy || (() => {});
    }

    Start() {
        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                renderingStyle: RenderingStyle.World,
                layer: 3,
                occlusionCulling: true,
                particleBuffering: false,
                graphic: () => new GraphicPrimitive({
                    type: PrimitiveType.Rect,
                    shape: new Rect(new Point(), new Point(10, 10)),
                    parent: this.Transform,
                    drawMethod: ShapeDrawMethod.Fill,
                }),
                lifeTime: () => Maths.RandomRange(0.7, 1.2) * 1000,
                emitOverTime: 0,
                maxParticles: 1000,
                burstEmit: () => ({ repeat: false, emit: 120, every: 500, skipFirst: false }),
                initialColor: this.color,
                colorOverLifeTime: (initial, factor) => {
                    const color = initial.Copy();
                    color.Alpha = 180;
                    return initial.LerpTo(color, factor)
                },
                gravityForceScale: 0.15,
                rotationOverLifeTime: factor => {
                    return Maths.Lerp(0, -10, factor);
                },
                initialVelocity: () => new PolarCoordinates({ r: Maths.RandomRange(0, 350),angle: Maths.RandomRange(0, 2*Math.PI) }).ToCartesian().ToVector(),//Vector.Of(Maths.RandomRange(-150, 150), Maths.RandomRange(-150, 150)),
                initialSize: () => Maths.RandomRange(15, 35),
                scaleOverLifeTime: factor => ({ x: Maths.Clamp(1 - factor, 0.1, 1.5), y: Maths.Clamp(1 - factor, 0.1, 1.5)}),
                initialPosition: Vector.Zero,
                onParticleDestroy: (pos) => {
                    this.onParticleDestroy(pos);
                },
            },
        });
    }

    Update() {
        this.lifetime -= Time.deltaTime;
        if(this.lifetime < 0) return this.Destroy();
        super.Update();
        this.particleSystem.Update();

    }
}
