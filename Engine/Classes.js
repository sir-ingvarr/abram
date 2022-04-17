class Vector {
    constructor(x = 0, y = 0, resolution = 1) {
        this.x = x;
        this.y = y;
        this._resolution = resolution;
    }

    ApplyResolution(newResolution) {
        this._resolution = newResolution;
        this.MoveTo(this.x, this.y);
    }

    MoveTo (newX, newY) {
        this.x = newX * this._resolution;
        this.y = newY * this._resolution;
    }

    Translate (x = 0, y = 0) {
        this.x += x * this._resolution;
        this.y += y * this._resolution;
    }

    Rotate (deg) {

    }
}

class Maths {
    static Clamp(val, min, max) {
        if(val < min) return min;
        if(val > max) return max;
        return val;
    }
}

class RGBAColor {
    constructor(r,g,b,a = 255) {
        this.color = {r,g,b,a};
    }

    set color ({r,g = this.green,b = this.blue,a = this.alpha}) {
        this.red = Maths.Clamp(r, 0, 255);
        this.green = Maths.Clamp(g, 0, 255);
        this.blue = Maths.Clamp(b, 0, 255);
        this.alpha = Maths.Clamp(a, 0, 255);
        this.colorHex = this.RgbToHex(r,b,g,a);
    }

    valueOf() {
        return this.colorHex;
    }

    toString() {
        return this.colorHex;
    }

    ComponentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }

    RgbToHex() {
        return `#${this.ComponentToHex(this.red)}${this.ComponentToHex(this.green)}${this.ComponentToHex(this.blue)}${this.ComponentToHex(this.alpha)}`;
    }
}
