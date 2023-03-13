import {ICoordinates} from "../types/common";
import {IIterator, IList, IQueue, IStack, IteratorReturnValue} from "../types/Iterators";

export class Coordinates {
    static ConvertToPolar(x: number, y: number): { r: number, angle: number } {
        const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if(r === 0) return { r, angle: 0 };
        if (y >= 0) return { r, angle: Math.acos(x / r) };
        return { r, angle: -Math.acos(x / r) }
    }

    static ConvertToCartesian(r: number, angle: number): { x: number, y: number } {
        if(r === 0) return { x: 0, y: 0 };
        return { x: r * Math.cos(angle), y: r * Math.sin(angle) }
    }
}

export class PolarCoordinates {
    private radius: number;
    private angle: number;

    constructor(props: { x: number, y: number, r: number, angle: number }) {
        const { x, y, r, angle } = props;
        if(Maths.IsValidNumber(r) && Maths.IsValidNumber(angle)) {
            this.radius = r;
            this.angle = angle;
        } else if(Maths.IsValidNumber(x) && Maths.IsValidNumber(y)) {
            const polarAttributes = Coordinates.ConvertToPolar(x, y);
            this.radius = polarAttributes.r;
            this.angle = polarAttributes.angle;
        }
    }
}

export class Point implements ICoordinates {
    public x: number;
    public y: number;

    constructor(x = 0, y = x) {
        this.Set(x, y);
    }

    protected NormalizeCoord(coordinate: number): number {
        return coordinate < 0 ? -1 : coordinate === 0 ? 0 : 1;
    }

    protected NormalizeCoords(): [number, number] {
        return [this.NormalizeCoord(this.x), this.NormalizeCoord(this.y)];
    }

    Set(x: number, y = x) {
        this.x = x;
        this.y = y;
    }

    Copy(): Point {
        return new Point(this.x, this.y);
    }

    get Normalized(): Point {
        const [x, y] = this.NormalizeCoords();
        return new Point(x, y);
    }

    ToVector(): Vector {
        return new Vector(this.x, this.y);
    }
}

export class Vector extends Point {
    constructor(x = 0, y = 0) {
        super(x, y);
    }

    static get Up() {
        return new Vector(0, 1);
    }

    static get Down() {
        return new Vector(0, -1);
    }

    static get Left() {
        return new Vector(-1, 0);
    }

    static get Right() {
        return new Vector(1, 0);
    }

    static get Zero() {
        return new Vector();
    }

    static get One() {
        return new Vector(1, 1);
    }

    static Add(...args: Array<ICoordinates>): Vector {
        return args.reduce((acc: Vector, val) => {
            return acc.Add(val);
        }, new Vector())
    }

    static MultiplyCoordinates(base: ICoordinates | number, other: ICoordinates): Vector {
        return new Vector(other.x, other.y).MultiplyCoordinates(base);
    }

    static DivideCoordinates(base: ICoordinates | number, other: ICoordinates): Vector {
        return new Vector(other.x, other.y).DivideCoordinates(base);
    }

    get Magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    Translate (x = 0, y = 0): Vector {
        this.x += x;
        this.y += y;
        return this;
    }

    MoveTo (newX: number, newY: number): Vector {
        this.x = newX;
        this.y = newY;
        return this;
    }

    Multiply(multiplier: number ): Vector {
        this.x *= multiplier;
        this.y *= multiplier;
        return this;
    }

    MultiplyCoordinates(base: ICoordinates | number): Vector {
        if(typeof base === 'number') {
            this.x *= base;
            this.y *= base;
            return this;
        }
        this.x *= base.x;
        this.y *= base.y;
        return this;
    }

    DivideCoordinates(base: ICoordinates | number): Vector {
        if(typeof base === 'number') {
            return this.MultiplyCoordinates(1 / base);
        }
        return this.MultiplyCoordinates(new Vector(1 / base.x, 1 / base.y));
    }

    get Normalized(): Vector {
        const [x, y] = this.NormalizeCoords();
        return new Vector(x, y);
    }

