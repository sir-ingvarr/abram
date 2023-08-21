import Module from './Module';
import Sprite from './Sprite';
import {Iterator} from '../Classes';
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
	private stateMap: { [state: string]: Iterator<string> };
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
		this.UpdateFrame();
	}

	UpdateFrame() {
		if(!this.currentStateData) return;
		this.controlledGraphic.image.ImageId = this.currentStateData.Next.value;
	}


	override Update() {
		super.Update();
		if(!this.playing) return;
		this.elapsedTime += Time.deltaTime;
		if(this.elapsedTime < this.frameDelay) return;
		this.elapsedTime = 0;
		this.UpdateFrame();
	}
}

export default Animator;