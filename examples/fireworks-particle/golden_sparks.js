
class GoldenSparks extends GameObject {
    lifetime;
    color

    constructor(params) {
        super(params);
        this.lifetime = params.lifetime || 500;
        this.color = RGBAColor.FromHex('#ffd452');
    }

    Start() {
        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                renderingStyle: RenderingStyle.World,
                layer: 2,
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => new GraphicPrimitive({
                    type: PrimitiveType.Rect,
                    shape: new Rect(new Point(), new Point(10, 10)),
                    parent: this.Transform,
                    drawMethod: ShapeDrawMethod.Fill,
                }),
                lifeTime: () => Maths.RandomRange(1, 1.5) * 1000,
                emitOverTime: 0,
                maxParticles: 5,
                burstEmit: () => ({ repeat: false, emit: Maths.RandomRange(3, 5), every: 500, skipFirst: false }),
                initialColor: this.color,
                colorOverLifeTime: (initial, factor) => {
                    const color = initial.Copy();
                    color.Alpha = 180;
                    return initial.LerpTo(color, factor)
                },
                gravityForceScale: 0,
                initialVelocity: Vector.Zero,
                initialSize: () => Maths.RandomRange(2, 6),
                scaleOverLifeTime: factor => ({ x: Math.sin(2 * Math.PI * factor), y: Math.sin(2 * Math.PI * factor)}),
                initialPosition: () => {
                    return new PolarCoordinates({
                        r: Maths.RandomRange(0, 20),
                        angle: Maths.RandomRange(0, 2*Math.PI)
                    }).ToCartesian().ToVector()
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
