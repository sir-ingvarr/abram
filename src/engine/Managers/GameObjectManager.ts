import {ExecutableManager} from './ExecutableManager';
import GameObject from '../Objects/GameObject';
import {IGameObject} from '../../types/GameObject';
import CanvasContext2D from '../Canvas/Context2d';

export class GameObjectManager extends ExecutableManager {
	constructor(params: { modules: Array<GameObject>, parent?: IGameObject, context?: CanvasContext2D }) {
		super(params);
	}

	protected override PostModuleRegister(module: GameObject) {
		super.PostModuleRegister(module);
		if(this.parent) {
			module.Context = this.parent.Context;
			module.transform.Parent = this.parent.transform;
		}
	}

	protected override PreUpdate(module: GameObject): boolean {
		if(!super.PreUpdate(module)) return false;
		if(module.IsWaitingDestroy) {
			this.UnregisterModuleById(module.Id);
			return false;
		}
		return true;
	}
}