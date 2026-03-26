import {IExecutable, IGameObject} from '../../types/GameObject';
import {Nullable} from '../../types/common';
import CanvasContext2D from '../Canvas/Context2d';
import Module from '../Modules/Module';

export class ExecutableManager {
	protected readonly modules: Map<string, IExecutable>;
	protected readonly parent?: IGameObject;
	private pendingModules: Module[] = [];

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
	protected PostUpdate() { /* override in subclass */ }

	protected PreModuleRegister(module: IExecutable): boolean {
		if(this.parent) module.gameObject = this.parent;
		return true;
	}
	protected PostModuleRegister(module: IExecutable): void {
		if(module.active) module.Start();
	}

	RegisterModule(module: IExecutable): string {
		if(this.parent && module instanceof Module) {
			const moduleClass = module.constructor as typeof Module;

			if(!moduleClass.canBeDuplicated && this.HasModuleOfType(module.constructor as new (...args: any[]) => Module)) {
				console.warn(`Module ${module.name} cannot be duplicated, skipping.`);
				return module.Id;
			}

			const missingDeps = this.getMissingDependencies(moduleClass);
			if(missingDeps.length > 0) {
				module.PendingDependencies = true;
				module.active = false;
				this.pendingModules.push(module);
				console.warn(`Module ${module.name} is waiting for dependencies: ${missingDeps.map(d => d.name).join(', ')}`);
			}
		}

		if(!this.PreModuleRegister(module)) {
			throw new Error(`Unable to register the module ${module.Id} object does not pass pre-register check`);
		}
		this.modules.set(module.Id, module);
		this.PostModuleRegister(module);

		this.activatePendingModules();

		return module.Id;
	}

	private getMissingDependencies(moduleClass: typeof Module): Function[] {
		const dependencies = moduleClass.dependencies || [];
		const missing: Function[] = [];
		for(const dep of dependencies) {
			if(!this.HasModuleOfType(dep as new (...args: any[]) => IExecutable)) {
				missing.push(dep);
			}
		}
		return missing;
	}

	private activatePendingModules() {
		const stillPending: Module[] = [];
		for(const module of this.pendingModules) {
			const moduleClass = module.constructor as typeof Module;
			const missingDeps = this.getMissingDependencies(moduleClass);
			if(missingDeps.length === 0) {
				module.PendingDependencies = false;
				module.active = true;
				module.Start();
			} else {
				stillPending.push(module);
			}
		}
		this.pendingModules = stillPending;
	}

	UnregisterModuleById(id: string) {
		this.modules.delete(id);
	}

	GetModuleById(id: string): IExecutable | undefined {
		return this.modules.get(id);
	}

	GetModuleByName(name: string): Nullable<IExecutable> {
		if (!name) return null;
		for(const module of this.modules.values()) {
			if (module.name === name) return module;
		}
		return null;
	}

	GetModule<T extends IExecutable>(classRef: new (...args: any[]) => T): Nullable<T> {
		for(const module of this.modules.values()) {
			if(module instanceof classRef) return module;
		}
		return null;
	}

	GetModules<T extends IExecutable>(classRef: new (...args: any[]) => T): T[] {
		const result: T[] = [];
		for(const module of this.modules.values()) {
			if(module instanceof classRef) result.push(module);
		}
		return result;
	}

	HasModuleOfType(classRef: new (...args: any[]) => IExecutable): boolean {
		for(const module of this.modules.values()) {
			if(module instanceof classRef) return true;
		}
		return false;
	}

	Update() {
		for (const [, module] of this.modules) {
			if(!this.PreUpdate(module)) continue;
			module.Update();
		}
	}

	FixedUpdate() {
		for (const [, module] of this.modules) {
			if(!module.Active) continue;
			module.FixedUpdate();
		}
	}

	Destroy() {
		for(const [, module] of this.modules) {
			module.Destroy();
		}
		this.modules.clear();
	}
}
