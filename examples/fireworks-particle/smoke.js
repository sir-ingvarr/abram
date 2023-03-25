const { ParticleSystemAssets: {RenderingStyle} } = Abram;

class Smoke extends GameObject {

    constructor(params) {
        super(params);
    }

    Start() {

        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                layer: 3,
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => new GraphicPrimitive({
                    layer:3,
                    type: PrimitiveType.Rect,
                    shape: new Rect(new Point(), new Point(10, 10)),
                    parent: this.Transform,
                    drawMethod: ShapeDrawMethod.Fill,
                }),
                lifeTime: () => Maths.RandomRange(0.2, 0.5) * 1000,
                maxParticles: 10,
                emitOverTime: 0,
                emitEachTimeFrame: 0,
                emitOverDistance: 0.5,
                gravityForceScale: 0,
                initialColor: new RGBAColor(240, 50, 0),
                colorOverLifeTime: (initial, factor) => initial.LerpTo(new RGBAColor(10, 10, 10, 30), factor - 0.1),
                initialVelocity: Vector.Zero,
                renderingStyle: RenderingStyle.World,
                scaleOverLifeTime: factor => ({ x: 1 - factor, y: 1 - factor }),
                initialSize: () => Maths.RandomRange(5, 10),
                initialPosition: Vector.Zero,
            },
        });
    }

    UpdateFollowedPosition(x, y) {
        this.transform.LocalPosition = new Point(x, y);
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
