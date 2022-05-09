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
    /**
     * Ensures value falls into the range
     *
     * @param {number} val value to put into borders
     * @param {number} min lower range of the value
     * @param {number} max upper range of the value
     * @return {number}
     */
    static Clamp(val, min, max) {
        if(val < min) return min;
        else if(val > max) return max;
        return val;
    }

    /**
     * Interpolates between to values depending on the factor
     *
     * @param {number} from beginning of the interpolation
     * @param {number} to end of the interpolation
     * @param {number} factor midrange value
     * @return {number}
     */
    static LinearLerp(from, to, factor = 0) {
        return from + (to - from) * factor;
    }


    /**
     * Returns a random value in the specified range
     *
     * @param {number} from range border
     * @param {number} to range border
     * @return {number}
     */
    static RandomRange(from, to) {
        return this.LinearLerp(from, to, Math.random());
    }
}

class RGBAColor {
    constructor(r = 0, g = 0, b = 0, a = 255, onUpdated = () => {}) {
        this.OnUpdated = onUpdated;
        this.color = {r,g,b,a};
    }

    set color ({r = this.red, g = this.green, b = this.blue, a = this.alpha}) {
        this.red = this.Clamp(r);
        this.green = this.Clamp(g);
        this.blue = this.Clamp(b);
        this.alpha = this.Clamp(a);
        this.updateHex();
    }

    static FromHex(hex) {
        if(!/[0-9A-F]{6}/i.test(hex)) throw 'invalid hex format';
        try {
            const red = parseInt(hex.slice(1, 3), 16);
            const green = parseInt(hex.slice(3, 5), 16);
            const blue = parseInt(hex.slice(5, 7), 16);
            const alpha = parseInt(hex.slice(7, 9), 16);
            return new RGBAColor(
                red, green, blue,
                Number.isNaN(alpha) ? 255 : alpha
            )
        } catch (e) {
            console.error(e);
        }
    }

    Clamp (val) {
        return Maths.Clamp(val, 0, 255);
    }

    set Red (val) {
        this.red = this.Clamp(val);
        this.updateHex();
    }

    set Green (val) {
        this.green = this.Clamp(val);
        this.updateHex();
    }

    set Blue (val) {
        this.blue = this.Clamp(val);
        this.updateHex();
    }

    set Alpha (val) {
        this.alpha = this.Clamp(val);
        this.updateHex();
    }

    updateHex () {
        this.colorHex = this.RgbToHex();
        this.OnUpdated(this);
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

    /**
     * Calculate a gradient between this and the specified colors
     *
     * @param {RGBAColor} color which color smoothly transform to
     * @param {number} factor interpolation factor
     * @return {RGBAColor}
     */
    LerpTo(color, factor) {
        if(!color instanceof RGBAColor) throw 'should be an instance of RGBAColor class';
        return new RGBAColor(
            Math.round(Maths.LinearLerp(this.red, color.red, factor)),
            Math.round(Maths.LinearLerp(this.green, color.green, factor)),
            Math.round(Maths.LinearLerp(this.blue, color.blue, factor)),
            Math.round(Maths.LinearLerp(this.alpha, color.alpha, factor)),
        );
    }
}
