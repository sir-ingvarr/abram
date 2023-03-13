const { GameObject, ImageWrapper, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

class ParticleSystemTest extends GameObject {
    constructor(cam, params) {
        super(params);
        this.cam = cam;
    }

    Start() {
        const gunGraphic = new ImageWrapper('./assets/spark.png');

        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                sprite: gunGraphic,
                lifeTime: 1000,
                maxParticles: 2000,
                emitOverTime: 1,
                emitEachTimeFrame: 0,
                initialColor: new RGBAColor(120, 140, 240),
                gravityForceScale: 1,
                initialVelocity: () => new Vector(Maths.RandomRange(-300, 300), Maths.RandomRange(-300, 300)),
                initialSize: () => Maths.RandomRange(20, 100),
                sizeOverLifeTime: factor => Maths.Clamp(1 - factor, 0.2, 1),
            },
        })
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
        // if(this.cam) this.cam.SetPosition(this.transform.WorldPosition);
    }
}
