import {ICoordinates, Nullable} from "./common";
import {Vector} from "../engine/Classes";
import CanvasContext2D from "../engine/Context2d";

interface IWithLifeCycle {
    Start(): void;
    Destroy?(): void;
    Update(): void;
    get Id(): string;
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
    gameObject: IBasicObject;
    set Active(value: boolean);
    get Active(): boolean;
}

export interface IModule extends IExecutable {
    SetGameObject(gameObject: IBasicObject): void;
}

export interface ITransform extends IScalable {
    gameObject: IGameObject | IBasicObject;
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

export interface IBasicObject extends IExecutable, IWithContext {
    transform: ITransform;

    get IsWaitingDestroy(): boolean;

}

export interface IGameObject extends IBasicObject, IWithContext {
    active: boolean;
    name: string;

    AppendChild(child: IGameObject): void;
    RegisterModule(module: IModule): void;
    GetModuleByName(name: string): Nullable<IExecutable>;
    GetChildById(id: string): Nullable<IExecutable>;
}

export interface IGraphic {
    layer: number;
    Render(): void;
}
