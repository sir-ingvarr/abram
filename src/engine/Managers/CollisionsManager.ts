import {ExecutableManager} from './ExecutableManager';
import {ICollider2D} from '../../types/GameObject';
import Collider2D, {Collider2DEvent} from '../Modules/Collider';

class CollisionsManager extends ExecutableManager {
	protected override readonly modules: Map<string, ICollider2D>;
	private static instance: CollisionsManager;

	constructor(params: { modules: Array<ICollider2D> }) {
		super(params);
		CollisionsManager.instance = this;
	}

	public static GetInstance(): CollisionsManager {
		if(!CollisionsManager.instance) {
			return new CollisionsManager({ modules: [] });
		}
		return CollisionsManager.instance;
	}

	override RegisterModule(module: Collider2D): string {
		super.RegisterModule(module);
		module.On(Collider2DEvent.Destroy, () => this.UnregisterModuleById(module.Id));
		return module.Id;
	}

	override Update() {
		super.Update();
		const arr = Array.from(this.modules);
		for(let i = 0; i < arr.length; i++) {
			const collider1 = arr[i][1];
			if(!collider1.parent?.gameObject.active) continue;
			for(let j = i; j < arr.length; j++) {
				const collider2 = arr[j][1];
				if(!collider2.parent?.gameObject.active) continue;
				if(collider1.shape.IsIntersectingOther(collider2.shape)) {
					collider1.Collide(collider2);
					collider2.Collide(collider1);
				}
			}
		}
	}

}

export default CollisionsManager;
