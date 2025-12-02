# Diagram Editor

A keyboard-driven editor for creating commutative diagrams. Build complex diagrams of objects, arrows, and labels entirely through keyboard shortcuts—no mouse required.

## Features

- **Pure keyboard navigation**: Navigate and edit diagrams using vim-like keybindings
- **Modal editing**: Switch between selecting, renaming, and moving modes for efficient workflow

## Keyboard Shortcuts

All keybindings are defined in `src/editor/keybinds.ts`.

### Navigation (Selecting Mode)
- **h / j / k / l** (or **Arrow Keys**): Move selection left/down/up/right
- **Tab**: Select next object to the right
- **]**: Cycle through arrows

### Creating Objects (Selecting Mode)
- **Shift+H / J / K / L**: Create new object left/down/up/right of current selection
- **Shift+U / I / N / M**: Create new object diagonally (up-left / up-right / down-left / down-right)

### Editing
- **r**: Enter renaming mode
- **Enter**: Confirm rename and return to selecting mode
- **Delete**: Delete selected object(s)
- **Escape**: Return to selecting mode

### Modes
- **Selecting**: Navigate and select objects (default)
- **Renaming**: Edit object labels
- **Moving**: Reposition objects

## Getting Started

```bash
npm install
npm run dev
```

Open your browser to the displayed local URL and start creating diagrams with your keyboard!
