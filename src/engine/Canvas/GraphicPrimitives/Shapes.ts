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
	protected segments: Array<Segment>;
	protected boundingBox: BoundingBox;
	private readonly closed: boolean;
	protected offset: ICoordinates;

	constructor(points: Array<[number, number]>, closeChain?: boolean, offset: ICoordinates = new Vector() ) {
		this.closed = closeChain || false;
		this.offset = offset;
		let minX = points[0][0];
		let maxX = points[0][0];
		let minY = points[0][1];
		let maxY = points[0][1];
		this.AddPoint(new Vector(minX, maxY));
		for(let index = 1; index < this.PointsCount; index++) {
			const [x, y] = points[index];
			this.AddPoint(new Vector(x, y));
			if(x < minX) minX = x;
			else if(x > maxX) maxX = x;
			if(y < minY) minY = y;
			else if(y > maxY) maxY = y;
		}
		this.boundingBox = new BoundingBox(new Point(minX, maxY), new Point(maxX, minY), this.offset);
	}


	get Width() {
		return this.boundingBox.Width;
	}

	get Height() {
		return this.boundingBox.Height;
	}

	set Offset(val: ICoordinates) {
		this.offset = val.Copy();
	}

	get Offset(): ICoordinates {
		return this.offset.Copy();
	}

	GetPointRealPosition(index: number): ICoordinates {
		const point = this.points[index];
		return point.Copy().Set(point.x + this.offset.x, point.y + this.offset.y);
	}

	TotalLength(): number {
		return this.segments.reduce((acc,segment) => acc + segment.Length, 0);
	}

	private AddSegment(segment: Segment) {
		if(this.closed) this.segments.pop();
		this.segments.push(segment);
		if(!this.closed) return;
		this.segments.push(
			new Segment(
				segment.to.Copy(),
				this.segments[0].from.Copy(),
			)
		);
	}

	AddPoint(point: ICoordinates): void {
		this.points.push(point);
		if(this.PointsCount === 1) return;
		const current = this.points[this.points.length - 1];
		this.AddSegment(new Segment(current, point));
	}

	IsPointOnLine(point: ICoordinates): boolean {
		if(this.points.some(existingPoint => existingPoint.x === point.x && existingPoint.y === point.y))
			return true;
		return this.Segments.some(segment => segment.HasPoint(point));
	}

	get Points(): Array<ICoordinates> {
		return Array.from(this.points.values());
	}

	get SegmentsUnsafe(): Array<Segment> {
		return this.segments;
	}

	get Segments(): Array<Segment> {
		return this.segments.map(val => val.Copy());
	}

	get PointsCount(): number {
		return this.points.length;
	}
}

export class Polygon extends PolygonalChain implements IShape {
	constructor(points: Array<[number, number]>, offset: ICoordinates = new Vector()) {
		super(points, true, offset);
	}

	get BoundingBox(): BoundingBox {
		return this.boundingBox.Copy();
	}

	get Center(): ICoordinates {
		return this.boundingBox.Center;
	}

	IsPointInside(point: ICoordinates): boolean {
		if(!this.boundingBox.IsPointInside(point)) return false;
		if(this.IsPointOnLine(point)) return true;
		// TODO
		return false;
	}

	IsIntersectingOther(): boolean {
		return false;
		// TODO
	}

	GetIntersectionPoints(): Array<ICoordinates> {
		return [];
		// TODO
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

