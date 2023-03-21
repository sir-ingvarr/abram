const { GameObject, ImageWrapper, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

class ParticleSystemTest extends GameObject {
    frames = 0;
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


        function OnCollide(self, other) {
            const vector1 = self.shape.BoundingBox.Center.ToVector().Subtract(other.shape.BoundingBox.Center).Clamp([0.1, 100], [0.1, 100]);
            const vector2 = vector1.Copy().Mirror(true, true);

            self.parent.gameObject.velocity = vector1.MultiplyCoordinates(1);
            other.parent.gameObject.velocity = vector2.MultiplyCoordinates(1);

            // console.log('other', other.parent.gameObject.velocity.x, other.parent.gameObject.velocity.y);
        }

        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                sprite: () => imageArray[Math.floor(Maths.RandomRange(0, imageArray.length - 1))],
                lifeTime: 40000,//() => Maths.RandomRange(5, 10)*1000,
                maxParticles: 3,
                emitOverTime: 1.5,
                emitEachTimeFrame: 0,
                initialColor: new RGBAColor(120, 140, 240),
                gravityForceScale: 0,
                initialVelocity: Vector.zero, //() => new Vector(Maths.RandomRange(-50, 50), Maths.RandomRange(-50, 50)),
                initialSize: () => Maths.RandomRange(15, 40),
                // sizeOverLifeTime: factor => Maths.Clamp(1 - factor, 0.3, 1),
                onParticleCollision: OnCollide,
            },
        })
    }

    Update() {
        super.Update();
        this.frames++;
        if(this.frames > 120) {
            console.log(this.particleSystem.TotalParticles);
            this.frames = 0;
        }
        this.particleSystem.Update();
    }
}
