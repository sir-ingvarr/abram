export type Cap = 'butt' | 'round' | 'square';
export type Join = 'round' | 'bevel' | 'miter';
export type TextAlign = 'start' | 'end' | 'left' | 'right' | 'center';
export type TextBaseline = 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
export type TextDirection = 'ltr' | 'rtl' | 'inherit';

export interface StrokeOptions {
    lineWidth?: number;
    strokeStyle?: string;
    lineCap?: Cap;
    lineJoin?: Join;
    dash?: Array<number>;
    dashOffset?: number;
}

export interface ShadowOptions {
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    shadowColor?: string;
}

export interface FillOptions {
    fillStyle?: string;
}

export interface TextOptions {
    font?: string;
    textAlign?: TextAlign;
    textBaseline?: TextBaseline;
    direction?: TextDirection;
}

export interface OtherOptions {
    contextRespectivePosition?: boolean,
}

export type CtxOptions = StrokeOptions & ShadowOptions & FillOptions & TextOptions & OtherOptions;

export interface LineOptions extends StrokeOptions, ShadowOptions {}
