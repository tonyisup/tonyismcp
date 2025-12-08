import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Action } from '../types';

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
  pause: () => void;
  resume: () => void;
}

declare global {
  interface Window {
    webgazer: WebGazer;
  }
}

const DWELL_THRESHOLD_MS = 800;
const FLICKER_TOLERANCE_MS = 200;

export function useGazeTracking(
    stateRef: React.RefObject<AppState>,
    dispatch: React.Dispatch<Action>
) {
  const [isGazeReady, setIsGazeReady] = useState(false);
  const [gazePos, setGazePos] = useState<{ x: number; y: number } | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);

  // Logic Loop Refs
  const logicRef = useRef({
      activeTarget: null as string | null,
      startTime: 0,
      lastSeenTime: 0,
      isSelected: false
  });

  // Handle Dwell Logic
  const updateDwell = useCallback((targetId: string | null) => {
    const now = Date.now();
    const state = logicRef.current;

    // Check if we are hovering the same target
    if (targetId === state.activeTarget) {
        state.lastSeenTime = now;

        if (state.activeTarget && !state.isSelected) {
            const elapsed = now - state.startTime;
            const progress = Math.min(elapsed / DWELL_THRESHOLD_MS, 1);
            setDwellProgress(progress);

            if (elapsed >= DWELL_THRESHOLD_MS) {
                state.isSelected = true;
                setDwellProgress(1);

                const currentMode = stateRef.current?.mode;

                // Mode Switching Logic
                if (currentMode === 'Paint') {
                    // In Paint mode, looking at the toolbar (any part of it) switches to ToolSelect
                    // We don't select the tool yet, just switch mode to expand the menu
                    if (state.activeTarget && (
                        state.activeTarget === 'toolbar-area' ||
                        state.activeTarget.startsWith('tool-') ||
                        state.activeTarget.startsWith('color-') ||
                        state.activeTarget.startsWith('action-')
                    )) {
                        dispatch({ type: 'SET_MODE', payload: 'ToolSelect', source: 'gaze' });
                    }
                } else {
                    // In ToolSelect mode, we can select items
                    if (state.activeTarget.startsWith('tool-')) {
                        const tool = state.activeTarget.replace('tool-', '');
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        dispatch({ type: 'SELECT_TOOL', payload: tool as any, source: 'gaze' });
                    } else if (state.activeTarget.startsWith('color-')) {
                        const color = state.activeTarget.replace('color-', '');
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        dispatch({ type: 'SELECT_COLOR', payload: color as any, source: 'gaze' });
                    } else if (state.activeTarget.startsWith('action-')) {
                        const action = state.activeTarget.replace('action-', '');
                        if (action === 'undo') dispatch({ type: 'UNDO', source: 'gaze' });
                        if (action === 'clear') dispatch({ type: 'CLEAR', source: 'gaze' });
                    }
                }
            }
        }
    } else {
        // Different target or null
        // Flicker tolerance
        if (state.activeTarget && (now - state.lastSeenTime < FLICKER_TOLERANCE_MS)) {
            // Ignore miss
        } else {
            // Reset
            state.activeTarget = targetId;
            state.startTime = now;
            state.lastSeenTime = now;
            state.isSelected = false;
            setDwellProgress(0);
        }
    }

    setFocusedId(state.activeTarget);

  }, [dispatch, stateRef]);


  const handleGazeUpdate = useCallback((x: number, y: number) => {
    setGazePos({ x, y });

    // Hit Testing
    // We need to find elements with data-tool-id or the toolbar area
    // Hide gaze cursor from hit test logic handled by document.elementFromPoint usually ignoring pointer-events: none
    const element = document.elementFromPoint(x, y);

    // Check for specific tool button
    const toolBtn = (element as HTMLElement)?.closest('[data-tool-id]');
    let targetId: string | null = null;

    if (toolBtn) {
        targetId = toolBtn.getAttribute('data-tool-id');
    } else {
        // Check if we are just looking at the toolbar container
        // We need the toolbar to have an ID or data attribute
        const toolbar = (element as HTMLElement)?.closest('[data-toolbar-container]');
        if (toolbar) {
            targetId = 'toolbar-area';
        }
    }

    updateDwell(targetId);
  }, [updateDwell]);


  useEffect(() => {
    // Load WebGazer
    const script = document.createElement('script');
    script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
    script.async = true;
    script.onload = () => {
        const webgazer = window.webgazer;
        if (webgazer) {
            webgazer.setGazeListener((data: WebGazerData | null) => {
                if (data) handleGazeUpdate(data.x, data.y);
            });

            // IMPORTANT: Coordinate video element
            // WebGazer by default creates its own video or uses one.
            // If we want to share, we might need to tell WebGazer to use our videoID?
            // Unfortuntely WebGazer API for "attach to existing video element" is tricky.
            // Often it's easier to let WebGazer create the video and then we grab it for MediaPipe?
            // OR we accept two video elements for now to be safe, as "Sharing" one element between two different libraries
            // (one likely resizing/reformatting it) is a recipe for conflict without a custom "Multiplexer".

            // Per instructions: "If WebGazer and MediaPipe have conflicting expectations... multiplexer... perfectly fine."
            // "If needed... prioritize smooth gesture painting."

            // Strategy: Let WebGazer run. It will access camera.
            // MediaPipe *also* accesses camera via `navigator.mediaDevices.getUserMedia`.
            // Can two streams run at once? Yes, usually.
            // However, to strictly follow "Sharing one video feed is strongly preferred":
            // We need to see if WebGazer can accept a stream or video element.
            // Looking at WebGazer docs (memory): webgazer.setVideoElementCanvas(videoElement) might exist?
            // Or we just let WebGazer handle the camera, and we pass `webgazer.getVideoElement()` to MediaPipe?

            // Let's try: WebGazer starts -> We grab its video element -> We pass to MediaPipe?
            // That would ensure 1 camera stream.

            // But for now, let's try the simple path: Two streams.
            // If that fails (permission error), we'll try to hijack one.
            // Actually, `useHandTracking` is already getting a stream.

            // Let's TRY to just run both. If it fails, I'll update the plan.
            // WebGazer puts its video in the DOM.

            webgazer.showVideoPreview(false); // We hide it, we have our own or we don't need it.
            webgazer.showPredictionPoints(false);
            webgazer.begin();
            setIsGazeReady(true);
        }
    };
    document.body.appendChild(script);

    return () => {
        if (typeof window !== 'undefined' && window.webgazer) {
            window.webgazer.end();
        }
        document.body.removeChild(script);
    }
  }, [handleGazeUpdate]);

  return { isGazeReady, gazePos, focusedId, dwellProgress };
}
