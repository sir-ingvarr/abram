import {IExecutable, IGameObject, IModule} from "../types/GameObject";
import {Dictionary, Nullable} from "../types/common";
import {Vector} from "./Classes";
import CanvasContext2D from "./Context2d";
import Transform from "./Transform";
import {ExecutableManager} from "./Managers/ExecutableManager";
import {GameObjectManager} from "./Managers/GameObjectManager";
import BasicObject from "./BasicObject";

class GameObject extends BasicObject implements IGameObject {
    private modulesManager: ExecutableManager;
    private childManager: GameObjectManager;

    public name: string;
    public active: boolean;

    protected constructor(params: Dictionary) {
        const { active = true, position = new Vector(), name = 'GameObject', scale = Vector.One, rotation = 0, rotationDeg } = params;
        super({ name });
        this.transform = new Transform(this, {
            localPosition: position,
            localScale: scale,
            localRotation: rotation,
            localRotationDegrees: rotationDeg
        });
        this.childManager = new GameObjectManager({ modules: [], parent: this });
        this.modulesManager = new ExecutableManager({ modules: [], parent: this });
        this.needDestroy = false;
        this.active = active;
        this.name = name;
    }



    RegisterModule(module: IModule) {
        this.modulesManager.RegisterModule(module);
        module.SetGameObject(this);
    }

    GetModuleByName(name: string): Nullable<IExecutable> {
        return this.modulesManager.GetModuleByName(name);
    }

    AppendChild(child: IGameObject) {
        this.childManager.RegisterModule(child);
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
        this.transform.scaleUpdated = false;
        this.transform.positionUpdated = false;
        this.transform.rotationUpdated = false;
    }


    set Context(ctx: CanvasContext2D) {
        this.context = ctx;
    }

    Destroy() {
        this.needDestroy = true;
    }
}

export default GameObject;