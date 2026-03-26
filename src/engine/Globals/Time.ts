class Time {
	// application runtime
	static totalRuntime = 0;
	// time passed between ends of frames rendering (scaled by timeScale)
	static deltaTime = 0;
	// unscaled real time between frames (ms)
	static unscaledDeltaTime = 0;
	// last end of frame time
	static prevFrameEndTime: number = performance.now();

	static timeScale = 1;

	// fixed timestep for physics (ms)
	static fixedDeltaTime = 20;

	static FrameRendered(): void {
		const time = performance.now();
		const delta = time - this.prevFrameEndTime;
		this.totalRuntime += delta;
		this.unscaledDeltaTime = delta;
		this.deltaTime = delta * Time.timeScale;
		this.prevFrameEndTime = time;
	}

	static get SineTime(): number {
		return Math.sin(this.totalRuntime);
	}

	static get DeltaTimeSeconds(): number {
		return this.deltaTime / 1000;
	}

	static get FixedDeltaTimeSeconds(): number {
		return (this.fixedDeltaTime * this.timeScale) / 1000;
	}
}

export default Time;
