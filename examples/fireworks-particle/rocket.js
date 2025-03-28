
class Rocket extends GameObject {
    onParticleDestroy;
    childParticleSystemGO;

    constructor(params) {
        super(params);
        this.onParticleDestroy = params.onParticleDestroy;
        this.childParticleSystemGO = params.childParticleSystemGO;
    }

    Start() {

        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                layer: 2,
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => new GraphicPrimitive({
                    type: PrimitiveType.Circle,
                    shape: new Circle(10, new Point()),
                    parent: this.Transform,
                    drawMethod: ShapeDrawMethod.Fill,
                }),
                lifeTime: () => Maths.RandomRange(.7, 2.5)*1000,
                maxParticles: 30,
                emitOverTime: () => Maths.RandomRange(5, 13, true),
                particleFollowers: [this.childParticleSystemGO],
                emitEachTimeFrame: 2000,
                gravityForceScale: 0.18,
                initialColor: new RGBAColor(20, 20, 20, 210),
                initialVelocity: () => Vector.Of(Maths.RandomRange(-200, 200), Maths.RandomRange(-290, -550)),
                initialSize: () => Maths.RandomRange(8, 15),
                initialPosition: () => Vector.Of(Maths.RandomRange(-540, 540), 350),
                onParticleDestroy: this.onParticleDestroy,
            },
        });
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
