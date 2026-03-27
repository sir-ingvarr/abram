import {Vector, RGBAColor} from '../Classes';
import {ICoordinates} from '../../types/common';
import Time from '../Globals/Time';
import Camera from '../Modules/Camera';
import CanvasContext2D from '../Canvas/Context2d';

export enum LogLevel {
	None = 0,
	Error = 1,
	Warn = 2,
	Info = 3,
}

interface IGizmoEntry {
	type: 'line' | 'circle';
	color: string;
	remainingMs: number;
	persistent: boolean;
	fromX?: number;
	fromY?: number;
	toX?: number;
	toY?: number;
	centerX?: number;
	centerY?: number;
	radius?: number;
}

interface IScreenDrawCommand {
	type: 'text' | 'rect';
	x: number;
	y: number;
	color: string;
	text?: string;
	font?: string;
	width?: number;
	height?: number;
	fill: boolean;
	remainingMs: number;
	persistent: boolean;
}

class Debug {
	static readonly Colors = {
		collider: new RGBAColor(0, 200, 0),
		spriteBounds: new RGBAColor(255, 100, 200),
		anchorPoint: new RGBAColor(255, 100, 200),
		contactPoint: new RGBAColor(255, 255, 0),
		ray: new RGBAColor(0, 255, 0),
	};

	private static gizmos: IGizmoEntry[] = [];
	private static screenCommands: IScreenDrawCommand[] = [];
	private static logLevel: LogLevel = LogLevel.Info;
	private static enabled = false;
	private static context: CanvasContext2D | null = null;

	static get Enabled(): boolean {
		return Debug.enabled;
	}

	static set Enabled(value: boolean) {
		Debug.enabled = value;
	}

	static get Level(): LogLevel {
		return Debug.logLevel;
	}

	static set Level(value: LogLevel) {
		Debug.logLevel = value;
	}

	static SetContext(ctx: CanvasContext2D) {
		Debug.context = ctx;
	}

	// --- Logging ---

	static Log(...args: unknown[]) {
		if(Debug.logLevel >= LogLevel.Info) console.log('[ABRAM]', ...args);
	}

	static Warn(...args: unknown[]) {
		if(Debug.logLevel >= LogLevel.Warn) console.warn('[ABRAM]', ...args);
	}

	static Error(...args: unknown[]) {
		if(Debug.logLevel >= LogLevel.Error) console.error('[ABRAM]', ...args);
	}

	// --- World-space gizmos ---

	static DrawLine(from: ICoordinates, to: ICoordinates, color?: RGBAColor, durationMs = 0) {
		if(!Debug.enabled) return;
		Debug.gizmos.push({
			type: 'line',
			color: (color || new RGBAColor(0, 255, 0)).ToHex(),
			fromX: from.x, fromY: from.y,
			toX: to.x, toY: to.y,
			remainingMs: durationMs, persistent: durationMs > 0,
		});
	}

	static DrawRay(origin: ICoordinates, direction: ICoordinates, length = 100, color?: RGBAColor, durationMs = 0) {
		const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
		if(magnitude === 0) return;
		const end = new Vector(
			origin.x + (direction.x / magnitude) * length,
			origin.y + (direction.y / magnitude) * length,
		);
		Debug.DrawLine(origin, end, color, durationMs);
	}

	static DrawCircle(center: ICoordinates, radius: number, color?: RGBAColor, durationMs = 0) {
		if(!Debug.enabled) return;
		Debug.gizmos.push({
			type: 'circle',
			color: (color || new RGBAColor(0, 255, 0)).ToHex(),
			centerX: center.x, centerY: center.y,
			radius,
			remainingMs: durationMs, persistent: durationMs > 0,
		});
	}

	// --- Screen-space drawing ---

	static DrawRect(x: number, y: number, width: number, height: number, color?: RGBAColor, fill = true, durationMs = 0) {
		if(!Debug.enabled) return;
		Debug.screenCommands.push({
			type: 'rect', x, y, width, height,
			color: (color || new RGBAColor(0, 255, 0)).ToHex(), fill,
			remainingMs: durationMs, persistent: durationMs > 0,
		});
	}

