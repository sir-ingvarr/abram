import {ICoordinates, IPoint, Nullable} from './common';
import {Vector} from '../engine/Classes';
import CanvasContext2D from '../engine/Canvas/Context2d';
import Rigidbody from '../engine/Modules/Rigidbody';
import {BasicObjectsConstructorParams} from '../engine/Objects/BasicObject';
import {CircleArea} from '../engine/Canvas/GraphicPrimitives/Shapes';

interface IWithLifeCycle {
    get StartExecuted(): boolean;
    get IsWaitingDestroy(): boolean;
    Start(): void;
    Destroy(): void;
    Update(): void;
    get Id(): string;
}

interface IWithContext {
    get Context(): CanvasContext2D;
    set Context(ctx: CanvasContext2D);
}

interface IScalable {
    get Scale(): Vector;
    set Scale(value: Vector);

    get LocalScale(): Vector;
    set LocalScale(value: Vector);
}

export interface IExecutable extends IWithLifeCycle {
    name: string;
    active: boolean;
    gameObject?: IGameObject;
    parent?: ITransform;
    set Active(value: boolean);
    get Active(): boolean;
    SetGameObject(gameObject: IBasicObject): void;
}

export interface ICollider2D extends IExecutable {
    parent: ITransform;
    connectedRigidbody: Rigidbody;
    shape: CircleArea;
    Collide(other: ICollider2D): void;
    Leave(other: ICollider2D): void
}

export interface ITransform extends IScalable {
    gameObject: IGameObject | IBasicObject;

    get Parent(): Nullable<ITransform>
    set Parent(transform: Nullable<ITransform>);

    set Anchors(newVal: IPoint);
    get Anchors(): IPoint;

    get WorldPosition(): Vector;
    get LocalPosition(): Vector;
    set LocalPosition(value: Vector);

    RotateDeg(amount: number): ITransform;

    get LocalRotation(): number;
    set LocalRotation(value: number);

    get WorldRotation(): number;

    get LocalRotationDeg(): number
    set LocalRotationDeg(value: number);

    Translate(amount: ICoordinates): ITransform;
}

export interface IBasicObject extends IExecutable, IWithContext {
    transform: ITransform;
    get IsWaitingDestroy(): boolean;
}

export interface IGameObjectConstructable<T extends BasicObjectsConstructorParams> {
    new(params: T): IGameObject;
}

export interface IGameObject extends IBasicObject, IWithContext {
    active: boolean;
    name: string;

    AppendChild(child: IGameObject): string;
    RegisterModule(module: IExecutable): void;
    RemoveChildById(id: string): void;
    GetModuleByName(name: string): Nullable<IExecutable>;
    GetChildById(id: string): Nullable<IExecutable>;
}

export interface IGraphic {
    layer: number;
    Render(): void;
}
