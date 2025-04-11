import {IGameObject, IExecutable} from '../../types/GameObject';
import CanvasContext2D from '../Canvas/Context2d';

export type ModuleConstructorParams = {
	name?: string,
	active?: boolean,
	gameObject?: IGameObject,
	context?: CanvasContext2D,
}

abstract class Module implements IExecutable {
	protected readonly id: string;
	protected _startExecuted: boolean;
	protected _isAwaitingDestroy: boolean;
	public name: string;
	public active: boolean;
	public gameObject?: IGameObject;
	public context?: CanvasContext2D;

	protected constructor(params: ModuleConstructorParams) {
		this.name = params.name || this.constructor.name;
		this.active = params.active !== false;
		this.gameObject = params.gameObject;
		this.context = params.context;
		this.id = this.GenerateId(this.name);
		this._startExecuted = false;
		this._isAwaitingDestroy = false;
	}

	get Id() {
		return this.id;
	}

	get StartExecuted(): boolean {
		return this._startExecuted;
	}

	get IsWaitingDestroy(): boolean {
		return this._isAwaitingDestroy;
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
		return name + performance.now() + Math.random();
	}

	SetGameObject(gameObject: IGameObject) {
		this.gameObject = gameObject;
	}

	Start() {
		if (this._startExecuted) return;
		this._isAwaitingDestroy = false;
		this._startExecuted = true;
		return;
	}

	Update() { return; }

	Destroy() {
		if(this._isAwaitingDestroy) return;
		this._isAwaitingDestroy = true;
		this._startExecuted = false;
		return;
	}
}

export default Module;
