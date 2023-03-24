import {IBasicObject, IGameObject, IExecutable} from '../../types/GameObject';
import CanvasContext2D from '../Canvas/Context2d';

export type ModuleConstructorParams = {
	name?: string,
	active?: boolean,
	gameObject?: IBasicObject,
	context?: CanvasContext2D,
}

abstract class Module implements IExecutable {
	protected readonly id: string;
	public name: string;
	public active: boolean;
	public gameObject?: IBasicObject;
	public context?: CanvasContext2D;

	constructor(params: ModuleConstructorParams) {
		this.name = params.name || this.constructor.name;
		this.active = params.active !== false;
		this.gameObject = params.gameObject;
		this.context = params.context;
		this.id = this.GenerateId(this.name);
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
		return this.context || this.gameObject?.Context;
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
