import GameObject from '../Objects/GameObject';
import {BasicObjectsConstructorParams} from '../Objects/BasicObject';

export type FpsProviderConstructorOptions = BasicObjectsConstructorParams & {
	sampleSize?: number,
}

export class FpsProvider extends GameObject<FpsProviderConstructorOptions> {
	private realFps = 0;
	private sampleSize: number;
	private framesSinceSample = 0;
	private sampleStartTime = 0;

	get FPS() {
		return this.realFps;
	}

	constructor(params: FpsProviderConstructorOptions) {
		super(params);
		this.sampleSize = params.sampleSize || 60;
		this.sampleStartTime = performance.now();
	}

	override Update() {
		super.Update();
		this.framesSinceSample++;
		if(this.framesSinceSample < this.sampleSize) return;
		const currentTime = performance.now();
		const avgFrameTime = (currentTime - this.sampleStartTime) / this.sampleSize;
		this.realFps = 1000 / avgFrameTime;
		this.sampleStartTime = currentTime;
		this.framesSinceSample = 0;
	}
}
