import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface CalibrationOverlayProps {
  onComplete: () => void;
  onCancel: () => void;
}

const POINTS = [
  { id: 'tl', x: '10%', y: '10%' },
  { id: 'tc', x: '50%', y: '10%' },
  { id: 'tr', x: '90%', y: '10%' },
  { id: 'ml', x: '10%', y: '50%' },
  { id: 'mc', x: '50%', y: '50%' },
  { id: 'mr', x: '90%', y: '50%' },
  { id: 'bl', x: '10%', y: '90%' },
  { id: 'bc', x: '50%', y: '90%' },
  { id: 'br', x: '90%', y: '90%' },
];

const CLICKS_REQUIRED = 5;

export function CalibrationOverlay({ onComplete, onCancel }: CalibrationOverlayProps) {
  const [activePointIndex, setActivePointIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  const handlePointClick = useCallback(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= CLICKS_REQUIRED) {
      if (activePointIndex < POINTS.length - 1) {
        setClickCount(0);
        setActivePointIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    }
  }, [clickCount, activePointIndex, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-white">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-8 text-center pointer-events-none w-full">
        <h2 className="text-2xl font-bold mb-2">Eye Calibration</h2>
        <p className="text-gray-300">
          Click the circle {CLICKS_REQUIRED - clickCount} more times while looking at it.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Point {activePointIndex + 1} of {POINTS.length}
        </p>
      </div>

      {POINTS.map((point, index) => {
        const isActive = index === activePointIndex;
        // We render all points but hide inactive ones to keep DOM stable if needed,
        // but cleaner to just render active or render placeholders.
        // Let's render "done" points as small green dots for context
        if (index < activePointIndex) {
            return (
                <div
                    key={point.id}
                    className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-green-500 opacity-50"
                    style={{ left: point.x, top: point.y }}
                />
            )
        }

        if (!isActive) return null;

        return (
          <button
            key={point.id}
            className={cn(
              "absolute w-8 h-8 -ml-4 -mt-4 rounded-full transition-all duration-100",
              "border-4 border-white cursor-pointer",
               // Visual feedback
               clickCount > 0 ? "bg-yellow-400 scale-110" : "bg-red-500",
               "active:scale-95"
            )}
            style={{ left: point.x, top: point.y }}
            onClick={handlePointClick}
          >
             {/* Progress fill */}
             <div
                className="absolute inset-0 rounded-full bg-green-500 transition-all duration-300"
                style={{
                    transform: `scale(${clickCount / CLICKS_REQUIRED})`,
                    opacity: clickCount > 0 ? 1 : 0
                }}
             />
          </button>
        );
      })}
    </div>
  );
}
