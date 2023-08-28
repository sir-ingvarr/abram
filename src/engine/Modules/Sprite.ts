import Module from './Module';
import {ITransform} from '../../types/GameObject';
import SpriteRendererManager from '../Managers/SpriteRendererManager';
import ImageWrapper from './ImageWrapper';

class Sprite extends Module {
	private width: number;
	private height: number;
	public contentType: 0 | 1;
	public image: ImageWrapper;
	public parent: ITransform;
	public layer: number;

	constructor(params: { image: ImageWrapper, width?: number, height?: number, layer?: number}) {
		super({name: 'Sprite'});
		const { width = 100, height = 100, layer = 0, image } = params;
		this.layer = layer;
		this.image = image;
		this.contentType = 0;
		this.width = width;
		this.height = height;
	}

	get Width() {
		return this.width;
	}

	get Height() {
		return this.height;
	}

	get ImageId(): string {
		return this.image.ImageId;
	}

	override Update(): void {
		SpriteRendererManager.GetInstance()?.AddToRenderQueue(this);
	}
}

export default Sprite;