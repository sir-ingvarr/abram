import {IExecutable, IGameObject} from '../../types/GameObject';
import {Nullable} from '../../types/common';
import CanvasContext2D from '../Canvas/Context2d';

export class ExecutableManager {
	protected readonly modules: Map<string, IExecutable>;
	protected readonly parent?: IGameObject;
	protected readonly context?: CanvasContext2D;

	constructor(props: { modules?: Array<IExecutable>, parent?: IGameObject, context?: CanvasContext2D }) {
		this.modules = new Map();
		const { modules = [], parent } = props;
		this.parent = parent;
		for(const module of modules) {
			this.RegisterModule(module);
		}
	}

	protected PreUpdate(module: IExecutable): boolean {
		return module.Active;
	}
	protected PostUpdate() { return; }

	protected PreModuleRegister(module: IExecutable): boolean {
		if(this.parent) module.gameObject = this.parent;
		return true;
	}
	protected PostModuleRegister(module: IExecutable): void {
		if(module.active) module.Start();
	}

	RegisterModule(module: IExecutable): string {
		if(!this.PreModuleRegister(module)) {
			throw `Unable to register the module ${module.Id} object does not pass pre-register check`;
		}
		this.modules.set(module.Id, module);
		this.PostModuleRegister(module);
		return module.Id;
	}

	UnregisterModuleById(id: string) {
		this.modules.delete(id);
	}

	GetModuleById(id: string): IExecutable | undefined {
		return this.modules.get(id);
	}

	GetModuleByName(name: string): Nullable<IExecutable> {
		if (!name) return null;
		const modules = this.modules.values();
		for(const module of modules) {
			if (!module.name || module.name !== name) continue;
			return module;
		}
		return null;
	}

	Update() {
		for (const item of this.modules) {
			const module = item[1];
			if(!this.PreUpdate(module)) continue;
			module.Update();
			if(this.PostUpdate) this.PostUpdate();
		}
	}

	Destroy() {
		for(const [_, module] of this.modules) {
			module.Destroy();
		}
		this.modules.clear();
	}
}