export interface Focusable {
    id: string;
    type: "obj" | "edge" | "arrow";
    getPos(): { x: number; y: number };
    getBoundingBox(): { xMin: number; yMin: number; xMax: number; yMax: number };
}