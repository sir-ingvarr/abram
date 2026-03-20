import {Vector} from '../Classes';
import {CircleArea} from '../Canvas/GraphicPrimitives/Shapes';
import {ICoordinates} from '../../types/common';

export enum ColliderShapeType {
	Circle,
	OBB,
}

export interface CollisionResult {
	normal: Vector;
	depth: number;
	contactPoint: Vector;
}

export class OBBShape {
	public halfWidth: number;
	public halfHeight: number;
	private offset: ICoordinates;
	private rotation: number;

	constructor(width: number, height: number, offset: ICoordinates = Vector.Zero, rotation = 0) {
		this.halfWidth = width / 2;
		this.halfHeight = height / 2;
		this.offset = offset;
		this.rotation = rotation;
	}

	get Offset(): ICoordinates {
		return this.offset;
	}

	set Offset(val: ICoordinates) {
		this.offset = val;
	}

	get Rotation(): number {
		return this.rotation;
	}

	set Rotation(val: number) {
		this.rotation = val;
	}

	get Center(): Vector {
		return new Vector(this.offset.x, this.offset.y);
	}

	get Width() {
		return this.halfWidth * 2;
	}

	get Height() {
		return this.halfHeight * 2;
	}

	SetSize(size: number) {
		this.halfWidth = size / 2;
		this.halfHeight = size / 2;
	}

	GetAxes(): [Vector, Vector] {
		const cos = Math.cos(this.rotation);
		const sin = Math.sin(this.rotation);
		return [
			new Vector(cos, sin),
			new Vector(-sin, cos),
		];
	}

	GetCorners(): [Vector, Vector, Vector, Vector] {
		const cx = this.offset.x;
		const cy = this.offset.y;
		const [axisX, axisY] = this.GetAxes();
		const ex = axisX.x * this.halfWidth;
		const ey = axisX.y * this.halfWidth;
		const fx = axisY.x * this.halfHeight;
		const fy = axisY.y * this.halfHeight;
		return [
			new Vector(cx + ex + fx, cy + ey + fy),
			new Vector(cx + ex - fx, cy + ey - fy),
			new Vector(cx - ex - fx, cy - ey - fy),
			new Vector(cx - ex + fx, cy - ey + fy),
		];
	}
}

export type ColliderShape = CircleArea | OBBShape;

function projectOnAxis(axis: Vector, points: Vector[]): { min: number, max: number } {
	let min = Vector.Dot(axis, points[0]);
	let max = min;
	for (let i = 1; i < points.length; i++) {
		const p = Vector.Dot(axis, points[i]);
		if (p < min) min = p;
		if (p > max) max = p;
	}
	return { min, max };
}

function overlapOnAxis(axis: Vector, cornersA: Vector[], cornersB: Vector[]): number {
	const a = projectOnAxis(axis, cornersA);
	const b = projectOnAxis(axis, cornersB);
	if (a.max < b.min || b.max < a.min) return 0;
	return Math.min(a.max - b.min, b.max - a.min);
}

export function detectCollision(shapeA: ColliderShape, shapeB: ColliderShape): CollisionResult | null {
	if (shapeA instanceof CircleArea && shapeB instanceof CircleArea) {
		return circleVsCircle(shapeA, shapeB);
	}
	if (shapeA instanceof OBBShape && shapeB instanceof OBBShape) {
		return obbVsObb(shapeA, shapeB);
	}
	if (shapeA instanceof CircleArea && shapeB instanceof OBBShape) {
		const result = circleVsObb(shapeA, shapeB);
		if (result) result.normal.MultiplyCoordinates(-1);
		return result;
	}
	if (shapeA instanceof OBBShape && shapeB instanceof CircleArea) {
		return circleVsObb(shapeB, shapeA);
	}
	return null;
}

