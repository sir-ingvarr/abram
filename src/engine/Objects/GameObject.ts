import {IExecutable, IGameObject} from "../../types/GameObject";
import {Dictionary, Nullable} from "../../types/common";
import {Vector} from "../Classes";
import CanvasContext2D from "../Canvas/Context2d";
import Transform from "./Transform";
import {ExecutableManager} from "../Managers/ExecutableManager";
import {GameObjectManager} from "../Managers/GameObjectManager";
import BasicObject from "./BasicObject";

class GameObject extends BasicObject implements IGameObject {
    private modulesManager: ExecutableManager;
    private childManager: GameObjectManager;

    public name: string;
    public active: boolean;

    protected constructor(params: Dictionary) {
        const { active = true, position = new Vector(), name = 'GameObject', scale = Vector.One, rotation = 0, rotationDeg, context: CanvasContext2D } = params;
        super({ name });
        this.transform = new Transform(this, {
            localPosition: position,
            localScale: scale,
            localRotation: rotation,
            localRotationDegrees: rotationDeg
        });
        this.childManager = new GameObjectManager({ modules: [], parent: this, context: this.context });
        this.modulesManager = new ExecutableManager({ modules: [], parent: this, context: this.context });
        this.needDestroy = false;
        this.active = active;
        this.name = name;
    }



    RegisterModule(module: IExecutable) {
        this.modulesManager.RegisterModule(module);
        module.SetGameObject(this);
    }

    get Context() {
        return this.context as CanvasContext2D;
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
    }


    set Context(ctx: CanvasContext2D) {
        this.context = ctx;
    }

    Destroy() {
        this.needDestroy = true;
        this.modulesManager.Destroy();
        this.childManager.Destroy();
    }
}

export default GameObject;