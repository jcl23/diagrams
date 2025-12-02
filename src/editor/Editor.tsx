import React, { useState, useEffect } from "react";
import { Diagram } from "../data/Diagram";
import type { EditorState, Mode } from "./types";
import style from "../styles/Editor.module.css";
import type { Obj } from "../data/Obj";
import type { Focusable } from "../data/Focusable";
import { StatelyActions } from "./Actions";
import { handleKeyDown } from "./keybinds";
import { DatumComponent, Readout } from "./Readout";
const startingDiagram = () => {
    const d = new Diagram();
    const a = d.addObject("C", { x: 0, y: 0 }) as Obj;
    return { d, a };
};

const getBoundingBox = (objects: Focusable[]) => {
    if (objects.length === 0) return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    const [first, ...rest] = objects.map(o => o.getBoundingBox());
    const retVal = rest.reduce((acc, box) => {
        return {
            xMin: Math.min(acc.xMin, box.xMin),
            xMax: Math.max(acc.xMax, box.xMax),
            yMin: Math.min(acc.yMin, box.yMin),
            yMax: Math.max(acc.yMax, box.yMax),
        };
    }, first);
    console.log("Bounding box:", retVal);
    return retVal;
}
export type FocusableSelectionPart = {
    id: string;
    index?: number; 
};
export type FocusableSelection = FocusableSelectionPart[];
const Editor: React.FC = () => {
    const { d, a } = startingDiagram();
    const [diagram, setDiagram] = useState<Diagram>(d);
    const [mode, setMode] = useState<Mode>("renaming");
    const [selected, setSelected] = useState<FocusableSelection>([{ id: a.id }]);
    // const [selected, setSelected] = useState<{string[}]>([]);
    const nowPosition = selected.length > 0 ? diagram.getById(selected[0].id).getPos() : null;// : { x: 0, y: 0 };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            handleKeyDown(e, {
                diagram, selected, mode, setDiagram: (d: Diagram) => setDiagram(Object.assign(new Diagram(), d)), 
                setSelected, setMode
            }
        , e.shiftKey, e.ctrlKey);         
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [diagram, selected, mode]);
    useEffect(() => {
        if (mode === "renaming" && selected.length === 1) {
            const ref = editingNametagRef.current;
            if (ref) {
                ref.focus();
                document.execCommand("selectAll", false, undefined);
            }
        }
    }, [mode, selected]);
    const createEmptyDiagram = () => setDiagram(new Diagram());
    const clearSelection = () => setSelected([]);
    
    const c = 150;
    const allThingsInDiagram = diagram.things;
    const { xMin, xMax, yMin, yMax } = getBoundingBox(allThingsInDiagram);
    const selectedObjects = selected.map(s => allThingsInDiagram.find(o => o.id === s.id)).filter((o): o is Focusable => o !== undefined);
    const { xMin: activexMin, xMax: activexMax, yMin: activeyMin, yMax: activeyMax } = getBoundingBox(selectedObjects);
    const MARGIN = 1;
    const ARROW_SPACING = 0.15;
    const ARROW_MARGIN = 0.2;
    const TAG_MARGIN = 0.4; 

    const innerWidth = xMax - xMin;
    const innerHeight = yMax - yMin;
    const width = innerWidth + 2 * MARGIN;
    const height = innerHeight + 2 * MARGIN;
    const viewBox = `${xMin - MARGIN} ${yMin - MARGIN} ${width} ${height}`;
    
    const numObjects = diagram.objects.length;
    const numEdges = diagram.edges.length;
    const numArrows = diagram.arrows.length;
    
    const editingNametagRef = React.useRef<HTMLDivElement>(null);


    const isSingleton = selected.length === 1;
    const singleton = selected[0];
    // the hadler htat will be applied to the "being renamed" element
    const handleNametagKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (mode === "renaming" && e.key === "Enter") {
            e.preventDefault();
            const newName = e.currentTarget.textContent || "";
            StatelyActions.RENAME({ diagram, selected, mode, setDiagram, setSelected, setMode }, newName);
        }
    }
    const outputData = {
        mode, selected: selected.map(s => s.id).join(", "), numObjects, numEdges, numArrows    
    }
    return (
        <div>
            <h2>Editor ({mode})</h2>
            <div>
                <button onClick={createEmptyDiagram}>Create empty diagram</button>
                <button onClick={clearSelection}>Clear selection</button>
                <Readout data={outputData} />
                <div>{selectedObjects[0] ? selectedObjects[0].getBoundingBox().toString() : "Nothing selected"}</div>
            </div>
            <div className={style.editorContainer} style={{ width: `${width * c}px`, height: `${height * c}px` }}>
                {/************************** Nametags *************************** */}
                <div>

                {diagram.pieces.map(o => {
                    const pos = o.getPos();
                    const isBeingRenamed = selected.length === 1 && selected[0].id === o.id && mode === "renaming";
                    const ref = isBeingRenamed ? editingNametagRef : null;
                    const keyDownHandler = isBeingRenamed ? handleNametagKeyDown : undefined;
                    return (
                        <div key={o.id} onKeyDownCapture={keyDownHandler} ref={ref} className={style.nametag} style={{
                            left: `${(pos.x + MARGIN - xMin) * c }px`,
                            top: `${(pos.y + MARGIN - yMin) * c}px`,
                        }}
                        contentEditable={isBeingRenamed}
                        onKeyDown={isBeingRenamed ? handleNametagKeyDown : undefined}
                        >
                            {o.getName()}
                        </div>
                    );
                })}
                </div>
                {/************************************************************* */}
            <svg
                width={width * c}
                height={height * c}
                viewBox={viewBox}
                className={style.svgContainer}
                >
                     <defs>
                        <marker
                            id={`arrowhead`}
                            markerWidth="3"
                            markerHeight="4"
                            refX="2"
                            refY="2"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <path d="M0,0.5 L3,2 L0,3.5 z" fill="#000" />
                        </marker>
                    </defs>
                {/************************** Selected *************************** */}
                
                {selected.length > 0 && (   
                    <rect
                    x={activexMin - TAG_MARGIN}
                    y={activeyMin - TAG_MARGIN}
                    width={activexMax - activexMin + TAG_MARGIN * 2}
                    height={activeyMax - activeyMin + TAG_MARGIN * 2}
                    fill="none"
                    stroke="red"
                    strokeWidth={0.02}
                    
                    />)}
                {/************************** Cursor *************************** */}
                {mode == "moving" && nowPosition && (
                    <circle cx={nowPosition.x} cy={nowPosition.y} r={0.3} fill="#46F3" />
                )}
                {/************************************************************* */}
                {/************************** Objects *************************** */}
                {diagram.objects.map(o => {
                    const pos = o.getPos();
                    const selectedProp = selected.some(s => s.id === o.id) ? "active" : "inactive";
                    return (
                        <g key={o.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className={style[`${selectedProp}-${mode}`]}
                        >
                            {
                                (() => {
                                    const name = o.getName();
                                    const fontSize = 0.25;
                                    const pad = 0.12;
                                    const approxCharWidth = 0.32 * fontSize; // heuristic char width
                                    const widthRect = Math.max(name.length * approxCharWidth + 2 * pad, 0.6);
                                    return (
                                        <>
                                            <rect
                                                x={-widthRect / 2}
                                                y={-fontSize * 0.6 - pad}
                                                width={widthRect}
                                                height={fontSize + 2 * pad}
                                                fill={selected.some(s => s.id === o.id) ? "#ffe040" : "#ffffff"}
                                                >
                                                {selected.some(s => s.id === o.id) && mode == "renaming" && (
                                                    <animate
                                                    attributeName="opacity"
                                                    values="1;0;"
                                                    dur="0.5s"
                                                    repeatCount="indefinite"
                                                    calcMode="discrete"
                                                    />
                                                )}
                                            </rect>
                                        
                                        </>
                                    );
                                })()
                            }
                        </g>
                    );
                })}
                {/************************************************************* */}
                {/************************** Arrows *************************** */}
                {diagram.edges.flatMap(e => {
                    const fromPos = e.domain.getPos();
                    const toPos = e.codomain.getPos();
                    // shift fromPos and toPos each exactly 0.1 towards each other.
                    const edgeLength = Math.hypot(toPos.x - fromPos.x, toPos.y - fromPos.y);
                    const unitVec1 = { x: (toPos.x - fromPos.x) / edgeLength, y: (toPos.y - fromPos.y) / edgeLength };
                    fromPos.x += unitVec1.x * ARROW_MARGIN;
                    fromPos.y += unitVec1.y * ARROW_MARGIN;
                    toPos.x -= unitVec1.x * ARROW_MARGIN;
                    toPos.y -= unitVec1.y * ARROW_MARGIN; 
                    // const shiftedFromPos = { x: fromPos.x + unitVec1.x * 0.1, y: fromPos.y + unitVec1.y * 0.1 };
                    // const shiftedToPos = { x: toPos.x - unitVec1.x * 0.1, y: toPos.y - unitVec1.y * 0.1 };


                    const deltaVec = { x: toPos.x - fromPos.x, y: toPos.y - fromPos.y };
     

                    const arrowShiftVector = { x: -deltaVec.y, y: deltaVec.x };
                    if (arrowShiftVector.y < 0) {
                        arrowShiftVector.x = -arrowShiftVector.x;
                        arrowShiftVector.y = -arrowShiftVector.y;
                    }
                    const shiftVectLength = Math.hypot(arrowShiftVector.x, arrowShiftVector.y);
                    arrowShiftVector.x *= ARROW_SPACING / shiftVectLength;
                    arrowShiftVector.y *= ARROW_SPACING / shiftVectLength;
                    const initialDelta = { 
                        x: arrowShiftVector.x * (e.arrows.length - 1) / 2, 
                        y: arrowShiftVector.y * (e.arrows.length - 1) / 2 
                    };
                    const length = Math.hypot(deltaVec.x, deltaVec.y);
                    const unitVec = { x: deltaVec.x / length, y: deltaVec.y / length };
                    return e.arrows.map((a, i) => {
                        const dx = initialDelta.x  + (-i * arrowShiftVector.x);
                        const dy = initialDelta.y  + (-i * arrowShiftVector.y);
                        const reversed = (e.domain.id === a.codomain.id && e.codomain.id === a.domain.id);
                        const start = reversed ? toPos : fromPos;
                        const end = reversed ? fromPos : toPos;
                        return (
                            <g key={a.id}>
                               
                                <line
                                    x1={start.x + dx}
                                    y1={start.y + dy}
                                    x2={end.x + dx}
                                    y2={end.y + dy}
                                    stroke="#000000"
                                    strokeWidth={0.05}
                                    strokeDasharray={a.style.type === "dashed" ? "0.5,0.5" : "0"}
                                    markerEnd={`url(#arrowhead)`}
                                />
                            </g>
                        )
                }                    
                );
                })}
                {/************************************************************* */}
            </svg>
            </div>
            <pre>
                {diagram.toString()}
            </pre>
        </div>
    );
};

export default Editor;