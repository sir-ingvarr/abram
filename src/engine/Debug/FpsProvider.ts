import GameObject from '../Objects/GameObject';
import {Nullable} from '../../types/common';

export class FpsProvider extends GameObject {
	private targetFps: number;
	private frameDelay: number;
	private realFps = 0;
	private threshold: number;
	private realFpsFramesBuffer = 10;
	private framesSinceRealFps = 0;
	private startCountTime = 0;
	private OnFrameDelaySet: Nullable<(newFactor: number) => void>;

	get FPS() {
		return this.realFps;
	}

	constructor(params: {name: string, threshold?: number, realFpsFramesBuffer: number, targetFps: number, onFrameDelaySet: Nullable<(newFactor: number) => void>, frameDelay: number}) {
		super({name: 'FpsProvider'});
		const { realFpsFramesBuffer, threshold = 10, targetFps = 0, onFrameDelaySet = () => null, frameDelay = 0 } = params;
		this.realFpsFramesBuffer = realFpsFramesBuffer || targetFps;
		this.startCountTime = Date.now();
		this.targetFps = targetFps;
		this.threshold = threshold;
		if(targetFps) this.frameDelay = frameDelay >= 0 ? frameDelay : 1000 / targetFps;
		this.OnFrameDelaySet = onFrameDelaySet;
	}

	Update() {
		super.Update();
		if(this.framesSinceRealFps < this.realFpsFramesBuffer) {
			this.framesSinceRealFps++;
			return;
		}
		const currentTime = Date.now();
		const deltaTime = currentTime - this.startCountTime;
		const trueFrameTime = deltaTime / this.realFpsFramesBuffer;
		this.realFps = 1000 / trueFrameTime;
		this.startCountTime = currentTime;
		this.framesSinceRealFps = 0;

		//ADAPTIVE FRAME DELAY ATTEMPT

		if(!this.OnFrameDelaySet || !this.frameDelay) return;
		const delta = this.targetFps - this.realFps;
		if(Math.abs(delta) < 2) return;
		let factor = -1;
		if(this.realFps > this.targetFps) factor = 1;
		this.frameDelay += this.frameDelay * (1 - Math.min(this.realFps, this.targetFps) / Math.max(this.targetFps, this.realFps)) * factor;
		this.OnFrameDelaySet(this.frameDelay);
	}
}