	static DrawText(text: string, x: number, y: number, color?: RGBAColor, font = '14px monospace', durationMs = 0) {
		if(!Debug.enabled) return;
		Debug.screenCommands.push({
			type: 'text', x, y, text, font,
			color: (color || new RGBAColor(255, 255, 255)).ToHex(), fill: true,
			remainingMs: durationMs, persistent: durationMs > 0,
		});
	}

	static DrawFps(fps: number, frameTime: number, canvasWidth: number) {
		if(!Debug.context) return;
		const ctx = Debug.context;
		ctx.Reset();
		const fpsX = canvasWidth - 100;
		ctx.FillStyle('#ffffff').FillRect(fpsX, 0, 100, 40);
		ctx.Font('12px monospace')
			.FillStyle('#ff0000')
			.FillText(`frame time: ${frameTime}`, fpsX + 5, 15)
			.FillText(`FPS: ${Math.floor(fps)}`, fpsX + 5, 30);
	}

	// --- Update ---

	static Update() {
		if(!Debug.enabled || !Debug.context) return;
		Debug.drawGizmos();
		Debug.drawScreenCommands();
	}

	private static drawGizmos() {
		if(Debug.gizmos.length === 0) return;
		const ctx = Debug.context!.CTX;
		const camera = Camera.GetInstance({});
		const cameraPos = camera.Position;
		const cameraScale = camera.Scale;
		const canvasWidth = Debug.context!.Width;
		const canvasHeight = Debug.context!.Height;
		const centerX = canvasWidth / 2;
		const centerY = canvasHeight / 2;

		ctx.save();
		ctx.resetTransform();
		// Apply camera: translate to center, scale, translate back, offset by camera position
		ctx.translate(centerX, centerY);
		ctx.scale(cameraScale.x, cameraScale.y);
		ctx.translate(-centerX, -centerY);
		ctx.translate(-cameraPos.x, -cameraPos.y);

		ctx.lineWidth = 1;

		const stillAlive: IGizmoEntry[] = [];

		for(const gizmo of Debug.gizmos) {
			ctx.strokeStyle = gizmo.color;
			ctx.beginPath();

			if(gizmo.type === 'line') {
				ctx.moveTo(gizmo.fromX!, gizmo.fromY!);
				ctx.lineTo(gizmo.toX!, gizmo.toY!);
				ctx.stroke();
			} else if(gizmo.type === 'circle') {
				ctx.arc(gizmo.centerX!, gizmo.centerY!, gizmo.radius!, 0, Math.PI * 2);
				ctx.stroke();
			}

			if(gizmo.persistent) {
				gizmo.remainingMs -= Time.deltaTime;
				if(gizmo.remainingMs > 0) stillAlive.push(gizmo);
			}
		}

		ctx.restore();
		Debug.gizmos = stillAlive;
	}

	private static drawScreenCommands() {
		if(Debug.screenCommands.length === 0) return;
		const ctx = Debug.context!;
		ctx.Reset();

		const stillAlive: IScreenDrawCommand[] = [];

		for(const command of Debug.screenCommands) {
			if(command.type === 'rect') {
				if(command.fill) {
					ctx.FillStyle(command.color).FillRect(command.x, command.y, command.width!, command.height!);
				} else {
					ctx.StrokeStyle(command.color).StrokeRect(command.x, command.y, command.width!, command.height!);
				}
			} else if(command.type === 'text') {
				ctx.Font(command.font!).FillStyle(command.color).FillText(command.text!, command.x, command.y);
			}
			if(command.persistent) {
				command.remainingMs -= Time.deltaTime;
				if(command.remainingMs > 0) stillAlive.push(command);
			}
		}

		Debug.screenCommands = stillAlive;
	}

	static Clear() {
		Debug.gizmos = [];
		Debug.screenCommands = [];
	}
}

export default Debug;
