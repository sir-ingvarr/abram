export type Nullable<T> = T | null;

export type Dictionary<V = any> = { [key: string]: V };

export interface ICoordinates {
    x: number,
    y: number,
    Set(x: number, y?: number): void,
    Copy(): ICoordinates,
    get Normalized(): ICoordinates
}
