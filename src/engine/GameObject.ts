import {IGameObject, IModule} from "../types/GameObject";
import {ICoordinates, Nullable} from "../types/common";
import Module from "./Module";
import {Vector} from "./Classes";
import CanvasContext2D from "./Context2d";

abstract class GameObject extends Module implements IGameObject {
    protected modules: Array<IModule> = [];
    private children: Map<string, IGameObject> = new Map<string, IGameObject>();

    public name: string;
    public id: string;
    public resolution: number;
    public localPosition: Vector;
    public worldPosition: Vector;
    public parent: IGameObject;
    public needDestroy: boolean;
    public active: boolean;
    public scale: Vector;
    public localScale: Vector;


    protected constructor({ position = new Vector(), name = 'GameObject', scale = new Vector() }) {
        super();
        this.localPosition = new Vector(position.x, position.y);
        this.worldPosition = new Vector(position.x, position.y);
        this.scale = new Vector(scale.x, scale.y);
        this.localScale = new Vector(scale.x, scale.y);
        this.needDestroy = false;
        this.active = true;
        this.resolution = 1;
        this.name = name;
        this.id = this.GenerateId(name);
    }

    RegisterModule(module: IModule) {
        module.gameObject = this;
        this.modules.push(module);
        module.SetGameObject(this);
        module.Start();
    }

    SetScale(scaleX: number, scaleY?: number) {
        this.scale.Set(scaleX, scaleY);
        // for(let module of this.modules) {
        //     module.SetScale(this.scale.x, this.scale.y);
        // }
        for(let child of this.children.values()) {
            child.SetScale(scaleX , scaleY);
        }
    }

    GetScale(): ICoordinates {
        return this.scale;
    }


    ReplaceScale(scale: ICoordinates) {
        this.SetScale(scale.x, scale.y);
    }

    GetModuleByName(name: string): Nullable<IModule> {
        return this.modules.find(module => module.name === name) || null;
    }

    SetParent(gameObject: IGameObject) {
        this.parent = gameObject;
        this.SetParentRespectivePosition();
    }

    AppendChild(child: IGameObject) {
        this.children.set(child.id, child);
        child.context = this.context;
        child.SetResolution(this.resolution);
        child.SetParent(this);
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
            child.Update();
        }
        if(!this.parent) return;
        this.SetParentRespectivePosition();
    }

    private SetParentRespectivePosition() {
        this.worldPosition = Vector.Add(
            Vector.MultiplyCoordinates(this.scale.Normalized, this.localPosition),
            this.parent.worldPosition
        );
    }

    set Context(ctx: CanvasContext2D) {
        this.context = ctx;
    }

    GenerateId(name: string) {
        return name + Date.now() + Math.random();
    }

    SetResolution(newRes: number) {
        this.resolution = newRes;
        this.worldPosition.ApplyResolution(newRes);
        this.localPosition.ApplyResolution(newRes);
    }

    Destroy() {
        this.needDestroy = true;
    }
}

export default GameObject;