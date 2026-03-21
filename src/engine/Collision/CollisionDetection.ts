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
		const centerX = this.offset.x;
		const centerY = this.offset.y;
		const [axisX, axisY] = this.GetAxes();
		const extentX_x = axisX.x * this.halfWidth;
		const extentX_y = axisX.y * this.halfWidth;
		const extentY_x = axisY.x * this.halfHeight;
		const extentY_y = axisY.y * this.halfHeight;
		return [
			new Vector(centerX + extentX_x + extentY_x, centerY + extentX_y + extentY_y),
			new Vector(centerX + extentX_x - extentY_x, centerY + extentX_y - extentY_y),
			new Vector(centerX - extentX_x - extentY_x, centerY - extentX_y - extentY_y),
			new Vector(centerX - extentX_x + extentY_x, centerY - extentX_y + extentY_y),
		];
	}
}

export type ColliderShape = CircleArea | OBBShape;

// --- Projection helpers for SAT ---

function projectOnAxis(axis: Vector, points: Vector[]): { min: number, max: number } {
	let min = Vector.Dot(axis, points[0]);
	let max = min;
	for (let i = 1; i < points.length; i++) {
		const projection = Vector.Dot(axis, points[i]);
		if (projection < min) min = projection;
		if (projection > max) max = projection;
	}
	return { min, max };
}

function overlapOnAxis(axis: Vector, cornersA: Vector[], cornersB: Vector[]): number {
	const projectionA = projectOnAxis(axis, cornersA);
	const projectionB = projectOnAxis(axis, cornersB);
	if (projectionA.max < projectionB.min || projectionB.max < projectionA.min) return 0;
	return Math.min(projectionA.max - projectionB.min, projectionB.max - projectionA.min);
}

// --- Dispatcher ---

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

// --- Circle vs Circle ---

function circleVsCircle(circleA: CircleArea, circleB: CircleArea): CollisionResult | null {
	const centerA = circleA.Center;
	const centerB = circleB.Center;
	const deltaX = centerB.x - centerA.x;
	const deltaY = centerB.y - centerA.y;
	const distanceSq = deltaX * deltaX + deltaY * deltaY;
	const radiusSum = circleA.radius + circleB.radius;

	if (distanceSq > radiusSum * radiusSum) return null;

	const distance = Math.sqrt(distanceSq);
	if (distance === 0) {
		return { normal: new Vector(1, 0), depth: radiusSum, contactPoint: new Vector(centerA.x, centerA.y) };
	}
	const normalX = deltaX / distance;
	const normalY = deltaY / distance;
	return {
		normal: new Vector(normalX, normalY),
		depth: radiusSum - distance,
		contactPoint: new Vector(centerA.x + normalX * circleA.radius, centerA.y + normalY * circleA.radius),
	};
}

// --- Circle vs OBB helpers ---

function transformToObbLocalSpace(
	circleCenter: ICoordinates,
	obbCenter: ICoordinates,
	rotation: number,
): { localX: number; localY: number } {
	const deltaX = circleCenter.x - obbCenter.x;
	const deltaY = circleCenter.y - obbCenter.y;
	const cosInverse = Math.cos(-rotation);
	const sinInverse = Math.sin(-rotation);
	return {
		localX: deltaX * cosInverse - deltaY * sinInverse,
		localY: deltaX * sinInverse + deltaY * cosInverse,
	};
}

function findClosestPointOnObb(
	localX: number,
	localY: number,
	halfWidth: number,
	halfHeight: number,
): { closestX: number; closestY: number } {
	return {
		closestX: Math.max(-halfWidth, Math.min(halfWidth, localX)),
		closestY: Math.max(-halfHeight, Math.min(halfHeight, localY)),
	};
}

function calculateInsideCollision(
	localX: number,
	localY: number,
	halfWidth: number,
	halfHeight: number,
	circleRadius: number,
): { localNormal: Vector; depth: number } {
	const distToRight = halfWidth - localX;
	const distToLeft = halfWidth + localX;
	const distToBottom = halfHeight - localY;
	const distToTop = halfHeight + localY;
	const minEdgeDist = Math.min(distToRight, distToLeft, distToBottom, distToTop);

	let localNormal: Vector;
	if (minEdgeDist === distToRight) {
		localNormal = new Vector(1, 0);
	} else if (minEdgeDist === distToLeft) {
		localNormal = new Vector(-1, 0);
	} else if (minEdgeDist === distToBottom) {
		localNormal = new Vector(0, 1);
	} else {
		localNormal = new Vector(0, -1);
	}

	return { localNormal, depth: minEdgeDist + circleRadius };
}

