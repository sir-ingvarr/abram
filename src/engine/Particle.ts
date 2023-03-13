import BasicObject from "./BasicObject";
import {Dictionary} from "../types/common";
import Sprite from "./Modules/Sprite";
import {Time} from "../index";
import {RGBAColor, Vector} from "./Classes";

class Particle extends BasicObject {
    private sprite: Sprite;
    private initialSize: number;
    public age: number;
    public lifetime: number;
    public initialColor: RGBAColor;
    public color: RGBAColor;
    public velocity: Vector;

    constructor(params: Dictionary) {
        super(params);
        this.sprite = params.sprite || null;
        this.lifetime = params.lifeTime;
        this.initialColor = params.color?.Copy();
        this.color = params.color?.Copy();
        this.age = 0;
        this.initialSize = params.initialSize;
        this.velocity = params.initialVelocity?.Copy();
        if(this.sprite) this.sprite.gameObject = this;
    }

    SetSize(factor: number) {
        this.sprite.SetSize(this.initialSize * factor, this.initialSize * factor);
    }

    Update() {
        super.Update();
        this.age += Time.deltaTime;
        if(this.age > this.lifetime) return this.Destroy();
        this.transform.LocalPosition = this.transform.LocalPosition.Add(Vector.MultiplyCoordinates(Time.deltaTime / 1000, this.velocity));
        this.sprite.Update();
    }
}

export default Particle;