class Time {
	// application runtime
	static totalRuntime = 0;
	// time passed between ends of frames rendering;
	static deltaTime = 0;
	// last end of frame time
	static prevFrameEndTime: number = performance.now();

	static timeScale = 1;

	static FrameRendered(): void {
		const time = performance.now();
		const delta = time - this.prevFrameEndTime;
		this.totalRuntime += delta;
		this.deltaTime = delta * Time.timeScale;
		this.prevFrameEndTime = time;
	}

	static get SineTime(): number {
		return Math.sin(this.totalRuntime);
	}

	static get DeltaTimeSeconds(): number {
		return this.deltaTime / 1000;
	}
}

export default Time;
