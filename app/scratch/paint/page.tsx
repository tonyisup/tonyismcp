'use client';

import React, { useReducer, useRef, useEffect, useState } from 'react';
import { appReducer, initialState } from './reducer';
import { cn } from '@/lib/utils';
import { Eraser, Brush, Undo, Trash2, Mic, Eye, Hand, Settings, Crosshair } from 'lucide-react';
import { useHandTracking } from './components/useHandTracking';
import { useVoiceControl } from './components/useVoiceControl';
import { useGazeTracking } from './components/useGazeTracking';
import { CalibrationOverlay } from './components/CalibrationOverlay';
import { ColorType } from './types'; // Import ColorType

// Drawing Utils
const getCoordinates = (event: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in event) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = (event as React.MouseEvent).nativeEvent.offsetX;
        y = (event as React.MouseEvent).nativeEvent.offsetY;
    }
    return { x, y };
};

export default function UnifiedPaintPage() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [activeRegression, setActiveRegression] = useState('ridge');

  // Drawing State (Mouse/Touch)
  const [isDrawing, setIsDrawing] = useState(false);
  const lastDrawPos = useRef<{ x: number; y: number } | null>(null);

  // Refs for State
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // --- Hand Tracking Hook ---
  // We no longer pass canvasRef as drawing is done here
  const { isHandDetected, isPinched, fingertipCoords } = useHandTracking(videoRef);

  // --- Voice Control Hook ---
  const { isListening: isVoiceListening, lastTranscript } = useVoiceControl(dispatch);

  // --- Gaze Tracking Hook ---
  const {
    isGazeReady,
    gazePos,
    focusedId,
    setRegressionModel,
    clearCalibrationData
  } = useGazeTracking(stateRef, dispatch);

  const isReady = isHandDetected || isGazeReady; // Simplified readiness check

  // --- Selection Logic (Gaze + Gesture) ---
  const wasPinchedRef = useRef(false);

  useEffect(() => {
    // Detect Rising Edge of Pinch (False -> True)
    if (isPinched && !wasPinchedRef.current) {
        // Pinch Start!
        if (focusedId) {
            console.log(`Pinch Selection Triggered on: ${focusedId}`);
            // Mode Switching Logic based on Gaze Target
            if (focusedId === 'toolbar-area' && state.mode === 'Paint') {
                 dispatch({ type: 'SET_MODE', payload: 'ToolSelect', source: 'gesture' });
            }
            else if (focusedId.startsWith('tool-')) {
                const tool = focusedId.replace('tool-', '');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dispatch({ type: 'SELECT_TOOL', payload: tool as any, source: 'gesture' });
            }
            else if (focusedId.startsWith('color-')) {
                const color = focusedId.replace('color-', '');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dispatch({ type: 'SELECT_COLOR', payload: color as any, source: 'gesture' });
            }
            else if (focusedId.startsWith('action-')) {
                const action = focusedId.replace('action-', '');
                if (action === 'undo') dispatch({ type: 'UNDO', source: 'gesture' });
                if (action === 'clear') dispatch({ type: 'CLEAR', source: 'gesture' });
            }
        }
    }
    wasPinchedRef.current = isPinched;
  }, [isPinched, focusedId, state.mode]);


  // --- Canvas Drawing Handlers ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (state.mode !== 'Paint') return;
      if (!canvasRef.current) return;
      const { x, y } = getCoordinates(e, canvasRef.current);
      lastDrawPos.current = { x, y };
      setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !lastDrawPos.current || !canvasRef.current) return;
      e.preventDefault(); // Prevent scrolling on touch

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const { x, y } = getCoordinates(e, canvasRef.current);

      ctx.beginPath();
      ctx.moveTo(lastDrawPos.current.x, lastDrawPos.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = state.activeTool === 'eraser' ? '#ffffff' : state.activeColor;
      ctx.lineWidth = state.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastDrawPos.current = { x, y };
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      lastDrawPos.current = null;
  };


  // Handle External Triggers (Clear/Undo)
  useEffect(() => {
    if (state.isClearTriggered && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        dispatch({ type: 'RESET_TRIGGERS' });
    }
    if (state.isUndoTriggered) {
        console.log("Undo triggered - (Not implemented for canvas bitmap yet)");
        dispatch({ type: 'RESET_TRIGGERS' });
    }
  }, [state.isClearTriggered, state.isUndoTriggered]);

  const handleRegressionChange = (model: string) => {
    setActiveRegression(model);
    setRegressionModel(model);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans relative overflow-hidden">
      {/* Shared Video Element */}
      <video
        ref={videoRef}
        className="fixed bottom-4 left-4 w-48 h-auto rounded-lg border-2 border-white shadow-lg z-50 scale-x-[-1] opacity-50 hover:opacity-100 transition-opacity"
        playsInline
        muted
        autoPlay
      />

      {/* Calibration Overlay */}
      {isCalibrationOpen && (
        <CalibrationOverlay
            onComplete={() => setIsCalibrationOpen(false)}
            onCancel={() => setIsCalibrationOpen(false)}
        />
      )}

      {/* Header / Status Bar */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">Unified Paint</h1>
            <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                state.mode === 'Paint' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
            )}>
                Mode: {state.mode}
            </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
            {isGazeReady && (
                <button
                    onClick={() => setIsCalibrationOpen(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                    <Crosshair className="w-4 h-4" />
                    Calibrate Gaze
                </button>
            )}

            <div className="h-4 w-px bg-gray-300 mx-2" />

            <div className={cn("flex items-center gap-1 transition-colors", isVoiceListening ? "text-green-600 font-bold" : "")}><Mic className="w-4 h-4" /> Voice</div>
            <div className={cn("flex items-center gap-1 transition-colors", isGazeReady ? "text-green-600 font-bold" : "")}><Eye className="w-4 h-4" /> Gaze</div>
            <div className={cn("flex items-center gap-1 transition-colors", isHandDetected ? "text-green-600 font-bold" : "")}><Hand className="w-4 h-4" /> Gesture</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex items-center justify-center p-8">

        {/* Loading Overlay */}
        {!isReady && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Initializing Vision Models...</p>
                    <div className="text-xs text-gray-400">
                        {!isGazeReady && <div>Waiting for Gaze...</div>}
                        {!isHandDetected && <div>Waiting for Hand...</div>}
                    </div>
                </div>
            </div>
        )}

        {/* Gaze Cursor */}
        {gazePos && (
            <div
                className={cn(
                    "fixed w-6 h-6 rounded-full border-2 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out",
                    isPinched ? "border-green-500 bg-green-500/30 scale-125" : "border-red-500 bg-red-500/30"
                )}
                style={{ left: gazePos.x, top: gazePos.y }}
            />
        )}

        {/* Toolbar */}
        <div
            className={cn(
                "absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-4 bg-white rounded-xl shadow-xl transition-all duration-300 z-30",
                state.mode === 'ToolSelect' ? "scale-100 opacity-100 translate-x-0" : "scale-90 opacity-80 -translate-x-4 grayscale",
                focusedId === 'toolbar-area' ? "ring-2 ring-blue-400 shadow-2xl scale-105" : ""
            )}
            data-toolbar-container="true"
        >
             {/* Colors */}
             {['black', 'red', 'blue', 'green', 'yellow'].map((color) => (
                <div
                    key={color}
                    className={cn(
                        "relative w-10 h-10 rounded-full border-2 transition-all cursor-pointer overflow-hidden",
                        state.activeColor === color ? "border-gray-900 scale-110" : "border-transparent",
                        focusedId === `color-${color}` ? "scale-125 shadow-lg ring-2 ring-blue-300" : ""
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => dispatch({ type: 'SELECT_COLOR', payload: color as ColorType, source: 'mouse' })}
                    data-tool-id={`color-${color}`}
                >
                </div>
             ))}

             <div className="h-px w-full bg-gray-200 my-2" />

             {/* Tools */}
             <button
                className={cn(
                    "relative p-2 rounded-lg transition-all overflow-hidden",
                    state.activeTool === 'brush' ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100",
                    focusedId === 'tool-brush' ? "ring-2 ring-blue-400 bg-blue-50" : ""
                )}
                onClick={() => dispatch({ type: 'SELECT_TOOL', payload: 'brush', source: 'mouse' })}
                data-tool-id="tool-brush"
             >
                <Brush className="w-6 h-6" />
             </button>
             <button
                className={cn(
                    "relative p-2 rounded-lg transition-all overflow-hidden",
                    state.activeTool === 'eraser' ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100",
                    focusedId === 'tool-eraser' ? "ring-2 ring-blue-400 bg-blue-50" : ""
                )}
                 onClick={() => dispatch({ type: 'SELECT_TOOL', payload: 'eraser', source: 'mouse' })}
                 data-tool-id="tool-eraser"
             >
                <Eraser className="w-6 h-6" />
             </button>

             <div className="h-px w-full bg-gray-200 my-2" />

             <button
                className={cn(
                    "relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 overflow-hidden",
                    focusedId === 'action-undo' ? "ring-2 ring-gray-400 bg-gray-100" : ""
                )}
                onClick={() => dispatch({ type: 'UNDO', source: 'mouse' })}
                data-tool-id="action-undo"
             >
                <Undo className="w-6 h-6" />
             </button>
             <button
                className={cn(
                    "relative p-2 rounded-lg hover:bg-red-50 text-red-500 overflow-hidden",
                    focusedId === 'action-clear' ? "ring-2 ring-red-400 bg-red-50" : ""
                )}
                onClick={() => dispatch({ type: 'CLEAR', source: 'mouse' })}
                data-tool-id="action-clear"
             >
                <Trash2 className="w-6 h-6" />
             </button>

            {/* Instruction */}
            {state.mode === 'ToolSelect' && (
                 <div className="mt-4 text-xs text-center text-gray-500 animate-pulse">
                     Look & Pinch to Select
                 </div>
            )}
        </div>

        {/* Canvas Container */}
        <div className="relative w-[800px] h-[600px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 cursor-crosshair">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>

      </main>

      {/* Debug Overlay */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono w-80 pointer-events-auto z-50">
        <div className="font-bold border-b border-gray-600 pb-2 mb-2 flex justify-between items-center">
            <span>State Monitor</span>
            <Settings className="w-4 h-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>Mode: <span className="text-yellow-400">{state.mode}</span></div>
            <div>Tool: {state.activeTool}</div>
            <div>Color: {state.activeColor}</div>
            <div>Size: {state.brushSize}</div>
            <div className="col-span-2 text-gray-400 mt-2 border-t border-gray-700 pt-1">
                Last Action: <span className="text-green-400">{state.lastIntent}</span>
                {state.lastSource && <span className="text-gray-500 ml-2">({state.lastSource})</span>}
            </div>
            {lastTranscript && (
                <div className="col-span-2 text-gray-400 mt-1">
                    Voice: <span className="text-blue-300 italic">&quot;{lastTranscript}&quot;</span>
                </div>
            )}
            <div className="col-span-2 text-gray-400 mt-1">
                Gaze: {gazePos ? `${Math.round(gazePos.x)}, ${Math.round(gazePos.y)}` : "None"} (Focus: {focusedId})
            </div>
            <div className="col-span-2 text-gray-400 mt-1">
                 Pinch: <span className={isPinched ? "text-green-500 font-bold" : "text-red-500"}>{isPinched ? "YES" : "NO"}</span>
            </div>


            {/* Regression Settings */}
            <div className="col-span-2 border-t border-gray-700 mt-2 pt-2">
                <div className="mb-1 text-gray-400">Gaze Regression Model:</div>
                <div className="flex gap-1">
                    {['ridge', 'weightedRidge', 'threadedRidge'].map((model) => (
                        <button
                            key={model}
                            onClick={() => handleRegressionChange(model)}
                            className={cn(
                                "px-2 py-1 rounded text-[10px] border",
                                activeRegression === model
                                    ? "bg-blue-600 border-blue-400 text-white"
                                    : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700"
                            )}
                        >
                            {model}
                        </button>
                    ))}
                </div>
                <button
                    onClick={clearCalibrationData}
                    className="mt-2 text-[10px] text-red-400 hover:text-red-300 underline"
                >
                    Clear Calibration Data
                </button>
            </div>
        </div>
      </div>

    </div>
  );
}
