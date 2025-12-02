import { BBOX_MARGIN } from "./cfg";
import type { Edge } from "./Edge";
import type { Focusable } from "./Focusable";
import type { Point } from "./Point";

export class Obj implements Focusable {
    id: string;
    type: "obj" = "obj";
    private name: string;
    private pos: Point;
    private incoming: Edge[] = [];
    private outgoing: Edge[] = [];

    constructor(name: string, position: Point, id?: string) {
        this.id = id ?? Obj.generateId();
        this.name = name;
        this.pos = position;
    }
    
    
    get incomingEdges(): Edge[] {
        return [...this.incoming];
    }
    get outgoingEdges(): Edge[] {
        return [...this.outgoing];
    }

    addIncoming(edge: Edge) {
        if (edge.codomain.id !== this.id) {
            throw new Error("Edge codomain does not match this object.");
        }
        this.incoming.push(edge);
    }
    addOutgoing(edge: Edge) {
        if (edge.domain.id !== this.id) {
            throw new Error("Edge domain does not match this object.");
        }
        this.outgoing.push(edge);
    }

    removeIncoming(edge: Edge) {
        this.incoming = this.incoming.filter(e => e.id !== edge.id);
    }

    removeOutgoing(edge: Edge) {
        this.outgoing = this.outgoing.filter(e => e.id !== edge.id);
    }

    getName(): string {
        return this.name;
    }

    setName(newName: string) {
        this.name = newName;
    }

    getPos(): Point {
        return { ...this.pos };
    }

    getBoundingBox(): any {
        return {
            xMin: this.pos.x - BBOX_MARGIN,
            yMin: this.pos.y - BBOX_MARGIN,
            xMax: this.pos.x + BBOX_MARGIN,
            yMax: this.pos.y + BBOX_MARGIN
        }
    }

    setPos(x: number, y: number) {
        this.pos = { x, y };
    }

    shiftPos(dx: number, dy: number) {
        this.pos = {
            x: this.pos.x + dx,
            y: this.pos.y + dy
        }
    }

    static generateId(prefix = "obj-"){
        return prefix + Math.random().toString(36).slice(2, 9);
    }
}