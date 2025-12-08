import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from '../types';

// Types for MediaPipe Hands
interface Results {
  multiHandLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
  multiHandedness: Array<unknown>;
  image: unknown;
}

interface Hands {
  setOptions(options: unknown): void;
  onResults(callback: (results: Results) => void): void;
  send(input: { image: HTMLVideoElement }): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    Hands: new (config: { locateFile: (file: string) => string }) => Hands;
  }
}

const SMOOTHING_FACTOR = 0.2;
const DROPOUT_THRESHOLD_MS = 200;

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  stateRef: React.RefObject<AppState>
) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [fingertipCoords, setFingertipCoords] = useState<{ x: number; y: number } | null>(null);

  const handsRef = useRef<Hands | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isCameraRunningRef = useRef(false);

  // Drawing State Refs
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const currentPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastDetectionTimeRef = useRef(0);
  const isDrawingRef = useRef(false);

  // Load Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onResults = useCallback((results: Results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We only draw if we are in Paint mode
    const currentState = stateRef.current;
    const isPaintMode = currentState.mode === 'Paint';

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexFingerTip = landmarks[8];

      setIsHandDetected(true);
      lastDetectionTimeRef.current = Date.now();
      isDrawingRef.current = true;

      // Calculate pixel coordinates (Mirror X)
      const rawX = (1 - indexFingerTip.x) * canvas.width;
      const rawY = indexFingerTip.y * canvas.height;

      setFingertipCoords({ x: Math.round(rawX), y: Math.round(rawY) });

      // Smoothing
      if (!currentPositionRef.current) {
        currentPositionRef.current = { x: rawX, y: rawY };
        lastPositionRef.current = { x: rawX, y: rawY };
      } else {
        const smoothX = currentPositionRef.current.x + (rawX - currentPositionRef.current.x) * SMOOTHING_FACTOR;
        const smoothY = currentPositionRef.current.y + (rawY - currentPositionRef.current.y) * SMOOTHING_FACTOR;

        lastPositionRef.current = currentPositionRef.current;
        currentPositionRef.current = { x: smoothX, y: smoothY };
      }

      // Draw if in Paint mode
      if (isPaintMode && lastPositionRef.current && currentPositionRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
        ctx.lineTo(currentPositionRef.current.x, currentPositionRef.current.y);

        ctx.strokeStyle = currentState.activeTool === 'eraser' ? '#ffffff' : currentState.activeColor;
        ctx.lineWidth = currentState.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.stroke();
      }

    } else {
      setIsHandDetected(false);
      if (isDrawingRef.current) {
         const timeSinceLastDetect = Date.now() - lastDetectionTimeRef.current;
         if (timeSinceLastDetect > DROPOUT_THRESHOLD_MS) {
            isDrawingRef.current = false;
            lastPositionRef.current = null;
            currentPositionRef.current = null;
         }
      } else {
         lastPositionRef.current = null;
         currentPositionRef.current = null;
      }
    }
  }, [canvasRef, stateRef]);

  // Initialize MediaPipe and Camera
  useEffect(() => {
    if (!isScriptLoaded || !videoRef.current) return;

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    const sendFrame = async () => {
       if (!isCameraRunningRef.current || !videoRef.current || !handsRef.current) return;
       // Only send if video has data
       if (videoRef.current.readyState >= 2) {
          await handsRef.current.send({ image: videoRef.current });
       }
       if (isCameraRunningRef.current) {
          animationFrameIdRef.current = requestAnimationFrame(sendFrame);
       }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
           videoRef.current.srcObject = stream;
           videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              isCameraRunningRef.current = true;
              sendFrame();
           };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    // Capture ref for cleanup
    const currentVideoRef = videoRef.current;

    return () => {
      isCameraRunningRef.current = false;
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (currentVideoRef?.srcObject) {
        (currentVideoRef.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      // handsRef.current?.close(); // Optional, sometimes causes errors on fast unmounts
    };
  }, [isScriptLoaded, onResults, videoRef]);

  return { isScriptLoaded, isHandDetected, fingertipCoords };
}
