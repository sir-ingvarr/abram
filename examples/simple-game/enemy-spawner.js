class EnemySpawner extends GameObject {
    constructor(params) {
        super(params);
        this.player = params.player;
        this.instantiate = params.instantiate;
        this.spawnInterval = 100;
        this.timer = 0;
        this.maxEnemies = 10;
        this.alive = [];
    }

    Update() {
        if (!this.player || this.player.IsWaitingDestroy) return;

        this.alive = this.alive.filter(e => !e.IsWaitingDestroy);

        this.timer += Time.deltaTime;
        if (this.timer < this.spawnInterval) return;
        this.timer -= this.spawnInterval;

        if (this.alive.length >= this.maxEnemies) return;

        const playerPos = this.player.transform.WorldPosition;
        const side = Math.random() < 0.5 ? -1 : 1;
        const spawnX = playerPos.x + side * Maths.RandomRange(700, 900);
        const spawnY = playerPos.y - 50;

        this.instantiate(Enemy, {
            position: new Vector(spawnX, spawnY),
            name: 'Enemy',
            target: this.player,
            instantiate: this.instantiate,
        }).then(enemy => this.alive.push(enemy));

        super.Update();
    }
}
