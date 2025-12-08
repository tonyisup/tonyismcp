export type AppMode = 'Paint' | 'ToolSelect';
export type ToolType = 'brush' | 'eraser';
export type ColorType = 'black' | 'red' | 'blue' | 'green' | 'yellow' | 'white';

export interface AppState {
  mode: AppMode;
  activeTool: ToolType;
  activeColor: ColorType;
  brushSize: number;
  isUndoTriggered: boolean; // Flag to trigger undo in canvas
  isClearTriggered: boolean; // Flag to trigger clear in canvas
  lastIntent: string | null; // For debug
  lastSource: 'voice' | 'gaze' | 'gesture' | 'mouse' | null; // For debug
}

export type Action =
  | { type: 'SET_MODE'; payload: AppMode; source?: string }
  | { type: 'SELECT_TOOL'; payload: ToolType; source?: string }
  | { type: 'SELECT_COLOR'; payload: ColorType; source?: string }
  | { type: 'SET_BRUSH_SIZE'; payload: number; source?: string }
  | { type: 'ADJUST_BRUSH_SIZE'; payload: 'increase' | 'decrease'; source?: string }
  | { type: 'UNDO'; source?: string }
  | { type: 'CLEAR'; source?: string }
  | { type: 'RESET_TRIGGERS' }; // To reset ephemeral flags like undo/clear
