import {IBasicObject, IGameObject, IExecutable} from '../../types/GameObject';
import CanvasContext2D from '../Canvas/Context2d';

abstract class Module implements IExecutable {
	protected readonly id: string;
	name: string;
	active = true;
	gameObject: IBasicObject;
	public context?: CanvasContext2D;

	constructor(params: {name?: string}) {
		this.id = this.GenerateId(params.name || this.constructor.name);
	}

	get Id() {
		return this.id;
	}

	set Active(value: boolean) {
		this.active = value;
	}

	get Active(): boolean {
		return this.active;
	}

	get Context() {
		return this.context || this.gameObject.Context;
	}

	GenerateId(name: string) {
		return name + Date.now() + Math.random();
	}

	SetGameObject(gameObject: IGameObject) {
		this.gameObject = gameObject;
	}

	Start() { return; }

	Update() { return; }

	Destroy() { return; }
}

export default Module;
