'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface NoiseCanvasProps {
  seed: string;
  className?: string;
}

function NoiseCanvas({ seed, className }: NoiseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Generate seeded random noise (simple simulation)
    // We use the seed string to simply generate different "random" patterns
    // For a true seeded random, we'd need a PRNG, but for this visual prototype,
    // we can just use Math.random() inside the effect which triggers on seed change.
    // The 'seed' prop dependency ensures this runs when the ID changes.

    // Create random rectangles/patterns
    const numShapes = 20 + Math.floor(Math.random() * 30);

    // Fill background
    ctx.fillStyle = `hsl(${Math.random() * 360}, 20%, 90%)`;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < numShapes; i++) {
      ctx.fillStyle = `hsla(${Math.random() * 360}, ${50 + Math.random() * 50}%, ${40 + Math.random() * 40}%, ${Math.random() * 0.5})`;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = Math.random() * (width / 2);
      const h = Math.random() * (height / 2);
      ctx.fillRect(x, y, w, h);
    }

    // Add some noise texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

  }, [seed]);

  return (
    <canvas
      ref={canvasRef}
      width={512}
      height={512}
      className={`w-full h-auto aspect-square rounded-md border border-border bg-muted ${className}`}
    />
  );
}

export default function ImaginePage() {
  // Using timestamps or random strings as IDs to trigger regeneration
  const [leftImageId, setLeftImageId] = useState<string>('init-left');
  const [rightImageId, setRightImageId] = useState<string>('init-right');

  const generateNewId = () => Math.random().toString(36).substring(7);

  const handleRepaintBoth = () => {
    setLeftImageId(generateNewId());
    setRightImageId(generateNewId());
  };

  const handleMoreLikeLeft = () => {
    // In a real app, this would send the leftImageId to the backend as a reference
    // For now, we just regenerate both
    setLeftImageId(generateNewId());
    setRightImageId(generateNewId());
  };

  const handleMoreLikeRight = () => {
    // In a real app, this would send the rightImageId to the backend as a reference
    // For now, we just regenerate both
    setLeftImageId(generateNewId());
    setRightImageId(generateNewId());
  };

  return (
    <main className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col items-center gap-6">

        {/* Header / Repaint Section */}
        <div className="flex flex-col items-center gap-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Imagine</h1>
          <Button
            onClick={handleRepaintBoth}
            size="lg"
            className="font-semibold"
          >
            Repaint Both
          </Button>
        </div>

        {/* Images Container */}
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8 justify-center">

          {/* Left Image Column */}
          <div className="flex-1 flex flex-col gap-4 items-center">
            <div className="w-full relative group">
                <NoiseCanvas seed={leftImageId} />
            </div>
            <Button
              variant="secondary"
              onClick={handleMoreLikeLeft}
              className="w-full md:w-auto"
            >
              More like this one
            </Button>
          </div>

          {/* Right Image Column */}
          <div className="flex-1 flex flex-col gap-4 items-center">
            <div className="w-full relative group">
                <NoiseCanvas seed={rightImageId} />
            </div>
            <Button
              variant="secondary"
              onClick={handleMoreLikeRight}
              className="w-full md:w-auto"
            >
              More like this one
            </Button>
          </div>

        </div>
      </div>
    </main>
  );
}
