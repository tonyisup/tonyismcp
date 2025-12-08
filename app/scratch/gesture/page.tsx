'use client';

import { useRef } from 'react';

export default function ImaginePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className="w-full h-auto aspect-square rounded-md border border-border bg-muted"
        />
      </main>
    </div>
  );
}