    Add(other: ICoordinates): Vector {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    Subtract(other: ICoordinates): Vector {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    Clamp(x?: [number, number], y?: [number, number]) {
        if(x) this.x = Maths.Clamp(this.x, x[0], x[1]);
        if(!y) return this
        this.y = Maths.Clamp(this.y, y[0], y[1]);
        return this;
    }

    Rotate (deg: number) {

    }

    ToPoint(): Point {
        return new Point(this.x, this.y);
    }

    Copy(): Vector {
        return new Vector(this.x, this.y);
    }
}

export class Segment {
    constructor(public from: ICoordinates, public to: ICoordinates) {}
}

export class Maths {
    /**
     * Ensures value falls into the range
     *
     * @param val value to put into borders
     * @param min lower range of the value
     * @param max upper range of the value
     * @return {number}
     */
    static Clamp(val: number, min: number, max: number): number {
        if(val < min) return min;
        else if(val > max) return max;
        return val;
    }

    /**
     * Interpolates between to values depending on the factor
     *
     * @param from beginning of the interpolation
     * @param to end of the interpolation
     * @param factor midrange value
     * @return {number}
     */
    static LinearLerp(from: number, to: number, factor = 0): number {
        return from + (to - from) * factor;
    }


    /**
     * Returns a random value in the specified range
     *
     * @param from range border
     * @param to range border
     * @return {number}
     */
    static RandomRange(from: number, to: number): number {
        return Maths.LinearLerp(from, to, Math.random());
    }

    /**
     * Returns true if the var is number and not NaN
     *
     * @param variable any variable
     * @return {boolean}
     */

    static IsValidNumber(variable: unknown): boolean {
        return typeof variable === 'number' && variable !== Number.NaN;
    }

}

export class RGBAColor {
    private onUpdated: Function;
    private red: number;
    private green: number;
    private blue: number;
    private alpha: number;
    private colorHex: string;

    constructor(r = 0, g = 0, b = 0, a = 255, onUpdated = function (){}) {
        this.OnUpdated = onUpdated;
        this.setColor({r,g,b,a});
    }

    setColor ({r = this.red, g = this.green, b = this.blue, a = this.alpha}) {
        this.red = this.Clamp(r);
        this.green = this.Clamp(g);
        this.blue = this.Clamp(b);
        this.alpha = this.Clamp(a);
        this.updateHex();
    }

    set OnUpdated(onUpdated: Function) {
        this.onUpdated = onUpdated.bind(this);
    }

    static FromHex(hex: string) {
        if(!/[0-9A-F]{6}/i.test(hex)) throw 'invalid hex format';
        try {
            const red = parseInt(hex.slice(1, 3), 16);
            const green = parseInt(hex.slice(3, 5), 16);
            const blue = parseInt(hex.slice(5, 7), 16);
            const alpha = parseInt(hex.slice(7, 9), 16);
            return new RGBAColor(
                red, green, blue,
                Number.isNaN(alpha) ? 255 : alpha
            )
        } catch (e) {
            console.error(e);
        }
    }

    Copy () {
        return new RGBAColor(this.red, this.green, this.blue, this.alpha);
    }

    Clamp (val: number) {
        return Maths.Clamp(val, 0, 255);
    }

    set Red (val: number) {
        this.red = this.Clamp(val);
        this.updateHex();
    }

    set Green (val: number) {
        this.green = this.Clamp(val);
        this.updateHex();
    }

    set Blue (val: number) {
        this.blue = this.Clamp(val);
        this.updateHex();
    }

    set Alpha (val: number) {
        this.alpha = this.Clamp(val);
        this.updateHex();
    }

    updateHex () {
        this.colorHex = this.RgbToHex();
        this.onUpdated(this);
    }

    valueOf() {
        return this.colorHex;
    }

    toString() {
        return this.colorHex;
    }

    ComponentToHex(c: number) {
        const hex = c.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }

    RgbToHex() {
        return `#${this.ComponentToHex(this.red)}${this.ComponentToHex(this.green)}${this.ComponentToHex(this.blue)}${this.ComponentToHex(this.alpha)}`;
    }

    /**
     * Calculate a gradient between this and the specified colors
     *
     * @param {RGBAColor} color which color smoothly transform to
     * @param {number} factor interpolation factor
     * @return {RGBAColor}
     */
    LerpTo(color: RGBAColor, factor: number) {
        return new RGBAColor(
            Math.round(Maths.LinearLerp(this.red, color.red, factor)),
            Math.round(Maths.LinearLerp(this.green, color.green, factor)),
            Math.round(Maths.LinearLerp(this.blue, color.blue, factor)),
            Math.round(Maths.LinearLerp(this.alpha, color.alpha, factor)),
        );
    }
}

export class Iterator<T> implements IIterator<T> {
    protected index: number;
    protected readonly infinite: boolean;
    protected done: boolean;
    protected data: Array<T>

    constructor(options: { data: Array<T>, infinite?: boolean }) {
        const {data, infinite = false} = options;
        this.data = data;
        this.index = -1;
        this.infinite = infinite;
        this.done = !!this.data.length && !this.infinite;
    }


    public Rewind(): Iterator<T> {
        this.done = false;
        this.index = 0;
        return this;
    }

    [Symbol.iterator](): IteratorReturnValue<T> {
        return this.Next;
    }

    get Next(): IteratorReturnValue<T> {
        if(this.done) return this.Current;
        this.index++;
        const last = this.index === this.data.length;
        if(last && !this.infinite) this.done = true;
        else if(last && this.infinite) this.Rewind();
        return this.Current;
    }

    get Current(): IteratorReturnValue<T> {
        return  { value: this.data[this.index], done: this.done, index: this.index }
    }

    get Count(): number {
        return this.data.length;
    }

    get Done(): boolean {
        return this.done;
    }
}

export class List<T> extends Iterator<T> implements IList<T> {
    public Push(item: T): IList<T> {
        this.data.push(item);
        return this;
    }

    public Remove(index: number): IList<T> {
        this.data.splice(index, 1);
        return this;
    }

    public SearchAndRemove(predicate: (item: T) => boolean, global?: boolean): IList<T> {
        let newData = [];
        for(let item of this.data) {
            if(predicate(item)) continue;
            newData.push(item);
        }
        this.data = newData;
        return this;
    }
}

export class Queue<T> extends Iterator<T> implements IQueue<T> {
    public Push(item: T): IQueue<T> {
        this.data.push(item);
        return this;
    }

    public Shift(): T {
        return this.data.shift() as T;
    }
}

export class Stack<T> extends Iterator<T> implements IStack<T> {
    public Push(item: T): IStack<T> {
        this.data.push(item);
        return this;
    }

    public Pop(): T {
        return this.data.pop() as T;
    }
}

export class BezierCurve {
    private p1: Vector;
    private p2: Vector;
    private p3: Vector;

    constructor(p1: ICoordinates, p2: ICoordinates, p3: ICoordinates) {
        this.p1 = new Vector(p1.x, p1.y);
        this.p2 = new Vector(p2.x, p2.y);
        this.p3 = new Vector(p3.x, p3.y);
    }

    public Eval(factor: number): ICoordinates
    {
        const t = 1 - factor;
        return Vector.MultiplyCoordinates(Math.pow(t, 2), this.p1)
                .Add(Vector.MultiplyCoordinates(2 * t * factor, this.p2))
                .Add(Vector.MultiplyCoordinates( Math.pow(factor, 2), this.p3));
    }
}
