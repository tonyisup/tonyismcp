'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import GenerativeCanvas, { GenerativeCanvasHandle } from './generative-canvas';
import { generateImage, generateVariations } from './simulation';
import { Home, Plus, MoreVertical } from 'lucide-react'; // Using lucid-react icons as per memory/context

export default function ImaginePage() {
  const [leftImageId, setLeftImageId] = useState<string>('init-left');
  const [rightImageId, setRightImageId] = useState<string>('init-right');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const leftCanvasRef = useRef<GenerativeCanvasHandle>(null);
  const rightCanvasRef = useRef<GenerativeCanvasHandle>(null);

  const handleRepaintBoth = async () => {
    setIsGenerating(true);
    try {
      const [res1, res2] = await generateImage();
      setLeftImageId(res1.seed);
      setRightImageId(res2.seed);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMoreLikeLeft = async () => {
    if (!leftCanvasRef.current) return;
    setIsGenerating(true);
    try {
      const currentData = leftCanvasRef.current.getCanvasData();
      const [res1, res2] = await generateVariations(currentData);
      setLeftImageId(res1.seed);
      setRightImageId(res2.seed);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMoreLikeRight = async () => {
    if (!rightCanvasRef.current) return;
    setIsGenerating(true);
    try {
      const currentData = rightCanvasRef.current.getCanvasData();
      const [res1, res2] = await generateVariations(currentData);
      setLeftImageId(res1.seed);
      setRightImageId(res2.seed);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       {/* Navbar - mimicking the screenshot's top bar roughly for context */}
       <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon">
            <Home className="h-6 w-6" />
          </Button>

          <div className="flex-1 max-w-xl mx-4 relative">
             <div className="w-full bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground truncate">
                tonyisup.com/imagine
             </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Plus className="h-6 w-6" />
            </Button>
            <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-xs font-bold">
               28
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
       </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Imagine</h1>
          <Button
            onClick={handleRepaintBoth}
            disabled={isGenerating}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium px-6"
          >
            Repaint Both
          </Button>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">

          {/* Left Column */}
          <div className="flex flex-col items-center gap-4">
            <GenerativeCanvas
              ref={leftCanvasRef}
              seed={leftImageId}
              loading={isGenerating}
              className="w-full max-w-[512px]"
            />
            <Button
              variant="secondary"
              onClick={handleMoreLikeLeft}
              disabled={isGenerating}
              className="rounded-full px-6 text-sm font-medium bg-muted/50 hover:bg-muted text-foreground border border-border/50"
            >
              More like this one
            </Button>
          </div>

          {/* Right Column */}
          <div className="flex flex-col items-center gap-4">
            <GenerativeCanvas
              ref={rightCanvasRef}
              seed={rightImageId}
              loading={isGenerating}
              className="w-full max-w-[512px]"
            />
            <Button
              variant="secondary"
              onClick={handleMoreLikeRight}
              disabled={isGenerating}
              className="rounded-full px-6 text-sm font-medium bg-muted/50 hover:bg-muted text-foreground border border-border/50"
            >
              More like this one
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
