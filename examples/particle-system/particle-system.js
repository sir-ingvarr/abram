const { GameObject, ImageWrapper, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

class ParticleSystemTest extends GameObject {
    constructor(cam, params) {
        super(params);
        this.cam = cam;
    }

    Start() {
        const imageArray = [];
        imageArray.push(new ImageWrapper('./assets/circle_purple.png'));
        imageArray.push(new ImageWrapper('./assets/heart_green.png'));
        imageArray.push(new ImageWrapper('./assets/sun_yellow.png'));
        imageArray.push(new ImageWrapper('./assets/triangle_red.png'));
        imageArray.push(new ImageWrapper('./assets/poly_orange.png'));


        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                sprite: () => imageArray[Math.floor(Maths.RandomRange(0, imageArray.length - 1))],
                lifeTime: () => Maths.RandomRange(1, 3)*1000,
                maxParticles: 5000,
                emitOverTime: 5,
                emitEachTimeFrame: 0,
                initialColor: new RGBAColor(120, 140, 240),
                gravityForceScale: 1.2,
                initialVelocity: () => new Vector(Maths.RandomRange(-200, 200), Maths.RandomRange(-300, 100)),
                initialSize: () => Maths.RandomRange(10, 60),
                sizeOverLifeTime: factor => Maths.Clamp(1 - factor, 0.3, 1),
            },
        })
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
