
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
                lifeTime: () => Maths.RandomRange(1, 2)*1000,
                maxParticles: 20,
                emitOverTime: () => Maths.RandomRange(2, 10, true),
                particleFollowers: [this.childParticleSystemGO],
                emitEachTimeFrame: 1500,
                gravityForceScale: 0.2,
                initialColor: new RGBAColor(20, 20, 20, 210),
                initialVelocity: () => new Vector(Maths.RandomRange(-200, 200), Maths.RandomRange(-290, -450)),
                initialSize: () => Maths.RandomRange(10, 10),
                initialPosition: () => new Vector(Maths.RandomRange(-540, 540), 350),
                onParticleDestroy: this.onParticleDestroy,
            },
        });
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
