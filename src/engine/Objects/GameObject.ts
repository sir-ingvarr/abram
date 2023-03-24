import {IExecutable, IGameObject} from '../../types/GameObject';
import {Nullable} from '../../types/common';
import CanvasContext2D from '../Canvas/Context2d';
import {ExecutableManager} from '../Managers/ExecutableManager';
import {GameObjectManager} from '../Managers/GameObjectManager';
import BasicObject, {BasicObjectsConstructorParams} from './BasicObject';

class GameObject<T extends BasicObjectsConstructorParams = BasicObjectsConstructorParams> extends BasicObject implements IGameObject {
	private modulesManager: ExecutableManager;
	private childManager: GameObjectManager;
	protected constructor(params: T) {
		super(params);
		this.childManager = new GameObjectManager({ modules: [], parent: this, context: this.context });
		this.modulesManager = new ExecutableManager({ modules: [], parent: this, context: this.context });
		this.needDestroy = false;
	}



	RegisterModule(module: IExecutable) {
		this.modulesManager.RegisterModule(module);
		module.SetGameObject(this);
	}

	get Context() {
		return this.context as CanvasContext2D;
	}

	set Context(ctx: CanvasContext2D) {
		this.context = ctx;
	}

	GetModuleByName(name: string): Nullable<IExecutable> {
		return this.modulesManager.GetModuleByName(name);
	}

	AppendChild(child: IGameObject): string {
		return this.childManager.RegisterModule(child);
	}

	GetChildById(id: string): Nullable<IExecutable> {
		return this.childManager.GetModuleById(id) || null;
	}

	RemoveChildById(id: string) {
		return this.childManager.UnregisterModuleById(id);
	}

	Update() {
		this.modulesManager.Update();
		this.childManager.Update();
	}

	Destroy() {
		this.needDestroy = true;
		this.modulesManager.Destroy();
		this.childManager.Destroy();
	}
}

export default GameObject;