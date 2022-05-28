import {LinesShape} from "./Primitive";
import {LineOptions} from "../../types/primitives";
import {Point, RGBAColor, Segment} from "../Classes";

export class DebugGrid {
    public lines: LinesShape;

    constructor(width: number, height: number, resolution: number) {
        if (resolution < 10) return;
        const segments = [];

        const debugGridOpts: LineOptions = {
            strokeStyle: new RGBAColor(255, 0, 0, 255).toString(),
            lineWidth: 1,
            dash: [1,2,2],
        }
        for (let pos = resolution; pos <= height; pos += resolution) {
            const segment = this.CreateSegment(0, pos, width, pos);
            segments.push(segment);
        }
        for (let pos = resolution; pos <= width; pos += resolution) {
            const segment = this.CreateSegment(pos, 0, pos, height);
            segments.push(segment);
        }
        this.lines = new LinesShape(segments, debugGridOpts)
    }

    CreateSegment(x1: number, y1: number, x2: number, y2: number) {
        const from = new Point(x1, y1);
        const to = new Point(x2, y2);
        return new Segment(from, to);
    }
}