function calculateOutsideCollision(
	localX: number,
	localY: number,
	closestX: number,
	closestY: number,
	circleRadius: number,
): { localNormal: Vector; depth: number } | null {
	const diffX = localX - closestX;
	const diffY = localY - closestY;
	const distanceSq = diffX * diffX + diffY * diffY;

	if (distanceSq > circleRadius * circleRadius) return null;

	const distance = Math.sqrt(distanceSq);
	if (distance === 0) return null;

	return {
		localNormal: new Vector(diffX / distance, diffY / distance),
		depth: circleRadius - distance,
	};
}

function transformToWorldSpace(
	localNormal: Vector,
	closestX: number,
	closestY: number,
	obbCenter: ICoordinates,
	rotation: number,
	depth: number,
): CollisionResult {
	const cosWorld = Math.cos(rotation);
	const sinWorld = Math.sin(rotation);

	return {
		normal: new Vector(
			localNormal.x * cosWorld - localNormal.y * sinWorld,
			localNormal.x * sinWorld + localNormal.y * cosWorld,
		),
		depth,
		contactPoint: new Vector(
			obbCenter.x + closestX * cosWorld - closestY * sinWorld,
			obbCenter.y + closestX * sinWorld + closestY * cosWorld,
		),
	};
}

// --- Circle vs OBB ---

function circleVsObb(circle: CircleArea, obb: OBBShape): CollisionResult | null {
	const circleCenter = circle.Center;
	const obbCenter = obb.Center;

	const { localX, localY } = transformToObbLocalSpace(circleCenter, obbCenter, obb.Rotation);
	const { closestX, closestY } = findClosestPointOnObb(localX, localY, obb.halfWidth, obb.halfHeight);

	const isInside = closestX === localX && closestY === localY;

	let localNormal: Vector;
	let depth: number;

	if (isInside) {
		const result = calculateInsideCollision(localX, localY, obb.halfWidth, obb.halfHeight, circle.radius);
		localNormal = result.localNormal;
		depth = result.depth;
	} else {
		const result = calculateOutsideCollision(localX, localY, closestX, closestY, circle.radius);
		if (result === null) return null;
		localNormal = result.localNormal;
		depth = result.depth;
	}

	return transformToWorldSpace(localNormal, closestX, closestY, obbCenter, obb.Rotation, depth);
}

// --- OBB vs OBB helpers ---

function findSmallestOverlapAxis(
	separatingAxes: Vector[],
	cornersA: Vector[],
	cornersB: Vector[],
): { smallestOverlap: number; smallestOverlapAxis: Vector } | null {
	let smallestOverlap = Infinity;
	let smallestOverlapAxis: Vector = separatingAxes[0];

	for (let i = 0; i < separatingAxes.length; i++) {
		const axis = separatingAxes[i];
		const overlap = overlapOnAxis(axis, cornersA, cornersB);
		if (overlap === 0) return null;
		if (overlap < smallestOverlap) {
			smallestOverlap = overlap;
			smallestOverlapAxis = axis;
		}
	}

	return { smallestOverlap, smallestOverlapAxis };
}

// --- OBB vs OBB ---

function obbVsObb(obbA: OBBShape, obbB: OBBShape): CollisionResult | null {
	const cornersA = obbA.GetCorners();
	const cornersB = obbB.GetCorners();
	const separatingAxes = [...obbA.GetAxes(), ...obbB.GetAxes()];

	const result = findSmallestOverlapAxis(separatingAxes, cornersA as Vector[], cornersB as Vector[]);
	if (result === null) return null;

	let { smallestOverlap, smallestOverlapAxis } = result;

	// Ensure normal points from A to B
	const centerDelta = Vector.Subtract(obbB.Center, obbA.Center);
	if (Vector.Dot(centerDelta, smallestOverlapAxis) < 0) {
		smallestOverlapAxis = Vector.MultiplyCoordinates(-1, smallestOverlapAxis);
	}

	return {
		normal: smallestOverlapAxis,
		depth: smallestOverlap,
		contactPoint: Vector.LerpBetween(obbA.Center, obbB.Center, 0.5),
	};
}
