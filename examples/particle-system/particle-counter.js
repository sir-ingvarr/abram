class ParticleCounter extends GameObject {
    observedSystems;
    width;
    height
    constructor(params, particleSystems = []) {
        super(params);
        this.observedSystems = particleSystems;
    }

    Start() {
        this.width = this.Context.boundingBox.Width;
        this.height = this.Context.boundingBox.Height;
    }

    Update() {
        super.Update();
        let count = 0;
        this.observedSystems.forEach(val => {
            count += val.particleSystem.TotalParticles;
        })
        this.Context.Save()
            .FillStyle(new RGBAColor(0, 0, 0, 80).ToHex())
            .FillRect(this.width / 2 - 100, this.height / 2 - 50, 200, 100)
            .FillStyle(new RGBAColor(255, 255, 255, 255).ToHex())
            .Font("bold 20px arial")
            .FillText(`Total: ${count}`, this.width / 2 - 70, this.height / 2 + 5, 250)
            .Restore();
    }
}
