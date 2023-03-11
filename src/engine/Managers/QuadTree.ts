import {IGameObject} from "../../types/GameObject";
import {ICoordinates, Nullable} from "../../types/common";
import {Point} from "../Classes";

interface quadProps {
    width: number;
    height: number;
    initialElements?: Array<IGameObject>;
    topLeftPoint: ICoordinates;
    parent?: Quad;
    maxCapacity?: number;
}

class Quad {
    private nw: Nullable<Quad>;
    private ne: Nullable<Quad>;
    private sw: Nullable<Quad>;
    private se: Nullable<Quad>;
    
    private parent: Nullable<Quad>;
    private width: number;
    private height: number;
    private topLeftPointPoint: ICoordinates;
    private elements: Array<IGameObject>;


    constructor(props: quadProps) {
        const { width, height, initialElements = [], topLeftPoint = new Point(), parent, maxCapacity = 5 } = props;
        if(!parent) this.SubDivide(initialElements);
        else {
            this.parent = parent;
        }
    }
    
    public SubDivide(elements: Array<IGameObject> = []) {
        const halfWidth = this.width / 2;
        const halfHeight =  this.height / 2;
        
        // top-left sub-quad
        this.nw = new Quad({ 
            initialElements: elements, 
            width: halfWidth, height:  halfHeight,
            topLeftPoint: new Point(this.topLeftPointPoint.x, this.topLeftPointPoint.y)
        });

        // top-right sub-quad
        this.ne = new Quad({
            initialElements: elements,
            width: halfWidth, height:  halfHeight,
            topLeftPoint: new Point(this.topLeftPointPoint.x + halfWidth, this.topLeftPointPoint.y)
        });

        // bottom-left sub-quad
        this.sw = new Quad({
            initialElements: elements,
            width: halfWidth, height:  halfHeight,
            topLeftPoint: new Point(this.topLeftPointPoint.x, this.topLeftPointPoint.y + halfHeight)
        });

        // bottom-right sub-quad
        this.se = new Quad({
            initialElements: elements,
            width: halfWidth, height:  halfHeight,
            topLeftPoint: new Point(this.topLeftPointPoint.x + halfWidth, this.topLeftPointPoint.y + halfHeight)
        });
    }

    public ContainsPoint(point: ICoordinates): boolean {
        if(this.topLeftPointPoint.x > point.x) return false;
        if(this.topLeftPointPoint.y > point.y) return false;
        if(this.topLeftPointPoint.x + this.width < point.x) return false;
        return this.topLeftPointPoint.y + this.height >= point.y;
    }

    public Insert(gameObject: IGameObject): boolean {
        if(!this.ContainsPoint(gameObject.transform.WorldPosition)) return false;
        if(!this.nw) {
            this.elements.push(gameObject);
            return true;
        }
        if(this.nw.Insert(gameObject)) return true;
        if(this.ne?.Insert(gameObject)) return true;
        if(this.sw?.Insert(gameObject)) return true;
        if(this.se?.Insert(gameObject)) return true;
        return false;
    }
}