import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Action } from '../types';

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
            // WebGazer stores data in localforage usually.
            // webgazer.clearData() helps but sometimes a full reset is needed.
            // For now, let's assume webgazer.clearData() exists or we just rely on new clicks.
            // Actually, WebGazer documentation says 'webgazer.clearData()' clears the regression data.
            try {
                // Check if the function exists
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
        dwellProgress,
        setRegressionModel,
        clearCalibrationData
    };
}
