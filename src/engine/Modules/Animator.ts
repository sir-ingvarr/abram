import Module from './Module';
import Sprite from './Sprite';
import {Iterator, Maths} from '../Classes';
import Time from '../Globals/Time';

interface AnimatorOptions {
	frameDelay: number;
	stateMap: { [state: string]: Array<string> };
	state: string;
	graphicElement: Sprite;
	playing?: boolean;
}

export interface IWithImageId {
	get ImageId(): string,
}

class Animator extends Module {
	public frameDelay: number;
	private state: string;
	private playing: boolean;
	private readonly stateMap: { [state: string]: Iterator<string> };
	private controlledGraphic: Sprite;
	private elapsedTime: number;
	private currentStateData?: Iterator<string>;

	constructor(options: AnimatorOptions) {
		super({name: 'Animator'});
		const {
			frameDelay = 50, stateMap = { idle: [] },
			state = 'idle', graphicElement, playing = true
		} = options;
		if(!graphicElement) throw 'animator requires a graphic element';
		this.frameDelay = frameDelay;
		this.elapsedTime = 0;
		this.state = state;
		this.playing = playing;
		this.controlledGraphic = graphicElement;
		this.stateMap = {};
		this.SetStateMap(stateMap);
		this.currentStateData = this.stateMap[state];
	}

	Stop() {
		this.playing = false;
	}

	Play() {
		this.playing = true;
	}

	private SetStateMap(data: { [state: string]: Array<string> }) {
		for(const key in data) {
			this.stateMap[key] = new Iterator<string>({infinite: true, data: data[key]});
		}
	}

	SetState(newState: string) {
		if(newState === this.state) return;
		if(!this.stateMap[newState]) throw 'invalid state';
		this.state = newState;
		this.currentStateData = this.stateMap[newState];
		this.UpdateFrame(1);
	}

	UpdateFrame(frames: number) {
		if(!this.currentStateData) return;
		for(let i = 0; i < frames; i++) {
			this.currentStateData.Next;
		}
		this.controlledGraphic.image.ImageId = this.currentStateData.Current.value;
	}


	override Update() {
		super.Update();
		if(!this.playing) return;
		this.elapsedTime += Time.deltaTime;
		if(this.elapsedTime < this.frameDelay) return;
		const framesDone = Maths.Clamp(Math.floor(this.elapsedTime % this.frameDelay), 1, 10);
		this.elapsedTime = 0;
		this.UpdateFrame(framesDone);
	}
}

export default Animator;