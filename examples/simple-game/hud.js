class HUD extends GameObject {
    static kills = 0;

    constructor(params) {
        super(params);
        this.player = params.player;
        this.instantiate = params.instantiate;
        this.gameOver = false;
    }

    async Start() {
        HUD.kills = 0;

        this.hpText = await this.instantiate(UIText, {
            position: new Vector(20, 20),
            text: '',
            font: '20px monospace',
            color: new RGBAColor(255, 255, 255),
            layer: 10,
        });

        this.killText = await this.instantiate(UIText, {
            position: new Vector(20, 50),
            text: '',
            font: '20px monospace',
            color: new RGBAColor(255, 255, 255),
            layer: 10,
        });

        this.gameOverText = await this.instantiate(UIText, {
            position: new Vector(640, 350),
            text: 'GAME OVER',
            font: 'bold 60px monospace',
            color: new RGBAColor(255, 50, 50),
            textAlign: 'center',
            layer: 10,
        });

        this.restartText = await this.instantiate(UIText, {
            position: new Vector(640, 420),
            text: 'Press ESC to restart',
            font: '24px monospace',
            color: new RGBAColor(50, 50, 50),
            textAlign: 'center',
            layer: 10,
        });

        this.finalScoreText = await this.instantiate(UIText, {
            position: new Vector(640, 480),
            text: '',
            font: '28px monospace',
            color: new RGBAColor(255, 255, 255),
            textAlign: 'center',
            layer: 10,
        });

        this.gameOverText.active = false;
        this.restartText.active = false;
        this.finalScoreText.active = false;
    }

    Update() {
        if (!this.hpText) return;

        if (!this.gameOver) {
            const alive = this.player && !this.player.IsWaitingDestroy;
            const hp = alive ? this.player.hp : 0;
            this.hpText.text = 'HP: ' + '\u2665'.repeat(hp);
            this.killText.text = 'Kills: ' + HUD.kills;

            if (!alive) {
                this.gameOver = true;
                this.gameOverText.active = true;
                this.restartText.active = true;
                this.finalScoreText.active = true;
                this.finalScoreText.text = 'Kills: ' + HUD.kills;
                this.hpText.active = false;
                this.killText.active = false;
            }
        }

        super.Update();
    }
}
