import GameObject from '../Objects/GameObject';
import {Nullable} from '../../types/common';
import {BasicObjectsConstructorParams} from '../Objects/BasicObject';

export type FpsProviderConstructorOptions = BasicObjectsConstructorParams & {
	threshold?: number,
	realFpsFramesBuffer: number,
	targetFps: number,
	onFrameDelaySet: Nullable<(newFactor: number) => void>,
	frameDelay: number
}

export class FpsProvider extends GameObject<FpsProviderConstructorOptions> {
	private targetFps: number;
	private frameDelay: number;
	private realFps = 0;
	private realFpsFramesBuffer = 10;
	private framesSinceRealFps = 0;
	private startCountTime = 0;
	private OnFrameDelaySet: Nullable<(newFactor: number) => void>;

	get FPS() {
		return this.realFps;
	}

	constructor(params: FpsProviderConstructorOptions) {
		super(params);
		const { realFpsFramesBuffer, targetFps = 0, onFrameDelaySet = () => null, frameDelay = 0 } = params;
		this.realFpsFramesBuffer = realFpsFramesBuffer || targetFps;
		this.startCountTime = performance.now();
		this.targetFps = targetFps;
		if(targetFps) this.frameDelay = frameDelay >= 0 ? frameDelay : 1000 / targetFps;
		this.OnFrameDelaySet = onFrameDelaySet;
	}

	override Update() {
		super.Update();
		if(this.framesSinceRealFps < this.realFpsFramesBuffer) {
			this.framesSinceRealFps++;
			return;
		}
		const currentTime = performance.now();
		const deltaTime = currentTime - this.startCountTime;
		const trueFrameTime = deltaTime / this.realFpsFramesBuffer;
		this.realFps = 1000 / trueFrameTime;
		this.startCountTime = currentTime;
		this.framesSinceRealFps = 0;

		//ADAPTIVE FRAME DELAY ATTEMPT

		if(!this.OnFrameDelaySet || !this.frameDelay) return;
		const  factor = this.realFps > this.targetFps ? 1 : -1;
		this.frameDelay += this.frameDelay * (1 - Math.min(this.realFps, this.targetFps) / Math.max(this.targetFps, this.realFps)) * factor;
		this.OnFrameDelaySet(this.frameDelay);
	}
}