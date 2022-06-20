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
}

interface IScalable {
    get Scale(): Vector;
    get LocalScale(): Vector;

    set LocalScale(value: Vector);
    set Scale(value: Vector);
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

export interface ITransform extends IScalable {
    gameObject: IGameObject;
    anchors: { x: number, y: number };

    positionUpdated: boolean;
    scaleUpdated: boolean;
    rotationUpdated: boolean;

    get Parent(): Nullable<ITransform>
    SetParent(gameObject: ITransform): void;

    get WorldPosition(): Vector;
    get LocalPosition(): Vector;
    get Rotation(): number;
    get RotationDeg(): number;
    get LocalRotation(): number;
    get LocalRotationDeg(): number

    set LocalPosition(value: Vector);
    set WorldPosition(value: Vector);
    set LocalRotation(value: number);
    set LocalRotationDeg(value: number);

    RotateDeg(amount: number): ITransform;
    Translate(amount: ICoordinates): ITransform;

    SetParentAwarePosition(): void;
    SetParentAwareScale(): void;
    SetParentAwareRotation(): void;
}

export interface IGameObject extends IExecutable, IWithContext {
    id: string;
    transform: ITransform;
    needDestroy: boolean;

    GenerateId(name: string): string;
    AppendChild(child: IGameObject): void;
    RegisterModule(module: IModule): void;
    GetModuleByName(name: string): Nullable<IModule>;
    GetChildById(id: string): Nullable<IGameObject>;
}

export interface IGraphic {
    layer: number;
    Render(): void;
}
