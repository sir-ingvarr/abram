import {IExecutable, IGameObject} from '../../types/GameObject';
import {Nullable} from '../../types/common';
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
	}

	override Update() {
		super.Update();
		this.modulesManager.Update();
		this.childManager.Update();
	}

	override Destroy() {
		super.Destroy();
		this.modulesManager.Destroy();
		this.childManager.Destroy();
	}

	RegisterModule(module: IExecutable) {
		this.modulesManager.RegisterModule(module);
		module.SetGameObject(this);
		module.parent = this.transform;
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
}

export default GameObject;