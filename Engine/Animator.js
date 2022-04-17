class Animator {
    constructor({
        frameDelay = 50, stateMap = { idle: [] },
        state = 'idle', graphicElement, playing = true
    }) {
        if(!graphicElement) throw 'animator requires a graphic element';
        if(!(graphicElement instanceof GraphicElement)) throw 'graphicElement should be an instance of GraphicElement class';
        this.frameDelay = frameDelay;
        this.state = state;
        this.playing = playing;
        this.availableStates = Object.keys(stateMap);
        this.currentFrame = 0;
        this.interval = null;
        this.controlledGraphic = graphicElement;
        this.SetStateMap(stateMap)
        this.currentStateData = this.stateMap[state];
        if(!this.playing) return;
        this.SetFrameInterval();
    }

    Stop() {
        this.playing = false;
        clearInterval(this.interval);
    }

    Play() {
        this.playing = true;
        this.SetFrameInterval();
    }

    SetState(newState) {
        if(newState === this.state) return;
        if(!this.availableStates.includes(newState)) throw 'invalid state';
        this.state = newState;
        this.currentStateData = this.stateMap[this.state];
        this.currentFrame = 0;
        this.UpdateFrame();
    }

    SetFrameInterval() {
        if(this.interval) clearInterval(this.interval);
        this.interval = setInterval(this.UpdateFrame.bind(this), this.frameDelay);
    }

    UpdateFrame() {
        const { max, images, count } = this.currentStateData;
        if(!count) return;
        this.currentFrame = Maths.Clamp(++this.currentFrame, 0, count);
        if(this.currentFrame > max) this.currentFrame = 0;
        this.controlledGraphic.SetImageContent(images[this.currentFrame]);
    }

    SetStateMap(stateMap) {
        const { availableStates } = this;
        const stateWithImages = {};
        for(let state of availableStates) {
            const images = this.LoadStateImages(stateMap[state]);
            stateWithImages[state] = { images, max: images.length - 1, count: images.length };
        }
        this.stateMap = stateWithImages;
    }

    LoadStateImages(urlArr) {
        return urlArr.map(url => {
            const img = new Image();
            img.src = url;
            return img;
        })
    }
}