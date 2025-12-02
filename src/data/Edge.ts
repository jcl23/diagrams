import { Arrow, type ArrowStyle } from "./Arrow";
import { BBOX_MARGIN } from "./cfg";
import type { Focusable } from "./Focusable";
import type { Obj } from "./Obj";

export class Edge implements Focusable{
    id: string;
    name: string;
    type: "edge" = "edge";
    domain: Obj;
    codomain: Obj;
    arrows: Arrow[];
    constructor(name: string, from: Obj, to: Obj, arrows: Arrow[] = [], id?: string) {
        this.id = id ?? Edge.generateId();
        this.name = name;
        this.domain = from;
        this.codomain = to;
        this.arrows = arrows;
    }

    getName(): string {
        return this.name;
    }

    setName(newName: string) {
        this.name = newName;
    }

    getPos() {
        const fromPos = this.domain.getPos();
        const toPos = this.codomain.getPos();
        return {
            x: (fromPos.x + toPos.x) / 2,
            y: (fromPos.y + toPos.y) / 2
        };
    }

    getBoundingBox(): any {
        const fromPos = this.domain.getPos();
        const toPos = this.codomain.getPos();
        return {
            xMin: Math.min(fromPos.x, toPos.x) - BBOX_MARGIN,
            yMin: Math.min(fromPos.y, toPos.y) - BBOX_MARGIN,
            xMax: Math.max(fromPos.x, toPos.x) + BBOX_MARGIN,
            yMax: Math.max(fromPos.y, toPos.y) + BBOX_MARGIN
        };
    }

    add(name: string, style?: Partial<ArrowStyle>, id?: string): Arrow{
        const arrow = new Arrow(name, this, style, id);
        this.arrows.push(arrow);
        return arrow;
    }

    delete() {
        this.arrows.forEach(a => a.delete());
        this.domain.removeOutgoing(this);
        this.codomain.removeIncoming(this);
    }

    static generateId(prefix = "edge-"){
        return prefix + Math.random().toString(36).slice(2, 9);
    }
}