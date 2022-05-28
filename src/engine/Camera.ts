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
        private resolution: number,
        private position: Vector = new Vector(0,0, resolution),
        private scale: ICoordinates = new Point(1, 1),
    ) {
        this.baseX = clientWidth / 2;
        this.baseY = clientHeight / 2;
    }

    CenterTo(pos: ICoordinates): void {
        this.position = new Vector(-pos.x + this.baseX, -pos.y + this.baseY, this.resolution);
        this.ctx.SetPosition(this.position);
    }

    SetScale(scale: ICoordinates = new Point(1, 1)) {
        this.scale = new Point(scale.x, scale.y);
        this.ctx.SetScale(scale);
    }
}

export default Camera;
