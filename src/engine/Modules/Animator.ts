import Module from './Module';
import Sprite from './Sprite';
import {Iterator} from '../Classes';
import Time from '../Globals/Time';

interface AnimatorOptions {
    frameDelay: number;
    stateMap: Map<string, Array<string>>;
    state: string;
    graphicElement: Sprite;
    playing?: boolean;
}

class Animator extends Module {
	public frameDelay: number;
	private state: string;
	private playing: boolean;
	private stateMap: Map<string, Iterator<HTMLImageElement>>;
	private availableStates: Array<string>;
	// private controlledGraphic: Sprite;
	private elapsedTime: number;
	private currentStateData?: Iterator<HTMLImageElement>;

	constructor(options: AnimatorOptions) {
		super({name: 'Animator'});
		const {
			frameDelay = 50, stateMap = new Map([['idle', []]]),
			state = 'idle', graphicElement, playing = true
		} = options;
		if(!graphicElement) throw 'animator requires a graphic element';
		this.frameDelay = frameDelay;
		this.elapsedTime = 0;
		this.state = state;
		this.playing = playing;
		this.availableStates = Array.from(stateMap.keys());
		// this.controlledGraphic = graphicElement;
		this.SetStateMap(stateMap);
		this.currentStateData = this.stateMap.get(state);
	}

	Stop() {
		this.playing = false;
	}

	Play() {
		this.playing = true;
	}

	SetState(newState: string) {
		if(newState === this.state) return;
		if(!this.availableStates.includes(newState)) throw 'invalid state';
		this.state = newState;
		this.currentStateData = this.stateMap.get(newState);
		this.UpdateFrame();
	}

	UpdateFrame() {
		if(!this.currentStateData) return;
		// this.controlledGraphic.image.Data = this.currentStateData.Next.value;
	}

	SetStateMap(stateMap: Map<string, Array<string>>) {
		const { availableStates } = this;
		const stateWithImages = new Map();
		for(const state of availableStates) {
			const images = this.LoadStateImages(stateMap.get(state) || []);
			stateWithImages.set(state, new Iterator({ data: images, infinite: true }));
		}
		this.stateMap = stateWithImages;
	}

	LoadStateImages(urlArr: Array<string>) {
		return urlArr.map(url => {
			const img = new Image();
			img.src = url;
			return img;
		});
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
