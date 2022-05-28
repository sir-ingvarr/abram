document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const RESOLUTION = 10;

    const engine = new Engine(800, 600, RESOLUTION, root, true);

    const bgColor = new RGBAColor(150,0,0, 150);
    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({}, engine.Context);
    engine.AppendGameObject(camera);

    const gameObject = new Man({
        position: new Vector(10, 20), name: 'Man'
    }, camera);
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ManTwo({
        position: new Vector(30, 30), name: 'Man2'
    });
    engine.AppendGameObject(gameObject2);

    engine.Start();
});

