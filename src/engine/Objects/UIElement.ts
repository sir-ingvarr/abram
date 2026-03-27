import BasicObject, {BasicObjectsConstructorParams} from './BasicObject';
import {IUIRenderable} from '../Managers/SpriteRenderer';
import SpriteRendererManager from '../Managers/SpriteRendererManager';

export type UIElementParams = BasicObjectsConstructorParams & {
	layer?: number;
}

abstract class UIElement extends BasicObject {
	protected uiLayer: number;

	protected constructor(params: UIElementParams) {
		super(params);
		this.uiLayer = params.layer ?? 0;
	}

	protected abstract createRenderable(): IUIRenderable;

	override Update() {
		SpriteRendererManager.GetInstance()?.AddToUIRenderQueue(this.createRenderable());
	}
}

export default UIElement;
