import {ICoordinates, IShape} from '../../../types/common';
import {Maths, Point, Segment, Vector} from '../../Classes';

export class Rect {
	constructor(
        protected from: ICoordinates,
        protected to: ICoordinates
	) {}

	SetSize(size: number) {
		const factorX = size / Math.abs(this.to.x - this.from.x);
		const factorY = size / Math.abs(this.to.y - this.from.y);
		this.from.x *= factorX;
		this.to.x *= factorX;
		this.from.y *= factorY;
		this.to.y *= factorY;
	}

	get From() {
		return this.from;
	}

	get To() {
		return this.to;
	}

	get Width() {
		return Math.abs(this.from.x - this.to.x);
	}

	get Height() {
		return Math.abs(this.from.y - this.to.y);
	}
}

export class BoundingBox extends Rect implements IShape {
	private offset: ICoordinates;

	constructor(from: ICoordinates, to: ICoordinates, offset: ICoordinates = new Point()) {
		super(from, to);
		this.Offset = offset;
	}

	set Offset (newCenter: ICoordinates) {
		this.offset = newCenter.Copy();
	}

	get Offset (): ICoordinates {
		return this.offset.Copy();
	}

	get BoundingBox() {
		return this;
	}

	static Overlap(a: BoundingBox, b: BoundingBox): boolean {
		if (a.from.x > b.to.x || b.from.x > a.to.x) return false;
		return a.to.y > b.from.y || b.to.y > a.from.y;
	}

	get Center(): Point {
		return new Point(
			Maths.Lerp(this.from.x, this.to.x, 0.5),
			Maths.Lerp(this.from.y, this.to.y, 0.5),
		);
	}

	Copy(): BoundingBox {
		return new BoundingBox(this.from.Copy(), this.to.Copy(), this.offset);
	}

	IsPointInside(point: ICoordinates): boolean {
		return point.x >= Math.min(this.from.x, this.to.x)
            && point.x <= Math.max(this.from.x, this.to.x)
            && point.y >= Math.min(this.from.y, this.to.y)
            && point.y >= Math.min(this.from.y, this.to.y);
	}

	IsIntersectingOther(other: BoundingBox): boolean {
		return BoundingBox.Overlap(this, other);
	}

	GetIntersectionPoints(): Array<ICoordinates> {
		// TODO
		return [];
	}

}

export class SegmentList {
	protected segments: Array<Segment>;
	protected boundingBox: BoundingBox;
	protected offset: ICoordinates;

	constructor(segments: Array<Segment>, offset: ICoordinates = new Vector() ) {
		this.offset = offset;
		this.segments = segments.map(segment => segment.Copy());
		if(!this.segments.length) return;
		let minX = segments[0].from.x;
		let maxX = segments[0].from.x;
		let minY = segments[0].from.y;
		let maxY = segments[0].from.y;
		for(let index = 1; index < this.Count; index++) {
			const {from, to} = segments[index];
			if(minX > from.x) minX = from.x;
			if(minX > to.x) minX = to.x;
			if(minY > from.y) minY = from.y;
			if(minY > to.y) minY = to.y;
			if(maxX < from.x) maxX = from.x;
			if(maxX < to.x) maxX = to.x;
			if(maxY < from.y) maxY = from.y;
			if(maxY < to.y) maxY = to.y;

		}
		this.boundingBox = new BoundingBox(new Point(minX, maxY), new Point(maxX, minY), this.offset);
	}


	get Width() {
		return 0;
		return this.boundingBox.Width;
	}

	get Height() {
		return 0;
		return this.boundingBox.Height;
	}

	set Offset(val: ICoordinates) {
		this.offset = val.Copy();
	}

	get Offset(): ICoordinates {
		return this.offset.Copy();
	}

	public AddSegment(segment: Segment) {
		this.segments.push(segment);
	}

	public RemoveSegment(index: number) {
		this.segments.splice(index, 1);
	}

	get SegmentsUnsafe(): Array<Segment> {
		return this.segments;
	}

	get Segments(): Array<Segment> {
		return this.segments.map(val => val.Copy());
	}

	get Count(): number {
		return this.segments.length;
	}
}

export class PolygonalChain {
	protected points: Array<ICoordinates>;
	private readonly closed: boolean;

	constructor(points: Array<Point>, closeChain?: boolean) {
		this.closed = closeChain || false;
		this.points = points || [];
	}

	get Width() {
		return 0;
	}

	get Height() {
		return 0;
	}

	AddPoint(point: ICoordinates): void {
		if(this.closed) this.points.pop();
		this.points.push(point);
		if(!this.closed) return;
		this.points.push(this.points[this.points.length - 1]);
	}

	IsPointOnLine(point: ICoordinates): boolean {
		if(this.points.some(existingPoint => existingPoint.x === point.x && existingPoint.y === point.y))
			return true;
		let hasPoint = false;
		for(let i = 1; i < this.points.length; i++) {
			const segment = new Segment(this.points[i - 1], this.points[i]);
			hasPoint = segment.HasPoint(point);
			if(hasPoint) break;
		}
		return hasPoint;
	}

	get Points(): Array<ICoordinates> {
		return this.points;
	}

	get Count(): number {
		return this.points.length;
	}

	get SegmentsUnsafe(): Array<Segment> {
		const segments: Array<Segment> = [];
		for(let i = 1; i < this.points.length; i++) {
			segments.push(new Segment(this.points[i - 1], this.points[i]));
		}
		if(this.closed) segments.push(new Segment(this.points[this.points.length - 1], this.points[0]));
		return segments;
	}
}

export class Circle {
	constructor(
        public radius: number,
        public center: ICoordinates,
	) {}

	SetSize(size: number) {
		this.radius = size / 2;
	}

	get Width() {
		return this.radius * 2;
	}

	get Height() {
		return this.radius * 2;
	}
}

export class CircleArea extends Circle implements IShape {
	private offset: ICoordinates;

	constructor(radius: number, center: ICoordinates, offset: ICoordinates = new Point()) {
		super(radius, center);
		this.offset = offset.Copy();
	}

	get BoundingBox() {
		return new BoundingBox(
			new Point(this.center.x - this.radius + this.offset.x, this.center.y + this.radius + this.offset.y),
			new Point(this.center.x + this.radius + this.offset.x, this.center.y - this.radius + this.offset.y),
			this.offset,
		);
	}

	get Center() {
		return Vector.Of(this.offset.x + this.center.x, this.offset.y + this.center.y);
	}

	set Offset (newOffset: ICoordinates) {
		this.offset = newOffset.Copy();
	}

	get Offset (): ICoordinates {
		return this.offset.Copy();
	}

	IsPointInside(point: ICoordinates): boolean {
		const segment = new Segment(point, this.center);
		return segment.Length <= this.radius;
	}

	IsIntersectingOther(other: CircleArea): boolean {
		const segment = new Segment(other.center, this.center);
		return segment.Length <= this.radius + other.radius;
	}

	GetIntersectionPoints(other: CircleArea): Array<ICoordinates> {
		const segment = new Segment(other.center, this.center);
		const radiusSum = this.radius + other.radius;
		const distanceBetweenCenters = segment.Length;
		if(radiusSum < distanceBetweenCenters) return [];
		if(radiusSum === distanceBetweenCenters)
			return [Vector.LerpBetween(this.center, other.center, this.radius / radiusSum)];

		// TODO
		return [];
	}
}

