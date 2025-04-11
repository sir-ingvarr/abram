document.addEventListener('DOMContentLoaded', async function() {
    const root = document.getElementById('root');

    const { Engine, Classes: { RGBAColor, Vector } } = window.Abram;

    const engine = new Engine(root, { width: 1280, height: 800, debug: true, drawFps: true, canvasContextAttributes: { alpha: false }, adaptiveFrameDelay: false, pauseOnBlur: true });

    await engine.RegisterGameScript('./camera-movement.js');
    await engine.RegisterGameScript('./particle-system.js');

    engine.Start();

    await engine.Instantiate(CameraMovement, {});
    await engine.Instantiate(ParticleSystemTest, { position: new Vector(0, 0)});
});

