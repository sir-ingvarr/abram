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
                layer: 3,
                occlusionCulling: true,
                particleBuffering: true,
                graphic: new ImageWrapper('./assets/triangle_red.png'),
                lifeTime: () => Maths.RandomRange(1, 2)*1000,
                maxParticles: 10,
                emitOverTime: () => 1,
                particleFollowers: [this.childParticleSystemGO],
                emitEachTimeFrame: 3000,
                gravityForceScale: 0.2,
                initialVelocity: () => new Vector(Maths.RandomRange(0, 0), Maths.RandomRange(-250, -300)),
                initialSize: () => Maths.RandomRange(20, 20),
                initialPosition: () => new Vector(Maths.RandomRange(0, 0), 150),
                onParticleDestroy: this.onParticleDestroy,
            },
        });
        // this.particleSystem.Pause();
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
