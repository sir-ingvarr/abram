import {IExecutable} from '../../types/GameObject';
import {AnyFunc, Dictionary} from '../../types/common';
import Module from './Module';

class EventEmitterModule extends Module implements IExecutable {
	protected eventsListeners: Dictionary<Set<(...args: any) => void>>;

	constructor(params: {name?: string}) {
		super({ name: params.name || 'EventEmitterModule' });
		this.eventsListeners = {};
	}

	On(event: string | number, callback: AnyFunc): void {
		if(!this.eventsListeners[event]) this.eventsListeners[event] = new Set<(self: IExecutable, ...args: any) => void>();
		this.eventsListeners[event].add(callback);
	}

	Emit<T = any>(event: string | number, ...args: Array<T>): void {
		const handlers = this.eventsListeners[event];
		if(!handlers || !handlers.size) return;
		for(const handler of handlers) {
			handler(...args);
		}
	}

	RemoveEventListener(event: string | number, callback: AnyFunc): void {
		const handlers = this.eventsListeners[event];
		if(!handlers || !handlers.size) return;
		handlers.delete(callback);
	}

}

export default EventEmitterModule;
