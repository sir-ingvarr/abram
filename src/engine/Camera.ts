import {Point, Vector} from "./Classes";
import CanvasContext2D from "./Context2d";
import {ICoordinates} from "../types/common";

class Camera {
    private readonly baseX: number;
    private readonly baseY: number;
    constructor(
        private ctx: CanvasContext2D,
        clientWidth: number,
        clientHeight: number,
        private position: Vector = new Vector(0,0),
        private scale: ICoordinates = new Point(1, 1),
    ) {
        this.baseX = clientWidth / 2;
        this.baseY = clientHeight / 2;
    }

    CenterTo(pos: ICoordinates): void {
        this.position = new Vector(this.baseX - pos.x, this.baseY - pos.y);
        this.ctx.SetPosition(this.position);
    }

    SetScale(scale: ICoordinates = new Point(1, 1)) {
        this.scale = new Point(scale.x, scale.y);
        this.ctx.SetScale(scale);
    }
}

export default Camera;
