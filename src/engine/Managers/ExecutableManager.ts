import {IExecutable, IGameObject} from "../../types/GameObject";
import {Nullable} from "../../types/common";

export class ExecutableManager {
    protected readonly modules: Map<string, IExecutable>;
    protected readonly parent?: IGameObject;

    constructor(props: { modules?: Array<IExecutable>, parent?: IGameObject }) {
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
    protected PostUpdate(module: IExecutable): void {}

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
        for (let [_, module] of this.modules) {
            if(!this.PreUpdate(module)) continue;
            module.Update();
            if(this.PostUpdate) this.PostUpdate(module);
        }
    }
}