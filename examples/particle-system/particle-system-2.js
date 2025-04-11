class ParticleSystemTest2 extends GameObject {
    constructor(cam, params) {
        super(params);
        this.cam = cam;
    }

    Start() {
        const imageArray = [];
        imageArray.push(new ImageWrapper('./assets/triangle_red.png'));
        imageArray.push(new ImageWrapper('./assets/poly_orange.png'));
        imageArray.push(new ImageWrapper('./assets/sun_yellow.png'));

        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                layer: 5,
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => imageArray[Math.round(Maths.RandomRange(0, imageArray.length - 1))],
                lifeTime: () => Maths.RandomRange(10, 15) * 1000,
                maxParticles: 10000,
                emitOverTime: 50,
                emitEachTimeFrame: 50,
                initialColor: new RGBAColor(120, 140, 240),
                gravityForceScale: 0.1,
                rotationOverLifeTime: factor => Maths.Lerp(0, 10, factor),
                initialVelocity: () => new Vector(Maths.RandomRange(100, 350), Maths.RandomRange(50, -200)),
                initialSize: () => Maths.RandomRange(30, 70),
                scaleOverLifeTime: factor => ({ x: Maths.Clamp(1 - factor, 0.5, 1), y: Maths.Clamp(1 - factor, 0.5, 1) }),
                initialPosition: () => new Vector(Maths.RandomRange(-50, 50), Maths.RandomRange(-400, 400)),
            },
        });
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
