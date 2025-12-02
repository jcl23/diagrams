export type Point = { 
    x: number;
    y: number
}
export function dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
}
export function angle(a: Point, b: Point): number {
    const dotProduct = dot(a, b);
    const magA = Math.hypot(a.x, a.y);
    const magB = Math.hypot(b.x, b.y);
    return Math.acos(Math.min(1, Math.max(-1, dotProduct / (magA * magB))));
}
export function add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(p: Point, s: number): Point {
    return { x: p.x * s, y: p.y * s };
}