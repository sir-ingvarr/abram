class ParticleCounter extends GameObject {
    observedSystems;
    width;
    height;
    context;

    constructor(params, particleSystems = []) {
        super(params);
        this.observedSystems = particleSystems;
        this.context = params.context;
    }

    Start() {
        this.width = this.Context.ContextRespectiveBoundingBox.Width;
        this.height = this.Context.ContextRespectiveBoundingBox.Height;
    }

    Update() {
        super.Update();
        const from = this.Context.ContextRespectiveBoundingBox.From;
        let count = 0;
        this.observedSystems.forEach(val => {
            count += val.particleSystem.TotalParticles;
        });

        this.Context.Save()
            .FillStyle(new RGBAColor(0, 0, 0, 80).ToHex())
            .FillRect(this.width / 2 - 100, this.height / 2 - 50, 200, 100)
            .FillStyle(new RGBAColor(255, 255, 255, 255).ToHex())
            .Font("bold 20px arial")
            .FillText(`Total: ${count}`, this.width / 2 - 60, this.height / 2, 250)
            .Restore();
    }
}
