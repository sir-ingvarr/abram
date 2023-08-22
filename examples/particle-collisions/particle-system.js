
const { GameObject, ImageWrapper, GraphicPrimitives: { GraphicPrimitive, ShapeDrawMethod, PrimitiveType }, Shapes: { Circle, Rect }, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

class ParticleSystemTest extends GameObject {
    frames = 0;
    constructor(cam, params) {
        super(params);
        this.cam = cam;
    }

    Start() {
        const imageArray = [];
        imageArray.push(new ImageWrapper('./assets/circle_purple.png'));
        imageArray.push(new ImageWrapper('./assets/sun_yellow.png'));
        imageArray.push(new ImageWrapper('./assets/triangle_red.png'));
        imageArray.push(new ImageWrapper('./assets/poly_orange.png'));


        function OnCollide(self, other) {
            const vector1 = Vector.From(self.shape.center).Subtract(other.shape.center).Normalized;
            const vector2 = Vector.From(other.shape.center).Subtract(self.shape.center).Normalized;

            self.parent.gameObject.velocity = vector1.MultiplyCoordinates(100);
            other.parent.gameObject.velocity = vector2.MultiplyCoordinates(100);

            // this.Context.Line(self.parent.WorldPosition.x, self.parent.WorldPosition.y, self.parent.gameObject.velocity.x + self.parent.WorldPosition.x, self.parent.gameObject.velocity.y + self.parent.WorldPosition.y)

            console.log('other', other.parent.gameObject.velocity.x, other.parent.gameObject.velocity.y);
        }


         this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                occlusionCulling: true,
                particleBuffering: true,
                graphic: () => new GraphicPrimitive({
                    type: PrimitiveType.Circle,
                    shape: new Circle(20, new Point()),
                    parent: this.Transform,
                    drawMethod: ShapeDrawMethod.Fill,
                }),
                lifeTime: () => Maths.RandomRange(7, 10) * 1000,
                maxParticles: 10,
                emitOverTime: 2,
                drag: 0,
                emitEachTimeFrame: 200,
                initialColor: () => new RGBAColor(Maths.RandomRange(0, 255), Maths.RandomRange(0, 255), Maths.RandomRange(0, 255), 190),
                // colorOverLifeTime: (initial, factor) => {
                //     const color = initial.Copy();
                //     color.Alpha = 0;
                //     return initial.LerpTo(color, factor)
                // },
                gravityForceScale: 0.4,
                // rotationOverLifeTime: factor => Maths.Lerp(0, -20, factor),
                initialVelocity: () => Vector.zero,
                initialSize: () => Maths.RandomRange(5, 30),
                // scaleOverLifeTime: factor => ({ x: Maths.Clamp(1 - factor, 0.1, 1), y: 1 }),
                initialPosition: () => new Vector(-10, 10, Maths.RandomRange(-10, 10)),
                onParticleCollision: OnCollide.bind(this)
            },
        });
    }

    Update() {
        super.Update();
        this.frames++;
        if(this.frames > 120) {
            this.frames = 0;
        }
        this.particleSystem.Update();
    }
}
