class Time {
    // application runtime
    static totalRuntime: number = 0;
    // time passed between ends of frames rendering;
    static deltaTime: number = 0;
    // last end of frame time
    static prevFrameEndTime: number = Date.now();

    static FrameRendered(): void {
        const time = Date.now();
        const delta = time - this.prevFrameEndTime
        this.totalRuntime += delta;
        this.deltaTime = delta;
        this.prevFrameEndTime = time;
    }

    static get SineTime(): number {
        return Math.sin(this.totalRuntime);
    }
}

export default Time;
