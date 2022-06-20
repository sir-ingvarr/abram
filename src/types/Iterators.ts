export type IteratorReturnValue<T = any> = { done: boolean, value: T, index: number }

export interface IIterator<T = any> {
    Rewind(): IIterator<T>;
    get Next(): IteratorReturnValue<T>;
    get Current(): IteratorReturnValue<T>;
    get Count(): number;
    get Done(): boolean;
    [Symbol.iterator]: () => IteratorReturnValue<T>;
}

export interface IList<T = any> extends IIterator<T> {
    Push(item: T): IList<T>;
    Remove(index: number): IList<T>;
    SearchAndRemove(predicate: (item: T) => boolean, global?: boolean): IList<T>
}

export interface IStack<T = any> extends IIterator<T> {
    Pop(): T;
    Push(item: T): IStack<T>;
}

export interface IQueue<T = any> extends IIterator<T> {
    Shift(): T;
    Push(item: T): IQueue<T>;
}
