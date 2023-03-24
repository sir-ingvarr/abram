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
                graphic: new ImageWrapper('./assets/triangle_red.png'),
                lifeTime: () => Maths.RandomRange(0.2, 0.5) * 1000,
                maxParticles: 10,
                emitOverTime: 1,
                emitEachTimeFrame: 100,
                emitOverDistance: 1,
                gravityForceScale: 0,
                initialVelocity: Vector.Zero,
                scaleOverLifeTime: factor => ({ x: Math.sin(factor * Math.PI), y: Math.sin(factor * Math.PI) }),
                initialSize: () => Maths.RandomRange(10, 10),
                initialPosition: Vector.Zero,
            },
        });
        // this.particleSystem.Pause();
    }

    UpdateFollowedPosition(x, y) {
        console.log(`received ${x} ${y}`);
        console.log(`world current`);
        console.log(this.transform.WorldPosition.x, this.transform.WorldPosition.y)
        console.log(`local current`);
        console.log(this.transform.LocalPosition.x, this.transform.LocalPosition.y)

        this.transform.LocalPosition = new Point(x, y);
        console.log('after');
        console.log(this.transform.LocalPosition.x, this.transform.LocalPosition.y)

    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
