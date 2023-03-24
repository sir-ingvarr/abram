// import {AnyFunc} from '../../types/common';
//
// class CursorInputSystem {
// 	static Keys = new Set();
// 	static Events: Map<string, Array<AnyFunc>> = new Map();
// 	static EventsOnce: Map<string, Array<AnyFunc>> = new Map();
//
// 	static KeyPressed (key: string): boolean {
// 		return this.Keys.has(key);
// 	}
//
// 	static SetPressedKey (key: string): void {
// 		if(InputSystem.Keys.has(key)) return;
// 		this.Keys.add(key);
// 	}
//
// 	static HandleEvents (key: string): void {
// 		const permanentListeners = InputSystem.Events.get(key) || [];
// 		const tempListeners = InputSystem.EventsOnce.get(key) || [];
// 		permanentListeners.forEach(handler => handler());
// 		tempListeners.forEach(handler => handler());
// 		InputSystem.EventsOnce.delete(key);
// 	}
//
// 	static AddEventListener (key: string, handler: AnyFunc, once = false): void {
// 		const collection = once ? InputSystem.EventsOnce : InputSystem.Events;
// 		const handlersList = collection.get(key) || [];
// 		collection.set(key, handlersList.concat(handler));
// 	}
//
// 	static RemovePressedKey (key: string): void {
// 		this.Keys.delete(key);
// 	}
//
// 	static SetEventListeners (): void {
// 		document.addEventListener('keydown', e => {
// 			e.preventDefault();
// 			InputSystem.SetPressedKey(e.code);
// 		});
// 		document.addEventListener('keyup', e => {
// 			e.preventDefault();
// 			InputSystem.RemovePressedKey(e.code);
// 		});
// 	}
// }
//
// export default CursorInputSystem;