import {IBasicObject, IGameObject, IModule} from "../types/GameObject";
import CanvasContext2D from "./Context2d";
import {ICoordinates} from "../types/common";

abstract class Module implements IModule {
    protected readonly id: string;
    name: string;
    active: boolean = true;
    gameObject: IBasicObject;
    public context: CanvasContext2D;

    constructor(params: {name?: string}) {
        this.id = this.GenerateId(params.name || this.constructor.name);
    }

    get Id() {
        return this.id;
    }

    set Active(value: boolean) {
        this.active = value
    }

    get Active(): boolean {
        return this.active;
    }

    GenerateId(name: string) {
        return name + Date.now() + Math.random();
    }

    public ScaleUpdated(newScale: ICoordinates) {}

    SetGameObject(gameObject: IGameObject) {
        this.gameObject = gameObject;
    }

    Start(): void {}

    Update(): void {}
}

export default Module;
