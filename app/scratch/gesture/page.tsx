'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { Trash2 } from 'lucide-react';

// Types for MediaPipe Hands (simplified)
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

// Global declaration
declare global {
  interface Window {
    Hands: new (config: { locateFile: (file: string) => string }) => Hands;
  }
}

// Types
type Point = { x: number; y: number };

const COLORS = [
  '#000000', // Black
  '#EF4444', // Red-500
  '#3B82F6', // Blue-500
  '#22C55E', // Green-500
  '#EAB308', // Yellow-500
  '#A855F7', // Purple-500
  '#EC4899', // Pink-500
  '#FFFFFF', // White
];

const SMOOTHING_FACTOR = 0.2; // 0 to 1 (higher = less smoothing)
const DROPOUT_THRESHOLD_MS = 200; // Time in ms to wait before breaking the stroke

export default function GesturePaintingPage() {
  // UI State
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

  // Debug State
  const [isHandDetected, setIsHandDetected] = useState<boolean>(false);
  const [fingertipCoords, setFingertipCoords] = useState<{x: number, y: number} | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isCameraRunningRef = useRef<boolean>(false);

  // Drawing State Refs (mutable to avoid re-renders in loop)
  const lastPositionRef = useRef<Point | null>(null);
  const currentPositionRef = useRef<Point | null>(null); // Smoothed position
  const lastDetectionTimeRef = useRef<number>(0);
  const isDrawingRef = useRef<boolean>(false);

  // State refs for access inside callbacks
  const selectedColorRef = useRef(selectedColor);
  const brushSizeRef = useRef(brushSize);

  useEffect(() => {
    selectedColorRef.current = selectedColor;
  }, [selectedColor]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  // Resize canvas handler
  const resizeCanvas = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      // Only resize if dimensions changed significantly to avoid clearing
      if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
        // Save content if needed, but for now we might clear on resize which is standard
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx?.drawImage(canvasRef.current, 0, 0);

        canvasRef.current.width = width;
        canvasRef.current.height = height;

        // Restore content
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
           ctx.drawImage(tempCanvas, 0, 0, width, height);
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // MediaPipe Setup
  const onResults = useCallback((results: Results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for hand
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexFingerTip = landmarks[8]; // Index 8 is Index Finger Tip

      setIsHandDetected(true);

      // Update Detection Time
      lastDetectionTimeRef.current = Date.now();
      isDrawingRef.current = true;

      // Calculate coordinates (normalized 0-1 -> pixel coords)
      // Mirror X because webcam is mirrored
      const rawX = (1 - indexFingerTip.x) * canvas.width;
      const rawY = indexFingerTip.y * canvas.height;

      setFingertipCoords({ x: Math.round(rawX), y: Math.round(rawY) });

      // Smoothing
      if (!currentPositionRef.current) {
        currentPositionRef.current = { x: rawX, y: rawY };
        lastPositionRef.current = { x: rawX, y: rawY };
      } else {
        // Low-pass filter
        const smoothX = currentPositionRef.current.x + (rawX - currentPositionRef.current.x) * SMOOTHING_FACTOR;
        const smoothY = currentPositionRef.current.y + (rawY - currentPositionRef.current.y) * SMOOTHING_FACTOR;

        lastPositionRef.current = currentPositionRef.current;
        currentPositionRef.current = { x: smoothX, y: smoothY };
      }

      // Draw
      if (lastPositionRef.current && currentPositionRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
        ctx.lineTo(currentPositionRef.current.x, currentPositionRef.current.y);

        // Style
        ctx.strokeStyle = selectedColorRef.current;
        ctx.lineWidth = brushSizeRef.current;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.stroke();
      }

    } else {
      setIsHandDetected(false);

      // Heuristic for dropouts
      if (isDrawingRef.current) {
        const timeSinceLastDetect = Date.now() - lastDetectionTimeRef.current;
        if (timeSinceLastDetect > DROPOUT_THRESHOLD_MS) {
          isDrawingRef.current = false;
          lastPositionRef.current = null;
          currentPositionRef.current = null;
        }
        // Else: we assume it's a dropout, we just don't update positions, effectively "pausing" the stroke
        // until the hand reappears.
      } else {
          lastPositionRef.current = null;
          currentPositionRef.current = null;
      }
    }
  }, []); // Dependencies are refs, so we can keep this stable

  useEffect(() => {
    if (!isScriptLoaded) return;

    // Initialize Hands
    const hands = new window.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
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

      if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
         await handsRef.current.send({ image: videoRef.current });
      }

      if (isCameraRunningRef.current) {
         animationFrameIdRef.current = requestAnimationFrame(sendFrame);
      }
    };

    const startCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          isCameraRunningRef.current = true;
          setIsCameraActive(true);
          sendFrame();
        };
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please allow camera permissions.");
      }
    };

    startCamera();

    // Capture the current ref value for cleanup
    const currentVideoRef = videoRef.current;

    return () => {
      isCameraRunningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      // Stop tracks
      if (currentVideoRef && currentVideoRef.srcObject) {
        const stream = currentVideoRef.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      if (handsRef.current) {
        // handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, [isScriptLoaded, onResults]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">Gesture Paint</h1>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">Prototype</span>
          </div>

          <div className="flex items-center gap-6">
             {/* Colors */}
             <div className="flex items-center gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Size</span>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-24 cursor-pointer accent-blue-600"
              />
              <span className="text-xs text-gray-500 w-6">{brushSize}px</span>
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            {/* Clear */}
            <button
              onClick={clearCanvas}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4 bg-dot-pattern">

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="relative w-full max-w-5xl aspect-[4/3] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Instructions Overlay */}
          {!isCameraActive && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <div className="text-center">
                    <p className="text-gray-500 animate-pulse mb-2">
                        {isScriptLoaded ? 'Initializing Camera...' : 'Loading MediaPipe...'}
                    </p>
                    {!isScriptLoaded && <p className="text-xs text-gray-400">Please wait for scripts to load</p>}
                </div>
             </div>
          )}
        </div>

        {/* Debug Panel */}
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 w-64 text-sm z-20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Debug Info</h3>
            <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Hand Detected:</span>
              <span className={`font-mono font-bold ${isHandDetected ? 'text-green-600' : 'text-red-500'}`}>
                {isHandDetected ? 'YES' : 'NO'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Brush Coords:</span>
              <span className="font-mono text-gray-700">
                {fingertipCoords
                  ? `${fingertipCoords.x}, ${fingertipCoords.y}`
                  : '--, --'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Video Feed / Preview */}
        <video
          ref={videoRef}
          className="fixed bottom-4 left-4 w-48 h-auto rounded-lg border-2 border-white shadow-lg z-50 scale-x-[-1]"
          playsInline
          muted
        />

      </main>
    </div>
  );
}
