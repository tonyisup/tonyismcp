import { useEffect, useRef, useState, useCallback } from 'react';

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

const PINCH_THRESHOLD = 0.05; // Normalized distance threshold for pinch

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  // canvasRef removed as we don't draw anymore
) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [fingertipCoords, setFingertipCoords] = useState<{ x: number; y: number } | null>(null);
  const [isPinched, setIsPinched] = useState(false);

  const handsRef = useRef<Hands | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isCameraRunningRef = useRef(false);

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
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexFingerTip = landmarks[8];
      const thumbTip = landmarks[4];

      setIsHandDetected(true);

      // Calculate Pinch (Euclidean distance between thumb and index)
      // Since coordinates are normalized (0-1), we can use them directly or correct for aspect ratio.
      // For simple pinch detection, raw distance usually suffices.
      const dx = indexFingerTip.x - thumbTip.x;
      const dy = indexFingerTip.y - thumbTip.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      setIsPinched(distance < PINCH_THRESHOLD);

      // Optional: We can still expose fingertip coords if we want to show a cursor,
      // though the prompt implies Gaze is the primary pointer for selection.
      // But maybe useful for debug.
      // We don't have canvas dimensions here anymore, so we return normalized coords?
      // Or we can pass in window dimensions.
      // Let's return raw normalized coords or leave it null if not needed.
      // The previous implementation used canvasRef to scale.
      // Let's just return normalized 0-1.
      setFingertipCoords({ x: indexFingerTip.x, y: indexFingerTip.y });

    } else {
      setIsHandDetected(false);
      setIsPinched(false);
      setFingertipCoords(null);
    }
  }, []);

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
    };
  }, [isScriptLoaded, onResults, videoRef]);

  return { isScriptLoaded, isHandDetected, isPinched, fingertipCoords };
}
