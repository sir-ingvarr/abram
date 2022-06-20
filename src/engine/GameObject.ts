import {IGameObject, IModule, ITransform} from "../types/GameObject";
import {Dictionary, Nullable} from "../types/common";
import Module from "./Module";
import {Vector} from "./Classes";
import CanvasContext2D from "./Context2d";
import Transform from "./Transform";

abstract class GameObject extends Module implements IGameObject {
    protected modules: Array<IModule> = [];
    private children: Map<string, IGameObject> = new Map<string, IGameObject>();
    public transform: ITransform;

    public name: string;
    public id: string;
    public needDestroy: boolean;
    public active: boolean;

    protected constructor(params: Dictionary) {
        super();
        const { position = new Vector(), name = 'GameObject', scale = Vector.One, rotation = 0, rotationDeg } = params;
        this.transform = new Transform(this, { lP: position, lS: scale, lR: rotation, lRDeg: rotationDeg })
        this.needDestroy = false;
        this.active = true;
        this.name = name;
        this.id = this.GenerateId(name);
    }

    RegisterModule(module: IModule) {
        module.gameObject = this;
        this.modules.push(module);
        module.SetGameObject(this);
        module.Start();
    }


    GetModuleByName(name: string): Nullable<IModule> {
        return this.modules.find(module => module.name === name) || null;
    }

    AppendChild(child: IGameObject) {
        this.children.set(child.id, child);
        child.context = this.context;
        child.transform.SetParent(this.transform);
        child.Start();
    }

    GetChildById(id: string): Nullable<IGameObject> {
        return this.children.get(id) || null;
    }

    RemoveChildById(id: string) {
        this.children.delete(id);
    }

    Update() {
        for(let module of this.modules) {
            if(!module.IsActive()) continue;
            module.Update();
        }
        for(let [key, child] of this.children) {
            if(!child.IsActive()) continue;
            if(child.needDestroy) {
                this.RemoveChildById(key);
                continue;
            }
            child.transform.SetParentAwarePosition();
            child.transform.SetParentAwareScale();
            child.transform.SetParentAwareRotation()
            child.Update();
        }
        this.transform.scaleUpdated = false;
        this.transform.positionUpdated = false;
        this.transform.rotationUpdated = false;
    }


    set Context(ctx: CanvasContext2D) {
        this.context = ctx;
    }

    GenerateId(name: string) {
        return name + Date.now() + Math.random();
    }

    Destroy() {
        this.needDestroy = true;
    }
}

export default GameObject;