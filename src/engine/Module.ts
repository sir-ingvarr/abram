import {IGameObject, IModule} from "../types/GameObject";
import CanvasContext2D from "./Context2d";
import {ICoordinates} from "../types/common";

abstract class Module implements IModule {
    readonly scale: ICoordinates;
    readonly localScale: ICoordinates;

    name: string;
    active: boolean = true;
    gameObject: IGameObject;
    public context: CanvasContext2D;

    public SetActive(value: boolean) {
        this.active = value
    }

    public ScaleUpdated(newScale: ICoordinates) {}

    public IsActive(): boolean {
        return this.active;
    }

    SetGameObject(gameObject: IGameObject) {
        this.gameObject = gameObject;
    }

    Start() {}

    Update() {}
}

export default Module;
