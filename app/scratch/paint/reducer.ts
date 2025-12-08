import { AppState, Action } from './types';

export const initialState: AppState = {
  mode: 'Paint',
  activeTool: 'brush',
  activeColor: 'black',
  brushSize: 5,
  isUndoTriggered: false,
  isClearTriggered: false,
  lastIntent: null,
  lastSource: null,
};

export function appReducer(state: AppState, action: Action): AppState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const source = 'source' in action ? (action.source as any) : null;

  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        lastIntent: `Set Mode: ${action.payload}`,
        lastSource: source,
      };
    case 'SELECT_TOOL':
      return {
        ...state,
        activeTool: action.payload,
        // If we select a tool, we might want to auto-switch back to Paint mode?
        // Requirement says: "Selecting a tool... transition to Paint mode" (implied or explicit).
        // Let's assume explicit switch or voice command for now, but user said "ExitToolMode... from confirmed selection".
        // So we switch to Paint mode on selection.
        mode: 'Paint',
        lastIntent: `Selected Tool: ${action.payload}`,
        lastSource: source,
      };
    case 'SELECT_COLOR':
      return {
        ...state,
        activeColor: action.payload,
        lastIntent: `Selected Color: ${action.payload}`,
        lastSource: source,
      };
    case 'SET_BRUSH_SIZE':
      return {
        ...state,
        brushSize: action.payload,
        lastIntent: `Set Size: ${action.payload}`,
        lastSource: source,
      };
    case 'ADJUST_BRUSH_SIZE':
      const newSize = action.payload === 'increase'
        ? Math.min(state.brushSize + 5, 50)
        : Math.max(state.brushSize - 5, 1);
      return {
        ...state,
        brushSize: newSize,
        lastIntent: `Adjust Size: ${action.payload}`,
        lastSource: source,
      };
    case 'UNDO':
      return {
        ...state,
        isUndoTriggered: true,
        lastIntent: 'Undo',
        lastSource: source,
      };
    case 'CLEAR':
      return {
        ...state,
        isClearTriggered: true,
        lastIntent: 'Clear Canvas',
        lastSource: source,
      };
    case 'RESET_TRIGGERS':
      return {
        ...state,
        isUndoTriggered: false,
        isClearTriggered: false,
      };
    default:
      return state;
  }
}
