import {ExecutableManager} from "./ExecutableManager";
import GameObject from "../GameObject";
import {IGameObject} from "../../types/GameObject";

export class GameObjectManager extends ExecutableManager {
    constructor(params: { modules: Array<GameObject>, parent?: IGameObject }) {
        super(params);
    }

    protected PostModuleRegister(module: GameObject) {
        super.PostModuleRegister(module);
        if(this.parent) {
            module.context = this.parent.Context;
            module.transform.SetParent(this.parent.transform);
        }
    }

    protected PreUpdate(module: GameObject): boolean {
        if(!super.PreUpdate(module)) return false;
        if(module.IsWaitingDestroy) {
            this.UnregisterModuleById(module.Id);
            return false;
        }
        return true;
    }

    protected PostUpdate(module: GameObject) {
        super.PostUpdate(module);
        module.transform.SetParentAwarePosition();
        module.transform.SetParentAwareScale();
        module.transform.SetParentAwareRotation();
    }
}