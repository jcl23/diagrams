import { modes } from "./types";
import { StatelyActions } from "./Actions";
import type { EditorState, KeyHandler, Mode } from "./types";
// type Mode = "selecting" | "renaming" | "moving"; and so selecting is 1, renaming is 2, moving is 4

export const REBIND: Record<string, string> = {
    "ArrowRight": "l",
    "ArrowLeft": "h",
    "ArrowUp": "k",
    "ArrowDown": "j",
}
// const rebinds = Object.entries(REBIND).map(([from, to]) => (str: string) => str.replace(from, to));  ;
export const KEYBINDS: Record<string, KeyHandler> = {
    "1:shift+l": (state) => {
        console.log("Create right");
        StatelyActions.EXTEND_OUT(state, { x: 1, y: 0 });
    },
    "1:shift+h": (state) => {
        console.log("Create left");
        StatelyActions.EXTEND_OUT(state, { x: -1, y: 0 });
    },
    "1:shift+k": (state) => {
        console.log("Create up");
        StatelyActions.EXTEND_OUT(state, { x: 0, y: -1 });
    },
    "1:shift+j": (state) => {
        console.log("Create down");
        StatelyActions.EXTEND_OUT(state, { x: 0, y: 1 });
    },
    "1:shift+u": (state) => {
        StatelyActions.EXTEND_OUT(state, { x: -1, y: -1 });
    },
    "1:shift+i": (state) => {
        StatelyActions.EXTEND_OUT(state, { x: 1, y: -1 });
    },
    "1:shift+m": (state) => {
        StatelyActions.EXTEND_OUT(state, { x: 1, y: 1 });
    },
    "1:shift+n": (state) => {
        StatelyActions.EXTEND_OUT(state, { x: -1, y: 1 });
    },
    "1:h": (state) => {
        console.log("Move left pressed");
        StatelyActions.LEFT(state);
    },
    "1:l": (state) => {
        console.log("Move right pressed");
        StatelyActions.RIGHT(state);
    },
    "1:k": (state) => {
        console.log("Move up pressed");
        StatelyActions.UP(state);
    },
    "1:j": (state) => {
        console.log("Move down pressed");
        StatelyActions.DOWN(state);
    },
    "1:Tab": (state) => {
        console.log("Move down pressed");
        StatelyActions.SELECT_NEXT(state, { x: 1, y: 0 });
    },
    "2:Enter": (state) => {
        const { setMode } = state;
        setMode("selecting");
    },

    "Delete": (state) => {
        StatelyActions.DELETE_SELECTED(state);
    },
    "Escape": (state) => {
        // set mode to selecting
        const { setMode } = state;
        setMode("selecting");
    },
    "5:r": (state) => {
        // set mode to renaming
        const { setMode } = state;
        setMode("renaming");
    },
    "1:]": (state) => {     
        StatelyActions.ARROW_SELECT_NEXT(state);
    }
};

const MOVE_KEYBINDS: Record<string, KeyHandler> = { };
const SELECT_KEYBINDS: Record<string, KeyHandler> = { };
const RENAME_KEYBINDS: Record<string, KeyHandler> = { };
// export const MODE_KEYBINDS: Record<Mode, Record<string, KeyHandler>> = { selecting: {}, renaming: {}, moving: {} };
const MODE_KEYBINDS = [MOVE_KEYBINDS, SELECT_KEYBINDS, RENAME_KEYBINDS];
for (const [combo, handler] of Object.entries(KEYBINDS)) {
    const m = combo.match(/^((\d+)?)\:(.+)$/);
    
    const flags = m ? Number(m[2]) : 2 ** 8 - 1;
    const keycombo = m ? m[3] : combo;

    for (let bit = 0; bit < modes.length; bit++) {
        if (flags & (1 << bit)) {
            MODE_KEYBINDS[bit][keycombo.toLowerCase()] = handler;
        }
    }
}


type HandleKeyDownParams = [e: KeyboardEvent, state: EditorState, shiftKey: boolean, ctrlKey: boolean];

export const handleKeyDown: (...args: HandleKeyDownParams) => void = (e, state, shiftKey, ctrlKey) => {
    const key = e.key;
    let combo = "";
    if (ctrlKey) combo += "ctrl+";
    if (shiftKey) combo += "shift+";
    if (REBIND[key]) {
        combo += REBIND[key].toLowerCase();
    } else {
        combo += key.toLowerCase();
    }

    const { mode } = state;
    const modeKeybinds = MODE_KEYBINDS[modes.indexOf(mode)];
    const handler = modeKeybinds[combo];
    if (handler) {
        e.preventDefault();
        handler(state);
    }

}
export { MODE_KEYBINDS, MOVE_KEYBINDS}