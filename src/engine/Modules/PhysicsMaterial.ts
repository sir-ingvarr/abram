import {Nullable} from '../../types/common';

export type PhysicsMaterialParams = {
	friction?: number,
	bounciness?: number,
	density?: number,
}

class PhysicsMaterial {
	public friction: number;
	public bounciness: Nullable<number>;
	public density: Nullable<number>;

	// 100 pixels = 1 meter
	static PixelsPerMeter = 100;

	constructor(params: PhysicsMaterialParams = {}) {
		const { friction = 0.4, bounciness = null, density = null } = params;
		this.friction = friction;
		this.bounciness = bounciness;
		this.density = density;
	}

	static CombineFriction(materialA: Nullable<PhysicsMaterial>, materialB: Nullable<PhysicsMaterial>): number {
		const frictionA = materialA?.friction ?? 0;
		const frictionB = materialB?.friction ?? 0;
		return Math.sqrt(frictionA * frictionB);
	}

	static CombineBounciness(
		materialA: Nullable<PhysicsMaterial>, defaultBouncinessA: number,
		materialB: Nullable<PhysicsMaterial>, defaultBouncinessB: number,
	): number {
		const bouncinessA = materialA?.bounciness ?? defaultBouncinessA;
		const bouncinessB = materialB?.bounciness ?? defaultBouncinessB;
		return (bouncinessA + bouncinessB) / 2;
	}

	static CalculateMassFromDensity(density: number, colliderAreaPixels: number): number {
		const scale = PhysicsMaterial.PixelsPerMeter;
		const areaMeters = colliderAreaPixels / (scale * scale);
		return density * areaMeters;
	}
}

export default PhysicsMaterial;
