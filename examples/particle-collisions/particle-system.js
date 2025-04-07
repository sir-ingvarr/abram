
const { ImageWrapper, GraphicPrimitives: { GraphicPrimitive, ShapeDrawMethod, PrimitiveType }, Shapes: { Circle, Rect }, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

function OnCollide(self, other) {
    const vector1 = Vector.From(self.shape.center).Subtract(other.shape.center).Normalized;
    const vector2 = Vector.From(other.shape.center).Subtract(self.shape.center).Normalized;

    self.parent.gameObject.velocity = vector1.MultiplyCoordinates(100);
    other.parent.gameObject.velocity = vector2.MultiplyCoordinates(100);

    // this.Context.Line(self.parent.WorldPosition.x, self.parent.WorldPosition.y, self.parent.gameObject.velocity.x + self.parent.WorldPosition.x, self.parent.gameObject.velocity.y + self.parent.WorldPosition.y)

    console.log('other', other.parent.gameObject.velocity.x, other.parent.gameObject.velocity.y);
}

class ParticleSystemTest extends GameObject {
    constructor(params) {
        super(params);
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
                maxParticles: 5000,
                emitOverTime: 10,
                emitEachTimeFrame: 20,
                initialColor: new RGBAColor(120, 140, 240),
                gravityForceScale: 0.05,
                rotationOverLifeTime: factor => Maths.Lerp(0, 10, factor),
                initialVelocity: () => new Vector(Maths.RandomRange(100, 350), Maths.RandomRange(50, -200)),
                initialSize: () => Maths.RandomRange(30, 70),
                scaleOverLifeTime: factor => ({ x: Maths.Clamp(1 - factor, 0.5, 1), y: Maths.Clamp(1 - factor, 0.5, 1) }),
                initialPosition: () => new Vector(Maths.RandomRange(-50, 50), Maths.RandomRange(-400, 400)),
                onParticleCollision: OnCollide.bind(this),
            },
        });
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
