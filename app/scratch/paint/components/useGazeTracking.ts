import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Action } from '../types';

const FLICKER_TOLERANCE_MS = 200;

export function useGazeTracking(
    stateRef: React.RefObject<AppState>,
    dispatch: React.Dispatch<Action>
) {
    const [isGazeReady, setIsGazeReady] = useState(false);
    const [gazePos, setGazePos] = useState<{ x: number; y: number } | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(null);

    // Logic Loop Refs
    const logicRef = useRef({
        activeTarget: null as string | null,
        startTime: 0,
        lastSeenTime: 0,
    });

    // Handle Gaze Focus Logic
    // This logic determines what "Target" is currently being looked at, with some debouncing/smoothing (Flicker Tolerance)
    // It NO LONGER triggers selection automatically.
    const updateFocus = useCallback((targetId: string | null) => {
        const now = Date.now();
        const state = logicRef.current;

        // Check if we are hovering the same target
        if (targetId === state.activeTarget) {
            state.lastSeenTime = now;
        } else {
            // Different target or null
            // Flicker tolerance
            if (state.activeTarget && (now - state.lastSeenTime < FLICKER_TOLERANCE_MS)) {
                // Ignore miss (assume we are still looking at activeTarget)
            } else {
                // Reset and switch to new target
                state.activeTarget = targetId;
                state.startTime = now;
                state.lastSeenTime = now;
            }
        }

        setFocusedId(state.activeTarget);

    }, []);


    const handleGazeUpdate = useCallback((x: number, y: number) => {
        setGazePos({ x, y });

        // Hit Testing
        const element = document.elementFromPoint(x, y);

        // Check for specific tool button
        const toolBtn = (element as HTMLElement)?.closest('[data-tool-id]');
        let targetId: string | null = null;

        if (toolBtn) {
            targetId = toolBtn.getAttribute('data-tool-id');
        } else {
            const toolbar = (element as HTMLElement)?.closest('[data-toolbar-container]');
            if (toolbar) {
                targetId = 'toolbar-area';
            }
        }

        updateFocus(targetId);
    }, [updateFocus]);

    // Calibration and Configuration Methods
    const setRegressionModel = useCallback((modelName: string) => {
        if (typeof window !== 'undefined' && window.webgazer) {
            try {
                window.webgazer.setRegression(modelName);
                console.log(`WebGazer regression set to: ${modelName}`);
            } catch (e) {
                console.error("Failed to set regression model:", e);
            }
        }
    }, []);

    const clearCalibrationData = useCallback(() => {
        if (typeof window !== 'undefined' && window.webgazer) {
            try {
                if (typeof window.webgazer.clearData === 'function') {
                    window.webgazer.clearData();
                } else {
                    console.warn("webgazer.clearData() not found");
                }
            } catch (e) {
                console.error("Failed to clear data:", e);
            }
        }
    }, []);

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

                webgazer.showVideoPreview(false);
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

    return {
        isGazeReady,
        gazePos,
        focusedId,
        setRegressionModel,
        clearCalibrationData
    };
}
