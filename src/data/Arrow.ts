import { BBOX_MARGIN } from "./cfg";
import type { Edge } from "./Edge";
import type { Focusable } from "./Focusable";
import type { Obj } from "./Obj";

export type ArrowStyle = {
    type: "solid" | "dashed";
}

export class Arrow implements Focusable {
    id: string;
    type: "arrow" =  "arrow";
    name: string;
    edge: Edge;
    style: ArrowStyle;

    constructor(name: string, edge: Edge, style?: Partial<ArrowStyle>, id?: string) {
        this.id = id ?? Arrow.generateId();
        this.name = name;
        this.edge = edge
        this.style = { type: "solid" };
        if (style) {
            this.style = { ...this.style, ...style };
        }
    }

    get domain(): Obj {
        return this.edge.domain;
    } 

    get codomain(): Obj {
        return this.edge.codomain;
    }

    delete() {
        this.edge.arrows = this.edge.arrows.filter(a => a.id !== this.id);
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

    static generateId(prefix = "arrow-"){
        return prefix + Math.random().toString(36).slice(2, 9);
    }
}



            