const { SpriteRendererManager } = window.Abram;
class ParticleSystemTest2 extends GameObject {
    constructor(cam, params) {
        super(params);
        this.cam = cam;
    }

    Start() {
        const imageArray = [];
        imageArray.push('./assets/triangle_red.png');
        imageArray.push('./assets/poly_orange.png');
        imageArray.push('./assets/sun_yellow.png');

        SpriteRendererManager.GetInstance().LoadImage('./assets/triangle_red.png');
        SpriteRendererManager.GetInstance().LoadImage('./assets/poly_orange.png');
        SpriteRendererManager.GetInstance().LoadImage('./assets/sun_yellow.png');


        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                occlusionCulling: false,
                particleBuffering: true,
                graphic: () => imageArray[Math.round(Maths.RandomRange(0, imageArray.length - 1))],
                lifeTime: () => Maths.RandomRange(10, 20)*1000,
                maxParticles: 5000,
                emitOverTime: 10,
                layer: 1,
                emitEachTimeFrame: 200,
                initialColor: new RGBAColor(120, 140, 240),
                gravityForceScale: 0.1,
                rotationOverLifeTime: factor => Maths.Lerp(0, 10, factor),
                initialVelocity: () => new Vector(Maths.RandomRange(100, 350), Maths.RandomRange(50, -200)),
                initialSize: () => Maths.RandomRange(30, 70),
                scaleOverLifeTime: factor => ({ x: Maths.Clamp(1 - factor, 0.1, 1), y: 1 }),
                initialPosition: () => new Vector(Maths.RandomRange(-50, 50), Maths.RandomRange(-400, 400))
            },
        });
        // this.particleSystem.Pause();
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