function circleVsCircle(a: CircleArea, b: CircleArea): CollisionResult | null {
	const centerA = a.Center;
	const centerB = b.Center;
	const dx = centerB.x - centerA.x;
	const dy = centerB.y - centerA.y;
	const distSq = dx * dx + dy * dy;
	const radiusSum = a.radius + b.radius;

	if (distSq > radiusSum * radiusSum) return null;

	const dist = Math.sqrt(distSq);
	if (dist === 0) {
		return { normal: new Vector(1, 0), depth: radiusSum, contactPoint: new Vector(centerA.x, centerA.y) };
	}
	const nx = dx / dist;
	const ny = dy / dist;
	return {
		normal: new Vector(nx, ny),
		depth: radiusSum - dist,
		contactPoint: new Vector(centerA.x + nx * a.radius, centerA.y + ny * a.radius),
	};
}

function circleVsObb(circle: CircleArea, obb: OBBShape): CollisionResult | null {
	const circleCenter = circle.Center;
	const obbCenter = obb.Center;

	// Transform circle center into OBB's local space
	const dx = circleCenter.x - obbCenter.x;
	const dy = circleCenter.y - obbCenter.y;
	const cos = Math.cos(-obb.Rotation);
	const sin = Math.sin(-obb.Rotation);
	const localX = dx * cos - dy * sin;
	const localY = dx * sin + dy * cos;

	// Clamp to find closest point on rect edge
	const closestX = Math.max(-obb.halfWidth, Math.min(obb.halfWidth, localX));
	const closestY = Math.max(-obb.halfHeight, Math.min(obb.halfHeight, localY));

	let normalLocal: Vector;
	let depth: number;

	const isInside = closestX === localX && closestY === localY;

	if (isInside) {
		// Circle center is inside the OBB — push to nearest edge
		const distToRight = obb.halfWidth - localX;
		const distToLeft = obb.halfWidth + localX;
		const distToBottom = obb.halfHeight - localY;
		const distToTop = obb.halfHeight + localY;
		const minDist = Math.min(distToRight, distToLeft, distToBottom, distToTop);

		if (minDist === distToRight) {
			normalLocal = new Vector(1, 0);
		} else if (minDist === distToLeft) {
			normalLocal = new Vector(-1, 0);
		} else if (minDist === distToBottom) {
			normalLocal = new Vector(0, 1);
		} else {
			normalLocal = new Vector(0, -1);
		}
		depth = minDist + circle.radius;
	} else {
		const diffX = localX - closestX;
		const diffY = localY - closestY;
		const distSq = diffX * diffX + diffY * diffY;

		if (distSq > circle.radius * circle.radius) return null;

		const dist = Math.sqrt(distSq);
		if (dist === 0) return null;

		normalLocal = new Vector(diffX / dist, diffY / dist);
		depth = circle.radius - dist;
	}

	// Transform normal and contact point back to world space
	const cosR = Math.cos(obb.Rotation);
	const sinR = Math.sin(obb.Rotation);

	return {
		normal: new Vector(
			normalLocal.x * cosR - normalLocal.y * sinR,
			normalLocal.x * sinR + normalLocal.y * cosR,
		),
		depth,
		contactPoint: new Vector(
			obbCenter.x + closestX * cosR - closestY * sinR,
			obbCenter.y + closestX * sinR + closestY * cosR,
		),
	};
}

function obbVsObb(a: OBBShape, b: OBBShape): CollisionResult | null {
	const cornersA = a.GetCorners();
	const cornersB = b.GetCorners();
	const axesA = a.GetAxes();
	const axesB = b.GetAxes();
	const axes = [axesA[0], axesA[1], axesB[0], axesB[1]];

	let minOverlap = Infinity;
	let minAxis: Vector = axes[0];

	for (let i = 0; i < axes.length; i++) {
		const axis = axes[i];
		const overlap = overlapOnAxis(axis, cornersA as Vector[], cornersB as Vector[]);
		if (overlap === 0) return null;
		if (overlap < minOverlap) {
			minOverlap = overlap;
			minAxis = axis;
		}
	}

	// Ensure normal points from A to B
	const centerDiff = Vector.Subtract(b.Center, a.Center);
	if (Vector.Dot(centerDiff, minAxis) < 0) {
		minAxis = Vector.MultiplyCoordinates(-1, minAxis);
	}

	// Contact point: midpoint between centers, offset along normal
	const centerA = a.Center;
	const centerB = b.Center;
	return {
		normal: minAxis,
		depth: minOverlap,
		contactPoint: Vector.LerpBetween(centerA, centerB, 0.5),
	};
}
