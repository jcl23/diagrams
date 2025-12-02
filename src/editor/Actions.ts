import { toLocKey, type Diagram } from "../data/Diagram";
import type { Focusable } from "../data/Focusable";
import type { Obj } from "../data/Obj";
import { angle, dot, type Point } from "../data/Point";
import { nextSelection } from "../data/selectNext";
import type { FocusableSelection, FocusableSelectionPart } from "./Editor";
import type { EditorState } from "./types";

export class Actions {
    static MOVE(diagram: Diagram, selected: FocusableSelection, setDiagram: (d: Diagram) => void, delta: Point) {
        if (selected.length === 0) return;
        const things = selected.map(s => diagram.getById(s.id));
        const objs = things.filter(thing => thing && thing.type === "obj");
        objs.forEach(obj => {
            obj.shiftPos(delta.x, delta.y);
        });
        setDiagram(diagram);
    }

    static SELECT_NEXT(diagram: Diagram, selected: FocusableSelection, setSelected: (ids: FocusableSelection) => void, direction: Point) {
        if (selected.length === 0) return;
        const focusables = selected.map(s => diagram.getById(s.id)).filter(Boolean) as any;
        const next = nextSelection(diagram, focusables, direction);
        setSelected(next.map(f => ({ id: f.id })));
    }

    static ARROW_SELECT_NEXT(diagram: Diagram, selected: FocusableSelection, setSelected: (ids: FocusableSelection) => void) {
        if (selected.length !== 1) return;
        const thing = diagram.getById(selected[0].id);
        if (!thing) return;
        if (thing.type == "obj") return;
        // if edge, select the top arrow inside the edge.
        // if arrow, select the next arrow (loop around)
        if (thing.type == "edge") {
            if (thing.arrows.length === 0) return;
            setSelected([{ id: thing.arrows[0].id }]);
        } else if (thing.type == "arrow") {
            const edge = diagram.edges.find(e => e.arrows.some(a => a.id === thing.id));
            if (!edge) return;
            const idx = edge.arrows.findIndex(a => a.id === thing.id);
            if (idx === -1) return;
            const nextIdx = (idx + 1) % edge.arrows.length;
            setSelected([{ id: edge.arrows[nextIdx].id }]);
        }
    }


    static EXTEND_OUT(diagram: Diagram, selected: FocusableSelection, setDiagram: (d: Diagram) => void, setSelected: (ids: FocusableSelection) => void, direction: Point): Focusable | null {
        const { x: dx, y: dy } = direction;
        if (selected.length === 0) return null;

        const source = diagram.getById(selected[0].id);
        if (!source) return null;

        if (source.type === "obj") {
            const pos = source.getPos();
            pos.x += dx;
            pos.y += dy;
            let newObj = diagram.addObject("new", { ...pos });
            if (newObj === null) {
                newObj = diagram.locationMap.get(toLocKey(pos)) as Obj;
            }

            diagram.addArrow("", source.id, newObj.id);

            setDiagram(diagram);
            setSelected([{ id: newObj.id }]);
            return newObj;
        } else if (source.type === "edge") {
            const edgeVec = { x: source.codomain.getPos().x - source.domain.getPos().x,
                              y: source.codomain.getPos().y - source.domain.getPos().y };
            const dp = angle(direction, edgeVec);
            if (dp < 0.1) return null;
            const length = Math.hypot(edgeVec.x, edgeVec.y);
            const normVec = { x: edgeVec.x / length, y: edgeVec.y / length };
            const moveVec = { x: normVec.x * (dx + dy), y: normVec.y * (dx + dy) };
            const newDomain = Actions.EXTEND_OUT(diagram, [{ id: source.domain.id }], setDiagram, setSelected, direction);
            const newCodomain = Actions.EXTEND_OUT(diagram, [{ id: source.codomain.id }], setDiagram, setSelected, direction);
            const newEdge = diagram.addEdge(newDomain!.id, newCodomain!.id);
            // add arrow to new edge
            const newArrow = diagram.addArrow("", newDomain!.id, newCodomain!.id);
            if (!newArrow) return null;
            setDiagram(diagram);
            setSelected([newArrow]);
            return newArrow;
        } else {
            return null;
        }
    }
    
    static DELETE_SELECTED(diagram: Diagram, selected: FocusableSelection, setDiagram: (d: Diagram) => void, setSelected: (ids: FocusableSelection) => void) {
        selected.forEach(s => {
            diagram.removeThingById(s.id);
        });
        setDiagram(diagram);
        setSelected([]);
    }

    static RENAME(diagram: Diagram, selection: FocusableSelectionPart, newName: string, setDiagram: (d: Diagram) => void) {
        const obj = diagram.getObjectById(selection.id);
        if (obj) {
            obj.setName(newName);
            setDiagram(diagram);
        }
    }
}

export class StatelyActions {
    static MOVE(state: EditorState, delta: Point) {
        const { diagram, selected, mode, setDiagram } = state;
        if (mode !== "moving") return;
        Actions.MOVE(diagram, selected, setDiagram, delta);
    }

    static SELECT_NEXT(state: EditorState, direction: Point) {
        const { diagram, selected, setSelected } = state;
        if (selected.length === 0) {
            setSelected([diagram.objects[0]]);
            return;
        }
        Actions.SELECT_NEXT(diagram, selected, setSelected, direction);
    }

    static ARROW_SELECT_NEXT(state: EditorState) {
        const { diagram, selected, setSelected } = state;
        Actions.ARROW_SELECT_NEXT(diagram, selected, setSelected);
    }


    static EXTEND_OUT(state: EditorState, direction: Point) {
        const { diagram, selected, setDiagram, setSelected } = state; 
        Actions.EXTEND_OUT(diagram, selected, setDiagram, setSelected, direction);
    }


    static DELETE_SELECTED(state: EditorState) {
        const { diagram, selected, setDiagram, setSelected } = state;
        Actions.DELETE_SELECTED(diagram, selected, setDiagram, setSelected);
    }
    static LEFT(state: EditorState) {
        if (state.mode == "moving") StatelyActions.MOVE(state, { x: -1, y: 0 });
        if (state.mode == "selecting") StatelyActions.SELECT_NEXT(state, { x: -1, y: 0 });
    }
    
    static RIGHT(state: EditorState) {
        if (state.mode == "moving") StatelyActions.MOVE(state, { x: 1, y: 0 });
        if (state.mode == "selecting") StatelyActions.SELECT_NEXT(state, { x: 1, y: 0 });
    }

    static UP(state: EditorState) {
        if (state.mode == "moving") StatelyActions.MOVE(state, { x: 0, y: -1 });
        if (state.mode == "selecting") StatelyActions.SELECT_NEXT(state, { x: 0, y: -1 });
    }

    static DOWN(state: EditorState) {
        if (state.mode == "moving") StatelyActions.MOVE(state, { x: 0, y: 1 });
        if (state.mode == "selecting") StatelyActions.SELECT_NEXT(state, { x: 0, y: 1 });
    }

    static RENAME(state: EditorState, newName: string) {
        const { diagram, selected, setDiagram } = state;
        if (selected.length === 1) {
            Actions.RENAME(diagram, selected[0], newName, setDiagram);
        }
    }
}