import { Diagram } from "../data/Diagram";
import type { FocusableSelection } from "./Editor";

export type Mode = "selecting" | "renaming" | "moving";
export const modes = ["selecting", "renaming", "moving"] as const;

export interface EditorState {
    diagram: Diagram;
    selected: FocusableSelection;
    mode: Mode;
    setDiagram: (diagram: Diagram) => void;
    setSelected: (selected: FocusableSelection) => void;
    setMode: (mode: Mode) => void;
}

export type KeyHandler = (state: EditorState) => void;
