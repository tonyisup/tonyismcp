'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface GenerativeCanvasHandle {
  getCanvasData: () => string; // Returns Data URL
}

interface GenerativeCanvasProps {
  seed: string;
  loading?: boolean;
  className?: string;
}

const GenerativeCanvas = forwardRef<GenerativeCanvasHandle, GenerativeCanvasProps>(
  ({ seed, loading, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvasData: () => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL('image/png');
        }
        return '';
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Deterministic PRNG based on seed for consistent repaints if seed doesn't change
      // Simple hash function for demo purposes
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
      }
      const random = () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
      };

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = `hsl(${random() * 360}, 20%, 90%)`;
      ctx.fillRect(0, 0, width, height);

      // Draw Shapes
      const numShapes = 20 + Math.floor(random() * 30);
      for (let i = 0; i < numShapes; i++) {
        ctx.fillStyle = `hsla(${random() * 360}, ${50 + random() * 50}%, ${40 + random() * 40}%, ${random() * 0.8})`;

        // Randomize shape type: 0=rect, 1=circle
        if (random() > 0.5) {
            const x = random() * width;
            const y = random() * height;
            const w = random() * (width / 2);
            const h = random() * (height / 2);
            ctx.fillRect(x, y, w, h);
        } else {
             ctx.beginPath();
             const x = random() * width;
             const y = random() * height;
             const r = random() * (width / 4);
             ctx.arc(x, y, r, 0, 2 * Math.PI);
             ctx.fill();
        }
      }

      // Add noise texture
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (random() - 0.5) * 30;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

    }, [seed]);

    return (
      <div className={`relative ${className}`}>
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className="w-full h-auto aspect-square rounded-md border border-border bg-muted"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    );
  }
);

GenerativeCanvas.displayName = 'GenerativeCanvas';

export default GenerativeCanvas;
