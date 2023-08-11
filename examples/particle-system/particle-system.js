
const { GameObject, GraphicPrimitives: { GraphicPrimitive, PrimitiveType, ShapeDrawMethod }, Shapes: { Circle, Rect }, ImageWrapper, Classes: {RGBAColor, Vector, Maths}, ParticleSystem } = window.Abram;

const orange = RGBAColor.FromHex('#FFCD76');
const yellow = RGBAColor.FromHex('#FFF96E');
const red = RGBAColor.FromHex('FF4F4D');
const purple = RGBAColor.FromHex('#8940FF');
const lime = RGBAColor.FromHex('#93FF70');
const white = new RGBAColor(240, 240, 240);

const colors = [orange, yellow, red, purple, lime, white];

class ParticleSystemTest extends GameObject {
    constructor(cam, params) {
        super(params);
        this.cam = cam;
    }

    Start() {
        this.particleSystem = new ParticleSystem({
            parent: this,
            params: {
                occlusionCulling: false,
                particleBuffering: true,
                layer: 3,
                graphic: () => {
                    const random = Math.random();
                    return new GraphicPrimitive({
                        type: random < 0.5 ? PrimitiveType.Circle : PrimitiveType.Rect,
                        shape: random < 0.5 ? new Circle(20, new Point()) : new Rect(new Point, new Point(20, 20)),
                        parent: this.Transform,
                        drawMethod: ShapeDrawMethod.Fill,
                    })
                },
                lifeTime: () => Maths.RandomRange(3.5, 6.5) * 1000,
                maxParticles: 5000,
                emitOverTime: 40,
                emitEachTimeFrame: 30,
                initialColor: () => {
                    const random = Maths.RandomRange(0, colors.length - 1, true)
                    return colors[random];
                },
                colorOverLifeTime: (initial, factor) => {
                    const color = initial.Copy();
                    color.Alpha = 60;
                    return initial.LerpTo(color, factor)
                },
                gravityForceScale: 0.2,
                rotationOverLifeTime: factor => Maths.Lerp(-10, 0, factor),
                initialVelocity: () => Vector.Zero,
                initialSize: () => Maths.RandomRange(20, 80),
                scaleOverLifeTime: factor => ({ x:  Math.sin(factor * Math.PI), y:  Math.cos((factor) * Math.PI) }),
                initialPosition: () => new Vector(Maths.RandomRange(-650, 650), Maths.RandomRange(-10, 50))
            },
        });
    }

    Update() {
        super.Update();
        this.particleSystem.Update();
    }
}
