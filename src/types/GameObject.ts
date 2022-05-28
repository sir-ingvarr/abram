import {ICoordinates, Nullable} from "./common";
import {Vector} from "../engine/Classes";
import CanvasContext2D from "../engine/Context2d";

interface IWithLifeCycle {
    Start(): void;
    Destroy?(): void;
    Update(): void;
}

interface IWithContext {
    context: CanvasContext2D;
    set Context(ctx: CanvasContext2D);
    SetResolution(resolution: number): void;
}

interface IScalable {
    scale: ICoordinates;
    localScale: ICoordinates;

    SetScale(x: number, y?: number): void;
    ReplaceScale(scale: ICoordinates): void;
    GetScale(): ICoordinates;
}

export interface IExecutable extends IWithLifeCycle {
    name: string;
    active: boolean;
    gameObject: IGameObject;
    SetActive(value: boolean): void;
    IsActive(): boolean;
}

export interface IModule extends IExecutable {
    SetGameObject(gameObject: IGameObject): void;
}

export interface IGameObject extends IExecutable, IWithContext, IScalable {
    id: string;
    localPosition: Vector;
    worldPosition: Vector;
    parent: Nullable<IGameObject>;
    needDestroy: boolean;
    resolution: number;

    SetParent(gameObject: IGameObject): void;
    GenerateId(name: string): string;
    AppendChild(child: IGameObject): void;
    RegisterModule(module: IModule): void;
    GetModuleByName(name: string): Nullable<IModule>;
    GetChildById(id: string): Nullable<IGameObject>;
}
