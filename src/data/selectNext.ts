import type { Diagram } from "./Diagram";
import type { Focusable } from "./Focusable";
import type { Point } from "./Point";



export function nextSelection(d: Diagram, selected: Focusable[], dir: Point): Focusable[]{
    const allWithDupes =  selected.map(s => nextSelectionSingle(d, s, dir)).filter(Boolean) as Focusable[];   
    const unique = new Set<Focusable>(allWithDupes);
    return Array.from(unique);
}
export function nextSelectionSingle(d: Diagram, selected: Focusable, dir: Point): Focusable {
    
    let best: Focusable | null = null;
    let bestPenalty = Infinity;
    const focusable = [...d.objects, ...d.edges];
    const c = selected.getPos();
    for (const it of focusable) {
        if (it === selected) continue;
        const p = it.getPos();

        const vx = p.x - c.x;
        const vy = p.y - c.y;
        const proj = vx * dir.x + vy * dir.y;
        if (proj <= 0) continue;

        const dist = Math.hypot(vx, vy);
        const angle = Math.acos(Math.min(1, Math.max(-1, proj / dist)));
        // range of angle: 0 to pi/2
        const anglePenalty = angle / (  Math.PI);
        const distPenalty = dist * 0.25;
        const penalty = anglePenalty + distPenalty;
        if (penalty < bestPenalty) {
            best = it;
            bestPenalty = penalty;
        }
    }

    return best || selected;
}