'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils';

// Constants
const DWELL_THRESHOLD_MS = 700;
const FLICKER_TOLERANCE_MS = 150;

type Tool = 'brush' | 'eraser' | 'red' | 'blue' | 'undo';

interface WebGazerData {
  x: number;
  y: number;
}

interface WebGazer {
  setGazeListener: (listener: (data: WebGazerData | null, elapsedTime: number) => void) => WebGazer;
  begin: () => void;
  end: () => void;
  showVideoPreview: (show: boolean) => WebGazer;
  showPredictionPoints: (show: boolean) => WebGazer;
}

declare global {
  interface Window {
    webgazer: WebGazer;
  }
}

export default function GazePage() {
  const [gazePos, setGazePos] = useState<{ x: number; y: number } | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isWebGazerReady, setIsWebGazerReady] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // Refs for logic loop to avoid stale closures and excessive re-renders
  const stateRef = useRef({
    activeTarget: null as string | null,
    startTime: 0,
    lastSeenTime: 0,
    isSelected: false,
  });

  const addLog = useCallback((msg: string) => {
    setDebugLog((prev) => [msg, ...prev].slice(0, 5));
  }, []);

  // Removed dependency on updateDwell for now to break cycle, defined inside if needed or use refs
  const triggerSelection = useCallback((id: string) => {
    addLog(`Selected: ${id}`);
    if (['brush', 'eraser', 'red', 'blue', 'undo'].includes(id)) {
      setSelectedTool(id as Tool);
    }
  }, [addLog]);

  const updateDwell = useCallback((hitTarget: string | null) => {
    const now = Date.now();
    const state = stateRef.current;

    // Logic for flicker tolerance
    // If we are hitting the SAME target as activeTarget
    if (hitTarget === state.activeTarget) {
      state.lastSeenTime = now;

      if (state.activeTarget && !state.isSelected) {
        const elapsed = now - state.startTime;
        const progress = Math.min(elapsed / DWELL_THRESHOLD_MS, 1);
        setDwellProgress(progress);

        if (elapsed >= DWELL_THRESHOLD_MS) {
          triggerSelection(state.activeTarget);
          state.isSelected = true;
        }
      } else if (!state.activeTarget) {
        // Hovering over nothing
        setDwellProgress(0);
      }
    } else {
      // Hit target is different from activeTarget
      // Check flicker tolerance
      if (state.activeTarget && (now - state.lastSeenTime < FLICKER_TOLERANCE_MS)) {
        // We are within tolerance, ignore the miss (treat as if we are still on activeTarget)
        // But we don't update lastSeenTime because we aren't seeing it.
        // We just continue the dwell.
        if (!state.isSelected) {
           const elapsed = now - state.startTime;
           const progress = Math.min(elapsed / DWELL_THRESHOLD_MS, 1);
           setDwellProgress(progress);

            if (elapsed >= DWELL_THRESHOLD_MS) {
                triggerSelection(state.activeTarget);
                state.isSelected = true;
            }
        }
      } else {
        // Tolerance exceeded or switched to a new real target
        // Reset and switch
        state.activeTarget = hitTarget;
        state.startTime = now;
        state.lastSeenTime = now;
        state.isSelected = false;
        setDwellProgress(0);
      }
    }

    // Update UI state for currently focused element (visual feedback)
    // We want to show what the logic thinks is "focused" (activeTarget)
    setFocusedId(state.activeTarget);
  }, [triggerSelection]);

  const handleGazeUpdate = useCallback((x: number, y: number) => {
    setGazePos({ x, y });

    // Hit testing
    // We need to hide the gaze cursor from hit testing,
    // but elementFromPoint usually ignores 'pointer-events: none' elements.
    const element = document.elementFromPoint(x, y);
    const targetId = (element as HTMLElement)?.closest('[data-gaze-target]')?.getAttribute('data-id') || null;

    updateDwell(targetId);
  }, [updateDwell]);


  const handleScriptLoad = () => {
    const webgazer = window.webgazer;
    if (webgazer) {
      webgazer.setGazeListener((data: WebGazerData | null) => {
        if (data == null) {
          return;
        }

        handleGazeUpdate(data.x, data.y);
      }).begin();

      // Turn off video preview to save space if needed, or keep it for debugging.
      webgazer.showVideoPreview(true);
      webgazer.showPredictionPoints(false); // We will draw our own cursor

      setIsWebGazerReady(true);
      addLog("WebGazer initialized");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        // Check if window is defined (it should be in client component but safer)
        if (typeof window !== 'undefined' && window.webgazer) {
            window.webgazer.end();
        }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans">
      <Script
        src="https://webgazer.cs.brown.edu/webgazer.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <h1 className="text-2xl font-bold mb-8">Gaze Control Prototype</h1>

      {/* Canvas Area */}
      <div
        className={cn(
            "w-[800px] h-[400px] bg-white border-2 rounded-xl shadow-sm mb-8 relative transition-colors duration-300",
            focusedId === 'canvas' ? "border-blue-500 shadow-lg" : "border-gray-200"
        )}
        data-gaze-target
        data-id="canvas"
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
          Canvas Area (Look here)
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
        {(['brush', 'eraser', 'red', 'blue', 'undo'] as const).map((tool) => (
          <button
            key={tool}
            data-gaze-target
            data-id={tool}
            className={cn(
              "w-24 h-24 rounded-lg flex flex-col items-center justify-center text-lg font-medium transition-all relative overflow-hidden",
              selectedTool === tool ? "bg-blue-100 text-blue-900 border-2 border-blue-500" : "bg-gray-100 text-gray-600 border-2 border-transparent",
              focusedId === tool && "scale-105"
            )}
          >
             {/* Dwell Progress Indicator (Border or Background fill) */}
             {focusedId === tool && !stateRef.current.isSelected && (
                <div
                    className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-75 ease-linear"
                    style={{ width: `${dwellProgress * 100}%` }}
                />
             )}

             {/* Circular progress overlay */}
              {focusedId === tool && !stateRef.current.isSelected && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                      <rect
                        width="100%"
                        height="100%"
                        fill={selectedTool === tool ? "blue" : "gray"}
                        className="origin-bottom transform transition-transform duration-75 ease-linear"
                        style={{ transform: `scaleY(${dwellProgress})` }}
                       />
                  </svg>
              )}

             <span className="z-10 capitalize">{tool}</span>
          </button>
        ))}
      </div>

      {/* Gaze Cursor */}
      {gazePos && (
        <div
            className="fixed w-6 h-6 rounded-full border-2 border-red-500 bg-red-500/30 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out"
            style={{ left: gazePos.x, top: gazePos.y }}
        />
      )}

      {/* Debug Overlay */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono w-64 pointer-events-none">
        <div className="mb-2 font-bold border-b border-gray-600 pb-1">Debug Info</div>
        <div>Focused: {focusedId || 'None'}</div>
        <div>Dwell: {(dwellProgress * 100).toFixed(0)}%</div>
        <div>Selected: {selectedTool || 'None'}</div>
        <div>Gaze: {gazePos ? `${Math.round(gazePos.x)}, ${Math.round(gazePos.y)}` : 'N/A'}</div>
        <div className="mt-2 border-t border-gray-600 pt-1 text-gray-400">
            {debugLog.map((log, i) => (
                <div key={i}>{log}</div>
            ))}
        </div>
      </div>

      {!isWebGazerReady && (
        <div className="fixed inset-0 bg-white/80 z-[60] flex items-center justify-center">
            <div className="text-xl">Loading WebGazer...</div>
        </div>
      )}
    </div>
  );
}
