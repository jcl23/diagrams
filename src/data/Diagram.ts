import { Arrow, type ArrowStyle } from "./Arrow";
import { Edge } from "./Edge";
import type { Focusable } from "./Focusable";
import { Obj } from "./Obj";
import type { Point } from "./Point";

export const toLocKey = (pos: Point) => {
    return `${pos.x.toFixed(3)}|${pos.y.toFixed(3)}`;
}

export class Diagram {

    objects: Obj[];
    edges: Edge[];
    locationMap: Map<string, Focusable> = new Map();
    constructor() {
        this.objects = [];
        this.edges = [];
    }

    get arrows(): Arrow[] {
        return this.edges.flatMap(e => e.arrows);
    }
    get pieces(): (Obj |  Edge)[] {
        return [...this.objects, ...this.edges];
    }
    get things(): Focusable[] {
        return [...this.objects, ...this.arrows, ...this.edges];
    }

    toString(): string {
        let result = "";
        let tabLevel = 0;
        const indent = (content: string) => content + "  ".repeat(tabLevel);
        const print = (line: string) => {
            result += indent(line) + "\n";
        }
        print("Diagram {");
        tabLevel++;
        print("Objects [");
        tabLevel++;
        for (const obj of this.objects) {
            print(obj);
        }
    }
    addObject(name: string, point: Point, id?: string): Obj | null {
        const o = new Obj(name, point, id);
        if (this.locationMap.has(toLocKey(point))) {
            return null;       
        }
        this.objects.push(o);
        this.updateLocationMap();
        return o;
    }

    getObjectById(id: string): Obj | undefined {
        return this.objects.find(o => o.id === id);
    }

    removeThingById(id: string): boolean {
       if (id.startsWith("obj-")) {
            return this.removeObjectById(id);
       }
        else if (id.startsWith("edge-")) {
            return this.removeEdgeById(id);
        }
        else if (id.startsWith("arrow-")) {
            return this.removeArrowById(id);
        }
        return false;
    }
    removeObjectById(id: string): boolean {
        const idx = this.objects.findIndex(o => o.id === id);
        if (idx === -1) return false;
        const [removed] = this.objects.splice(idx, 1);
        if (!removed) return false;
        // remove associated edges and arrows
        const involvedEdges = [...removed.incomingEdges, ...removed.outgoingEdges];
        const involvedEdgeIds = new Set(involvedEdges.map(e => e.id));
        this.edges = this.edges.filter(e => !involvedEdgeIds.has(e.id));
        this.updateLocationMap();
        return true;
    }

    addArrow(name: string, fromId: string, toId: string, style?: ArrowStyle, id?: string): Arrow | undefined {
        const from = this.getObjectById(fromId);
        const to = this.getObjectById(toId);
        if (!from || !to) return undefined;

        let edge = this.edges.find(e => (
            e.domain.id === from.id && e.codomain.id === to.id)
            || (e.domain.id === to.id && e.codomain.id === from.id)
        );
        if (!edge) {
            edge = new Edge("", from, to, []);
            this.edges.push(edge);
        }

        const arrow = new Arrow(name, edge, style, id);
        this.arrows.push(arrow);
        edge.arrows.push(arrow);
        this.updateLocationMap();
        return arrow;
    }

    getArrowById(id: string): Arrow | undefined {
        return this.arrows.find(a => a.id === id);
    }

    removeArrowById(id: string): boolean {
        const idx = this.arrows.findIndex(a => a.id === id);
        if (idx === -1) return false;
        this.arrows.splice(idx, 1);
        this.edges.forEach(e => {
            e.arrows = e.arrows.filter(a => a.id !== id);
        });
        this.edges = this.edges.filter(e => e.arrows.length > 0);
        this.updateLocationMap();
        return true;
    }

    getEdgeById(id: string): Edge | undefined {
        return this.edges.find(e => e.id === id);
    }

    addEdge(fromId: string, toId: string, id?: string): Edge | undefined {
        const from = this.getObjectById(fromId);
        const to = this.getObjectById(toId);
        if (!from || !to) return undefined;
        const pos = {
            x: (from.getPos().x + to.getPos().x) / 2,
            y: (from.getPos().y + to.getPos().y) / 2
        };
            if (this.locationMap.has(toLocKey(pos))) {
                return undefined;
            }
            const existing = this.edges.find(e => e.domain.id === from.id && e.codomain.id === to.id);
            if (existing) return existing;
        const e = new Edge("",from, to, [], id);
        this.edges.push(e);
        this.updateLocationMap();
        return e;
    }

    removeEdgeById(id: string): boolean {
        const edge = this.getEdgeById(id);
        if (!edge) return false;
        edge.delete();
        this.edges = this.edges.filter(e => e.id !== id);
        this.updateLocationMap();
        return true;
    }

    getById(id: string): Obj | Arrow | Edge {
        const thing =  this.getObjectById(id) || this.getArrowById(id) || this.getEdgeById(id);
        if (!thing) {
            throw new Error(`No object, arrow, or edge found with id: ${id}`);
        }
        return thing;
    }

    
    updateLocationMap() {
        this.locationMap.clear();
        for (const obj of this.pieces) {
            const piece = toLocKey(obj.getPos());
            this.locationMap.set(piece, obj);
        }
    }
}