import {AnyFunc} from '../../types/common';
import {Vector} from '../Classes';
import Camera from '../Modules/Camera';

export enum MouseButton {
	Left = 0,
	Middle = 1,
	Right = 2,
}

export type MouseEventName =
	| 'mousedown' | 'mouseup' | 'mousemove'
	| 'click' | 'dblclick'
	| 'wheel'
	| 'mouseenter' | 'mouseleave';

export type CursorEventHandler = AnyFunc<void>;

class CursorInputSystem {
	private static buttons = new Set<number>();
	private static buttonsDown = new Set<number>();
	private static buttonsUp = new Set<number>();

	private static canvasPosition: Vector = Vector.ZeroMutable;
	private static canvasWidth = 0;
	private static canvasHeight = 0;

	private static scrollDelta = 0;

	private static events: Map<MouseEventName, Array<CursorEventHandler>> = new Map();
	private static eventsOnce: Map<MouseEventName, Array<CursorEventHandler>> = new Map();

	static get CanvasPosition(): Vector {
		return CursorInputSystem.canvasPosition.Copy();
	}

	static get WorldPosition(): Vector {
		const screen = CursorInputSystem.canvasPosition;
		const camera = Camera.GetInstance({});
		const camPos = camera.Position;
		const camScale = camera.Scale;
		const centerX = CursorInputSystem.canvasWidth / 2;
		const centerY = CursorInputSystem.canvasHeight / 2;
		return new Vector(
			(screen.x - centerX) / camScale.x + centerX + camPos.x,
			(screen.y - centerY) / camScale.y + centerY + camPos.y,
		);
	}

	static get ScrollDelta(): number {
		return CursorInputSystem.scrollDelta;
	}

	static ButtonHeld(button: MouseButton): boolean {
		return CursorInputSystem.buttons.has(button);
	}

	static ButtonDown(button: MouseButton): boolean {
		return CursorInputSystem.buttonsDown.has(button);
	}

	static ButtonUp(button: MouseButton): boolean {
		return CursorInputSystem.buttonsUp.has(button);
	}

	static AddEventListener(event: MouseEventName, handler: CursorEventHandler, once = false): void {
		const collection = once ? CursorInputSystem.eventsOnce : CursorInputSystem.events;
		const handlers = collection.get(event) || [];
		collection.set(event, handlers.concat(handler));
	}

	static RemoveEventListener(event: MouseEventName, handler: CursorEventHandler): void {
		const handlers = CursorInputSystem.events.get(event);
		if(!handlers) return;
		CursorInputSystem.events.set(event, handlers.filter(h => h !== handler));
	}

	/** Clear all event listeners (for scene transitions). */
	static ClearEventListeners(): void {
		CursorInputSystem.events.clear();
		CursorInputSystem.eventsOnce.clear();
		CursorInputSystem.buttons.clear();
		CursorInputSystem.buttonsDown.clear();
		CursorInputSystem.buttonsUp.clear();
		CursorInputSystem.scrollDelta = 0;
	}

	/** Called at the end of each frame to clear per-frame state. */
	static FrameCleanup(): void {
		CursorInputSystem.buttonsDown.clear();
		CursorInputSystem.buttonsUp.clear();
		CursorInputSystem.scrollDelta = 0;
	}

	private static handleEvent(name: MouseEventName): void {
		const permanent = CursorInputSystem.events.get(name) || [];
		const temp = CursorInputSystem.eventsOnce.get(name) || [];
		for(const handler of permanent) handler();
		for(const handler of temp) handler();
		CursorInputSystem.eventsOnce.delete(name);
	}

	private static updatePosition(e: MouseEvent, canvas: HTMLCanvasElement): void {
		const rect = canvas.getBoundingClientRect();
		CursorInputSystem.canvasPosition.x = e.clientX - rect.left;
		CursorInputSystem.canvasPosition.y = e.clientY - rect.top;
	}

	static SetEventListeners(canvas: HTMLCanvasElement): void {
		CursorInputSystem.canvasWidth = canvas.width;
		CursorInputSystem.canvasHeight = canvas.height;

		canvas.addEventListener('mousedown', e => {
			CursorInputSystem.updatePosition(e, canvas);
			CursorInputSystem.buttons.add(e.button);
			CursorInputSystem.buttonsDown.add(e.button);
			CursorInputSystem.handleEvent('mousedown');
		});

		canvas.addEventListener('mouseup', e => {
			CursorInputSystem.updatePosition(e, canvas);
			CursorInputSystem.buttons.delete(e.button);
			CursorInputSystem.buttonsUp.add(e.button);
			CursorInputSystem.handleEvent('mouseup');
		});

		canvas.addEventListener('mousemove', e => {
			CursorInputSystem.updatePosition(e, canvas);
			CursorInputSystem.handleEvent('mousemove');
		});

		canvas.addEventListener('click', e => {
			CursorInputSystem.updatePosition(e, canvas);
			CursorInputSystem.handleEvent('click');
		});

		canvas.addEventListener('dblclick', e => {
			CursorInputSystem.updatePosition(e, canvas);
			CursorInputSystem.handleEvent('dblclick');
		});

		canvas.addEventListener('wheel', e => {
			e.preventDefault();
			CursorInputSystem.scrollDelta = e.deltaY;
			CursorInputSystem.handleEvent('wheel');
		}, { passive: false });

		canvas.addEventListener('mouseenter', () => {
			CursorInputSystem.handleEvent('mouseenter');
		});

		canvas.addEventListener('mouseleave', () => {
			CursorInputSystem.buttons.clear();
			CursorInputSystem.handleEvent('mouseleave');
		});

		canvas.addEventListener('contextmenu', e => {
			e.preventDefault();
		});
	}
}

export default CursorInputSystem;
