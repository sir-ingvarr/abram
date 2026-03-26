import {IExecutable} from '../../types/GameObject';
import {AnyFunc, Dictionary} from '../../types/common';
import Module from './Module';

class EventEmitterModule extends Module implements IExecutable {
	protected eventsListeners: Dictionary<Set<AnyFunc>>;

	constructor(params: {name?: string}) {
		super({ name: params.name || 'EventEmitterModule' });
		this.eventsListeners = {};
	}

	On(event: string | number, callback: AnyFunc): void {
		if(!this.eventsListeners[event]) this.eventsListeners[event] = new Set<AnyFunc>();
		this.eventsListeners[event].add(callback);
	}

	Once(event: string | number, callback: AnyFunc): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const wrapper = (...args: any[]) => {
			callback(this, ...args);
			this.RemoveEventListener(event, wrapper);
		};
		this.On(event, wrapper);
	}

	Emit(event: string | number, ...args: unknown[]): void {
		const handlers = this.eventsListeners[event];
		if(!handlers || !handlers.size) return;
		for(const handler of handlers) {
			handler(this, ...args);
		}
	}

	RemoveEventListener(event: string | number, callback: AnyFunc): void {
		const handlers = this.eventsListeners[event];
		if(!handlers || !handlers.size) return;
		handlers.delete(callback);
	}

}

export default EventEmitterModule;
