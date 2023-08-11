import {BoundingBox} from '../engine/Canvas/GraphicPrimitives/Shapes';
import {Vector} from '../engine/Classes';

export type Nullable<T> = T | null;

export type Dictionary<V> = { [key: string | number]: V };

export type AnyFunc<T = any> = (...args: any) => T;

export enum ColorSpace {
    SRGB='srgb',
    DisplayP3='display-p3'
}

export type CanvasContext2DAttributes = {
    alpha: boolean,
    desynchronized: boolean,
    willReadFrequently: boolean,
    colorSpace: ColorSpace,
}

export interface ICoordinates {
    x: number,
    y: number,

    Set(x: number, y?: number): ICoordinates,

    Copy(): ICoordinates,

    ToArray(): [number, number],

    ToVector(): Vector,

    SetFrom(other: ICoordinates): ICoordinates,
}

export interface IShape {
    get Offset(): ICoordinates;
    set Offset(newOffset: ICoordinates);
    get Width(): number;
    get Height(): number;
    get Center(): ICoordinates;
    IsPointInside(point: ICoordinates): boolean;
    IsIntersectingOther(other: unknown): boolean;
    GetIntersectionPoints(other: unknown): Array<ICoordinates>;
    get BoundingBox(): BoundingBox;
}