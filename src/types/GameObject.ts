import {ICoordinates, IShape, Nullable} from './common';
import {Vector} from '../engine/Classes';
import CanvasContext2D from '../engine/Canvas/Context2d';
import Rigidbody from '../engine/Modules/Rigidbody';
import BasicObject, {BasicObjectsConstructorParams} from '../engine/Objects/BasicObject';
import {ModuleConstructorParams} from '../engine/Modules/Module';

interface IWithLifeCycle {
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
    gameObject?: IBasicObject;
    set Active(value: boolean);
    get Active(): boolean;
    SetGameObject(gameObject: IBasicObject): void;
}

export interface ICollider2D extends IExecutable {
    rigidbody: Rigidbody;
    shape: IShape;
    parent: ITransform;
    Collide(other: ICollider2D): void;
    Leave(other: ICollider2D): void
}

export interface ITransform extends IScalable {
    gameObject: IGameObject | IBasicObject;
    anchors: { x: number, y: number };

    get Parent(): Nullable<ITransform>
    set Parent(transform: Nullable<ITransform>);

    get WorldPosition(): Vector;
    get LocalPosition(): Vector;
    set LocalPosition(value: Vector);

    get Rotation(): number;
    get RotationDeg(): number;
    RotateDeg(amount: number): ITransform;

    get LocalRotation(): number;
    set LocalRotation(value: number);

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
    GetModuleByName(name: string): Nullable<IExecutable>;
    GetChildById(id: string): Nullable<IExecutable>;
}

export interface IGraphic {
    layer: number;
    Render(): void;
}
