import {AnyFunc, ICoordinates, Nullable} from '../types/common';
import {IIterator, IList, IQueue, IStack, IteratorReturnValue} from '../types/Iterators';

export class Coordinates {
	static ConvertToPolar(x: number, y: number): PolarCoordinates {
		const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		if(r === 0) return new PolarCoordinates({ r, angle: 0 });
		if (y >= 0) return new PolarCoordinates({ r, angle: Math.acos(x / r) });
		return new PolarCoordinates({ r, angle: -Math.acos(x / r) });
	}

	static ConvertToCartesian(r: number, angle: number): Point {
		if(r === 0) return new Point(0, 0);
		return new Point(r * Math.cos(angle), r * Math.sin(angle));
	}
}

export class PolarCoordinates {
	public radius: number;
	public angle: number;

	constructor(props: { x?: number, y?: number, r?: number, angle?: number }) {
		const { x = 0, y = 0, r, angle } = props;
		if(Maths.IsValidNumber(r) && Maths.IsValidNumber(angle)) {
			this.radius = r as number;
			this.angle = angle as number;
		} else if(Maths.IsValidNumber(x) && Maths.IsValidNumber(y)) {
			const polarAttributes = Coordinates.ConvertToPolar(x, y);
			this.radius = polarAttributes.radius;
			this.angle = polarAttributes.angle;
		}
		throw 'invalid constructor parameters passed.';
	}

	static From(point: ICoordinates): PolarCoordinates {
		return new PolarCoordinates({x: point.x, y: point.y});
	}

	ToCartesian(): Point {
		const {x, y} = Coordinates.ConvertToCartesian(this.radius, this.angle);
		return new Point(x, y);
	}

	Copy(): PolarCoordinates {
		return new PolarCoordinates({r: this.radius, angle: this.angle});
	}

}

export class Point implements ICoordinates {
	public x: number;
	public y: number;

	constructor(x = 0, y = x) {
		this.Set(x, y);
	}

	static From(source: ICoordinates): Point {
		return new Point(source.x, source.y);
	}

	Set(x: number, y = x): Point {
		this.x = x;
		this.y = y;
		return this;
	}

	SetFrom(other: ICoordinates): Point {
		this.Set(other.x, other.y);
		return this;
	}

	Copy(): Point {
		return new Point(this.x, this.y);
	}

	ToVector(): Vector {
		return new Vector(this.x, this.y);
	}
}

export class Vector extends Point {
	constructor(x = 0, y = 0) {
		super(x, y);
	}

	static From(source: ICoordinates): Vector {
		return new Vector(source.x, source.y);
	}

	static Of(x: number, y?: number): Vector {
		return new Vector(x, y || x);
	}

	static get Up() {
		return Vector.Of(0, 1);
	}

	static get Down() {
		return Vector.Of(0, -1);
	}

	static get Left() {
		return Vector.Of(-1, 0);
	}

	static get Right() {
		return Vector.Of(1, 0);
	}

	static get Zero() {
		return Vector.Of(0);
	}

	static get One() {
		return Vector.Of(1, 1);
	}

	static Add(...args: Array<ICoordinates>): Vector {
		return args.reduce((acc: Vector, val) => {
			return acc.Add(val);
		}, new Vector());
	}

	static LerpBetween(p1: ICoordinates, p2: ICoordinates, factor: number): Vector {
		return new Vector(
			Maths.Lerp(p1.x, p2.x, factor),
			Maths.Lerp(p1.y, p2.y, factor)
		);
	}

	static SameVectors(v1: ICoordinates, v2: ICoordinates): boolean {
		return Math.abs(v1.x - v2.x) < 0.000001 && Math.abs(v1.y - v2.y) < 0.000001;
	}

	static MultiplyCoordinates(base: ICoordinates | number, other: ICoordinates): Vector {
		return new Vector(other.x, other.y).MultiplyCoordinates(base);
	}

	static DivideCoordinates(base: ICoordinates | number, other: ICoordinates): Vector {
		return new Vector(other.x, other.y).DivideCoordinates(base);
	}

	static Distance(from: ICoordinates, to: ICoordinates):number {
		return new Vector(from.x - to.x, from.y - to.y).Magnitude;
	}

	static Angle(from: Vector, to: Vector): number {
		return from.Angle - to.Angle;
	}

	get Magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	set Magnitude(newMag: number) {
		this.SetMagnitude(newMag);
	}

