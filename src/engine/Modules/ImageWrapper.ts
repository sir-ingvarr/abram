import SpriteRendererManager from '../Managers/SpriteRendererManager';
import SpriteRenderer from '../Managers/SpriteRenderer';
import {IWithImageId} from './Animator';

class ImageWrapper implements IWithImageId {
	private imageId: string;
	public isReady: boolean;

	constructor(urlOrImageId: string) {
		this.isReady = false;
		if(!urlOrImageId) return;
		this.imageId = urlOrImageId;
		this.SetImageContent();
	}

	get ImageId() {
		return this.imageId;
	}

	set ImageId(newId: string) {
		this.imageId = newId;
		this.SetImageContent();
	}

	get Image() {
		if(!this.isReady) return;
		return SpriteRenderer.GetInstance()?.GetImage(this.imageId);
	}

	private async SetImageContent() {
		await SpriteRendererManager.GetInstance()?.LoadImage(this.imageId);
		this.isReady = true;
	}
}

export default ImageWrapper;