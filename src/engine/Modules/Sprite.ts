import Module from './Module';
import {ITransform} from '../../types/GameObject';
import SpriteRendererManager from '../Managers/SpriteRendererManager';

class Sprite extends Module {
	private width: number;
	private height: number;
	public contentType: 0 | 1;
	private imageId: string;
	public parent: ITransform;
	public layer: number;

	constructor(params: { ImageId: string, width?: number, height?: number, layer?: number}) {
		super({name: 'Sprite'});
		const { width = 100, height = 100, layer = 0, ImageId } = params;
		this.layer = layer;
		this.imageId = ImageId;
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
		return this.imageId;
	}

	override Update(): void {
		SpriteRendererManager.GetInstance()?.AddToRenderQueue(this);
	}
}

export default Sprite;
