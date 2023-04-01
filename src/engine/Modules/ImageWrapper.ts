import SpriteRendererManager from '../Managers/SpriteRendererManager';

class ImageWrapper {
	private readonly imageId: string;
	public isReady: boolean;
	public image?: HTMLImageElement;

	constructor(urlOrImageId: string) {
		this.isReady = false;
		if(!urlOrImageId) return;
		this.imageId = urlOrImageId;
		const imageLoaded = SpriteRendererManager.GetInstance()?.HasImageData(urlOrImageId);
		if(imageLoaded) return;
		this.LoadImageContent();
	}

	get ImageId() {
		return this.imageId;
	}

	private async SetImageContent(image: HTMLImageElement) {
		this.isReady = true;
		// SpriteRendererManager.GetInstance()?.RegisterImageData(this.imageId, image);
		this.image = image;
	}

	private LoadImageContent() {
		const newImage = new Image();
		newImage.onload = () => {
			this.isReady = true;
			this.SetImageContent(newImage);
		};

		newImage.onerror = e => {
			console.log(e);
		};
		newImage.src = this.imageId;
	}

}

export default ImageWrapper;
