export type PlayOptions = {
	volume?: number;
	loop?: boolean;
	playbackRate?: number;
}

export class SoundInstance {
	private readonly source: AudioBufferSourceNode;
	private readonly gain: GainNode;
	private _isPlaying: boolean;

	constructor(source: AudioBufferSourceNode, gain: GainNode) {
		this.source = source;
		this.gain = gain;
		this._isPlaying = true;
		this.source.onended = () => { this._isPlaying = false; };
	}

	get IsPlaying(): boolean {
		return this._isPlaying;
	}

	get Volume(): number {
		return this.gain.gain.value;
	}

	set Volume(value: number) {
		this.gain.gain.value = Math.max(0, value);
	}

	get Loop(): boolean {
		return this.source.loop;
	}

	set Loop(value: boolean) {
		this.source.loop = value;
	}

	get PlaybackRate(): number {
		return this.source.playbackRate.value;
	}

	set PlaybackRate(value: number) {
		this.source.playbackRate.value = value;
	}

	Stop() {
		if(!this._isPlaying) return;
		this.source.stop();
		this._isPlaying = false;
	}
}

class AudioManager {
	private static context: AudioContext | null = null;
	private static buffers: Map<string, AudioBuffer> = new Map();
	private static loadPromises: Map<string, Promise<void>> = new Map();
	private static masterGain: GainNode | null = null;

	private static ensureContext(): AudioContext {
		if(!AudioManager.context) {
			AudioManager.context = new AudioContext();
			AudioManager.masterGain = AudioManager.context.createGain();
			AudioManager.masterGain.connect(AudioManager.context.destination);
		}
		if(AudioManager.context.state === 'suspended') {
			AudioManager.context.resume();
		}
		return AudioManager.context;
	}

	static get MasterVolume(): number {
		return AudioManager.masterGain?.gain.value ?? 1;
	}

	static set MasterVolume(value: number) {
		AudioManager.ensureContext();
		AudioManager.masterGain!.gain.value = Math.max(0, value);
	}

	static Load(id: string, url: string): Promise<void> {
		if(AudioManager.buffers.has(id)) return Promise.resolve();

		const existing = AudioManager.loadPromises.get(id);
		if(existing) return existing;

		const ctx = AudioManager.ensureContext();
		const promise = fetch(url)
			.then(response => {
				if(!response.ok) throw new Error(`Failed to load audio: ${url}`);
				return response.arrayBuffer();
			})
			.then(data => ctx.decodeAudioData(data))
			.then(buffer => {
				AudioManager.buffers.set(id, buffer);
				AudioManager.loadPromises.delete(id);
			});

		AudioManager.loadPromises.set(id, promise);
		return promise;
	}

	static IsLoaded(id: string): boolean {
		return AudioManager.buffers.has(id);
	}

	static Play(id: string, opts: PlayOptions = {}): SoundInstance | null {
		const buffer = AudioManager.buffers.get(id);
		if(!buffer) {
			console.warn(`[ABRAM] Audio "${id}" not loaded`);
			return null;
		}

		const ctx = AudioManager.ensureContext();
		const { volume = 1, loop = false, playbackRate = 1 } = opts;

		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.loop = loop;
		source.playbackRate.value = playbackRate;

		const gain = ctx.createGain();
		gain.gain.value = volume;

		source.connect(gain);
		gain.connect(AudioManager.masterGain!);
		source.start();

		return new SoundInstance(source, gain);
	}

	static StopAll() {
		// AudioContext doesn't track active sources, so we create a new master gain
		// which disconnects all existing sounds
		if(!AudioManager.context || !AudioManager.masterGain) return;
		AudioManager.masterGain.disconnect();
		AudioManager.masterGain = AudioManager.context.createGain();
		AudioManager.masterGain.connect(AudioManager.context.destination);
	}
}

export default AudioManager;
