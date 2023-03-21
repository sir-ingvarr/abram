import {Point, Vector} from "../Classes";
import CanvasContext2D from "../Canvas/Context2d";
import {ICoordinates} from "../../types/common";

class Camera {
    private centerX: number;
    private centerY: number;

    constructor(
        private ctx: CanvasContext2D,
        clientWidth: number,
        clientHeight: number,
        private position: Vector = new Vector(0,0),
        private scale: ICoordinates = new Point(1, 1),
    ) {
        this.ResetCenterPoint(clientWidth, clientHeight);
    }

    ResetCenterPoint(width: number, height?: number) {
        this.centerX = width / 2;
        if(height) this.centerY = height / 2;
    }

    CenterTo(pos: ICoordinates): void {
        this.position = new Vector(this.centerX - pos.x, this.centerY - pos.y);
        this.ctx.SetPosition(this.position.x, this.position.y);
    }

    SetScale(scale: ICoordinates = new Point(1, 1)) {
        this.ctx.SetScale(scale.x, scale.y);
    }
}

export default Camera;
