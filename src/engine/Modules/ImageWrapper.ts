import SpriteRendererManager from '../Managers/SpriteRendererManager';

class ImageWrapper {
	private readonly imageId: string;
	public isReady: boolean;
	public image?: HTMLImageElement;

	constructor(urlOrImageId: string) {
		this.isReady = false;
		if(!urlOrImageId) return;
		this.imageId = urlOrImageId;
		this.SetImageContent();
	}

	get ImageId() {
		return this.imageId;
	}

	private SetImageContent() {
		this.isReady = true;
		SpriteRendererManager.GetInstance()?.LoadImage(this.imageId);
	}
}

export default ImageWrapper;