	get Angle(): number {
		const cosine = Math.abs(this.x) / this.Magnitude;
		return Math.acos(cosine);
	}

	ToBinary(): Vector {
		let x = 0;
		let y = 0;
		if(this.x < 0) x = -1;
		else if(this.x > 0) x = 1;
		if(this.y < 0) y = -1;
		else if(this.y > 0) y = 1;
		return new Vector(x, y);
	}

	SetMagnitude(newMag: number): Vector {
		const factor = newMag / this.Magnitude;
		this.MultiplyCoordinates(factor);
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
		return this.Copy().SetMagnitude(1);
	}

	Add(other: ICoordinates): Vector {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	Mirror(x: boolean, y: boolean): Vector {
		if(x) this.x *= -1;
		if(y) this.y *= -1;
		return this;
	}

	Subtract(other: ICoordinates): Vector {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	Clamp(x?: [number, number], y?: [number, number]) {
		if(x) this.x = Maths.Clamp(this.x, x[0], x[1]);
		if(!y) return this;
		this.y = Maths.Clamp(this.y, y[0], y[1]);
		return this;
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

	HasPoint(point: ICoordinates): boolean {
		const xLerp = Maths.GetLerpFactor(this.from.x, this.to.x, point.x);
		if(xLerp === -1) return false;
		const yLerp = Maths.GetLerpFactor(this.from.y, this.to.y, point.y);
		if(yLerp === -1) return false;
		return xLerp === yLerp;
	}

	getIntersection(other: Segment): Nullable<Point> {
		const { x: x1, y: y1 } = this.from;
		const { x: x2, y: y2 } = this.to;
		const { x: x3, y: y3 } = other.from;
		const { x: x4, y: y4 } = other.to;
		const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
		if (denominator === 0) return null;
		const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
		const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
		if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
		return new Point(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
	}

	get Length() : number {
		return Math.sqrt(Math.pow(this.to.x - this.from.x, 2) + Math.pow(this.to.y - this.from.y, 2));
	}

	Copy(): Segment {
		return new Segment(this.from.Copy(), this.to.Copy());
	}
}

export class Ray {
	private to: ICoordinates;
	constructor(public from: ICoordinates, public angle: number) {
		this.to = this.ToUnitVector().Add(this.from);
	}
	Copy(): Ray {
		return new Ray(this.from.Copy(), this.angle);
	}

	ToUnitVector(): Vector {
		return Coordinates.ConvertToCartesian(1, this.angle).ToVector();
	}

	IsPointOnRay(point: ICoordinates): boolean {
		return Vector.SameVectors(this.ToUnitVector(), new Vector(point.x, point.y).Normalized);
	}
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
	static Lerp(from: number, to: number, factor = 0): number {
		return from + (to - from) * factor;
	}

	static GetLerpFactor(from: number, to: number, value: number): Nullable<number> {
		if(!from || !to || !value) return null;
		return value - from / to - from;
	}


	/**
     * Returns a random value in the specified range
     *
     * @param from range border
     * @param to range border
     * @return {number}
     */
	static RandomRange(from: number, to: number): number {
		return Maths.Lerp(from, to, Math.random());
	}

	/**
     * Returns true if the var is number and not NaN
     *
     * @param variable any variable
     * @return {boolean}
     */

	static IsValidNumber(variable: unknown): boolean {
		return !!variable && typeof variable === 'number' && !Number.isNaN(variable);
	}

}

export class RGBAColor {
	private onUpdated: AnyFunc;
	private red: number;
	private green: number;
	private blue: number;
	private alpha: number;
	private colorHex: string;

	constructor(r = 0, g = 0, b = 0, a = 255, onUpdated = () => {return;}) {
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

	set OnUpdated(onUpdated: AnyFunc) {
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
			);
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
		this.colorHex = this.ToHex();
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

	ToHex() {
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
			Math.round(Maths.Lerp(this.red, color.red, factor)),
			Math.round(Maths.Lerp(this.green, color.green, factor)),
			Math.round(Maths.Lerp(this.blue, color.blue, factor)),
			Math.round(Maths.Lerp(this.alpha, color.alpha, factor)),
		);
	}
}

export class Iterator<T> implements IIterator<T> {
	protected index: number;
	protected readonly infinite: boolean;
	protected done: boolean;
	protected data: Array<T>;

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
		return  { value: this.data[this.index], done: this.done, index: this.index };
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

	public SearchAndRemove(predicate: (item: T) => boolean): IList<T> {
		const newData = [];
		for(const item of this.data) {
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
