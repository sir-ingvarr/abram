class GameManager extends GameObject {
    constructor(params) {
        super(params);
        this.instantiate = params.instantiate;
        this.canvasWidth = params.canvasWidth;
        this.canvasHeight = params.canvasHeight;
        this.hp = 3;
        this.gameOver = false;
        this.spawnTimer = 0;
        this.spawnInterval = 1500;
        this.score = 0;

        this.hpSquares = [];
        this.scoreText = null;
        this.gameOverOverlay = null;
        this.gameOverTitle = null;
        this.gameOverScore = null;
        this.gameOverHint = null;
    }

    async Start() {
        CollisionsManager.SetLayerCollision(1, 3, false);
        CollisionsManager.SetLayerCollision(0, 1, false);
        CollisionsManager.SetLayerCollision(0, 2, false);
        CollisionsManager.SetLayerCollision(2, 2, false);
        CollisionsManager.SetLayerCollision(1, 1, false);

        // HP squares
        for (let i = 0; i < 3; i++) {
            this.hpSquares.push(await this.instantiate(UIRect, {
                position: new Vector(20 + i * 35, 20),
                width: 25, height: 25,
                color: new RGBAColor(50, 200, 50),
                layer: 0,
            }));
        }

        // Score
        this.scoreText = await this.instantiate(UIText, {
            position: new Vector(this.canvasWidth / 2, 38),
            text: 'Score: 0',
            font: '20px monospace',
            color: new RGBAColor(255, 255, 255),
            textAlign: 'center',
            textBaseline: 'middle',
            layer: 0,
        });

        // Game over elements (hidden initially)
        const cx = this.canvasWidth / 2;
        const cy = this.canvasHeight / 2;

        this.gameOverOverlay = await this.instantiate(UIRect, {
            position: Vector.Zero,
            width: this.canvasWidth, height: this.canvasHeight,
            color: new RGBAColor(0, 0, 0, 150),
            active: false,
            layer: 1,
        });

        this.gameOverTitle = await this.instantiate(UIText, {
            position: new Vector(cx, cy - 30),
            text: 'GAME OVER',
            font: '32px monospace',
            color: new RGBAColor(255, 50, 50),
            textAlign: 'center', textBaseline: 'middle',
            active: false,
            layer: 2,
        });

        this.gameOverScore = await this.instantiate(UIText, {
            position: new Vector(cx, cy + 10),
            text: '',
            font: '20px monospace',
            color: new RGBAColor(255, 255, 255),
            textAlign: 'center', textBaseline: 'middle',
            active: false,
            layer: 2,
        });

        this.gameOverHint = await this.instantiate(UIText, {
            position: new Vector(cx, cy + 45),
            text: 'Press ENTER to restart',
            font: '16px monospace',
            color: new RGBAColor(255, 255, 255),
            textAlign: 'center', textBaseline: 'middle',
            active: false,
            layer: 2,
        });
    }

    spawnEnemy() {
        const x = Maths.RandomRange(50, this.canvasWidth - 50);
        const radius = Maths.RandomRange(12, 25, true);
        this.instantiate(Enemy, {
            position: new Vector(x, -30),
            collisionLayer: 2,
            radius,
            onReachGround: () => this.loseHp(),
        });
    }

    addScore() {
        if (this.gameOver) return;
        this.score++;
    }

    loseHp() {
        if (this.gameOver) return;
        this.hp--;
        if (this.hp <= 0) {
            this.hp = 0;
            this.gameOver = true;
            this.showGameOver();
        }
    }

    showGameOver() {
        this.gameOverOverlay.active = true;
        this.gameOverTitle.active = true;
        this.gameOverScore.text = `Your score: ${this.score}`;
        this.gameOverScore.active = true;
        this.gameOverHint.active = true;
    }

    restart() {
        Engine.Instance.LoadScene('gameplay');
    }

    Update() {
        if (InputSystem.KeyPressed('Escape')) return this.restart();

        if (this.gameOver) {
            if (InputSystem.KeyPressed('Enter')) this.restart();
            super.Update();
            return;
        }

        this.spawnTimer += Time.deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer -= this.spawnInterval;
            this.spawnEnemy();
        }

        // Update HP display
        for (let i = 0; i < 3; i++) {
            if (this.hpSquares[i]) {
                this.hpSquares[i].color = i < this.hp
                    ? new RGBAColor(50, 200, 50)
                    : new RGBAColor(80, 80, 80);
            }
        }

        // Update score display
        if (this.scoreText) this.scoreText.text = `Score: ${this.score}`;

        super.Update();
    }
}
