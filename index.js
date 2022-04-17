document.addEventListener('DOMContentLoaded', function() {
    const engine = new Engine({width: 500, height: 500, canvasResolution: 10, debug: true});
    const root = document.getElementById('root');

    engine.CreateCanvas(root);
    const bgColor = new RGBAColor(0,0,0, 150);
    engine.SetBackgroundColor(bgColor);

    const gameObject = new Man({
        position: new Vector(10, 20)
    });
    engine.AppendGameObject(gameObject);

    const gameObject2 = new ManTwo({
        position: new Vector(10, 50)
    });
    engine.AppendGameObject(gameObject2);

    engine.Start();
});

