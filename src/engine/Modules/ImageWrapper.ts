class ImageWrapper {
	private image: HTMLImageElement;
	public isReady: boolean;

	constructor(url: string) {
		this.isReady = false;
		this.SetImageContent(url);
	}

	SetImageContent(image: HTMLImageElement | string) {
		if(image instanceof Image) {
			this.image = image;
			this.isReady = true;
			return;
		}
		if(typeof image !== 'string') throw 'unacceptable image content provided';
		const newImage = new Image();
		newImage.onload = () => {
			this.image = newImage;
			this.isReady = true;
		};

		newImage.onerror = e => {
			console.log(e);
		};
		newImage.src = image;
	}

	get Data() {
		return this.image;
	}
}

export default ImageWrapper;
