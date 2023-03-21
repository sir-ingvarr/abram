document.addEventListener('DOMContentLoaded', function() {
    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const root = document.getElementById('root');
    const bgColor = new RGBAColor(150,0,0, 150);
    const engine = new Engine(root, { width: 1280, height: 800, bgColor, debug: true, adaptiveFrameDelay: false });

    engine.SetBackgroundColor(bgColor);

    const camera = new CameraMovement({ position: new Vector(0, 0)}, engine.Canvas.Context2D);
    engine.AppendGameObject(camera);

    const gameObject = new Man({
        position: new Vector(10, 20), name: 'Man', layer: 1
    }, camera);
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ManTwo({
        position: new Vector(30, 30), name: 'Man2', layer: 3
    });
    engine.AppendGameObject(gameObject2);

    engine.Start();
});

