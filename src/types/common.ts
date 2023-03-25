import {BoundingBox} from '../engine/Canvas/GraphicPrimitives/Shapes';

export type Nullable<T> = T | null;

export type Dictionary<V> = { [key: string]: V };

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