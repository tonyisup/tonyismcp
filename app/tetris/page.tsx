"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTetris } from "./useTetris";
import { Play, Pause, RotateCw, ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";

export default function TetrisPage() {
  const {
    board,
    currentPiece,
    nextPiece,
    heldPiece,
    shadowPiece,
    isGameOver,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotate,
    holdPiece,
    resetGame,
    speed,
    clearingLines,
    setSpeed,
    isPaused,
    togglePause,
  } = useTetris();

  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (clearingLines.length > 0) {
      interval = setInterval(() => {
        setBlink(prev => !prev);
      }, 70); // fast flash
    } else {
      setBlink(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clearingLines]);

  // Hold-to-repeat for movement (buttons and arrow keys)
  const REPEAT_DELAY = 200;
  const REPEAT_INTERVAL = 70;
  const repeatRef = useRef<{ timeout: ReturnType<typeof setTimeout> | null; interval: ReturnType<typeof setInterval> | null }>({ timeout: null, interval: null });

  const clearRepeat = useCallback(() => {
    if (repeatRef.current.timeout) {
      clearTimeout(repeatRef.current.timeout);
      repeatRef.current.timeout = null;
    }
    if (repeatRef.current.interval) {
      clearInterval(repeatRef.current.interval);
      repeatRef.current.interval = null;
    }
  }, []);

  // Refs for touch handlers that need passive: false (React can't set that, so we attach manually)
  const controlsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef({ moveLeft, moveRight, moveDown });
  actionsRef.current = { moveLeft, moveRight, moveDown };

  const startRepeat = useCallback((actionKey: "moveLeft" | "moveRight" | "moveDown") => {
    if (isGameOver || isPaused) return;
    clearRepeat();
    actionsRef.current[actionKey]();
    repeatRef.current.timeout = setTimeout(() => {
      repeatRef.current.timeout = null;
      repeatRef.current.interval = setInterval(() => {
        actionsRef.current[actionKey]();
      }, REPEAT_INTERVAL);
    }, REPEAT_DELAY);
  }, [isGameOver, isPaused, clearRepeat]);

  useEffect(() => {
    const el = controlsRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const moveEl = (e.target as Element).closest("[data-move]");
      if (!moveEl) return;
      const move = (moveEl as HTMLElement).dataset.move;
      const key = move === "left" ? "moveLeft" : move === "right" ? "moveRight" : move === "down" ? "moveDown" : null;
      if (!key) return;
      e.preventDefault(); // only works with passive: false
      startRepeat(key as "moveLeft" | "moveRight" | "moveDown");
    };

    const handleTouchEnd = () => clearRepeat();
    const handleTouchCancel = () => clearRepeat();

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    el.addEventListener("touchcancel", handleTouchCancel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [startRepeat, clearRepeat]);

  // Handle keyboard controls (with hold-to-repeat for arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || isPaused) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          startRepeat("moveLeft");
          break;
        case "ArrowRight":
          e.preventDefault();
          startRepeat("moveRight");
          break;
        case "ArrowDown":
          e.preventDefault();
          startRepeat("moveDown");
          break;
        case "ArrowUp":
        case "x":
          rotate();
          break;
        case " ":
          e.preventDefault(); // Prevent scrolling
          hardDrop();
          break;
        case "Shift":
        case "c":
        case "C":
          holdPiece();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown") {
        clearRepeat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop, holdPiece, isGameOver, isPaused, startRepeat, clearRepeat]);

  // Clean up repeat on unmount
  useEffect(() => {
    return () => clearRepeat();
  }, [clearRepeat]);

  // Render board cell
  const renderCell = (value: number | string, x: number, y: number) => {
    // Determine cell color
    let bgColor = "bg-zinc-800"; // Empty
    let borderColor = "border-zinc-900";

    // Check if cell is part of current piece
    const isCurrentPiece = currentPiece?.shape.some((row, dy) =>
      row.some((val, dx) => val && currentPiece.y + dy === y && currentPiece.x + dx === x)
    );

    // Check if cell is part of shadow
    const isShadow = !isCurrentPiece && shadowPiece?.shape.some((row, dy) =>
      row.some((val, dx) => val && shadowPiece.y + dy === y && shadowPiece.x + dx === x)
    );

    const isClearing = clearingLines.includes(y);

    if (isClearing && blink) {
      bgColor = "bg-zinc-100";
      borderColor = "border-zinc-300";
    } else if (isCurrentPiece) {
      bgColor = currentPiece!.color;
      borderColor = "border-white/20";
    } else if (isShadow) {
      bgColor = "bg-zinc-700/50";
      borderColor = currentPiece!.color.replace("bg-", "border-");
    } else if (value) {
      // It's a locked block
      bgColor = value as string;
      borderColor = "border-black/30";
    }

    return (
      <div
        key={`${x}-${y}`}
        className={`w-full h-full border ${borderColor} ${bgColor} ${isCurrentPiece || value ? 'shadow-[inset_2px_2px_rgba(255,255,255,0.2),inset_-2px_-2px_rgba(0,0,0,0.2)]' : ''}`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-mono flex flex-col items-center py-4 px-3 md:py-8 md:px-4 selection:bg-zinc-800 landscape-short:flex-row landscape-short:justify-center landscape-short:py-1 landscape-short:px-2 landscape-short:gap-4 landscape-short:items-stretch">
      <div className="max-w-md w-full mb-3 md:mb-6 text-center landscape-short:hidden">
        <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-zinc-100 uppercase mb-1 md:mb-2">Relaxed Tetris</h1>
        <p className="text-xs md:text-sm text-zinc-500 mb-2 md:mb-4">No Score. No Levels. Just Blocks.</p>

        <div className="flex justify-between items-center bg-zinc-900 p-2 md:p-3 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-zinc-500">Speed:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-24 accent-zinc-500"
            />
          </div>
          <button
            type="button"
            onClick={togglePause}
            className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-center md:items-start justify-center w-full max-w-2xl landscape-short:flex-row landscape-short:w-auto landscape-short:items-center">
        {/* Mobile Landscape Left Controls - only visible on mobile landscape */}
        <div
          className="hidden landscape-short:flex flex-col gap-2 w-16 z-10 touch-none select-none"
          role="group"
          aria-label="Landscape Movement controls"
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
        >
          <div
            data-move="left"
            role="button"
            tabIndex={0}
            aria-label="Move Left"
            onMouseDown={() => startRepeat("moveLeft")}
            onMouseUp={clearRepeat}
            onMouseLeave={clearRepeat}
            onTouchStart={(e) => { e.preventDefault(); startRepeat("moveLeft"); }}
            onTouchEnd={clearRepeat}
            onTouchCancel={clearRepeat}
            className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-3 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1 cursor-pointer select-none mb-1"
          >
            <ArrowLeft size={20} />
          </div>
          <div
            data-move="right"
            role="button"
            tabIndex={0}
            aria-label="Move Right"
            onMouseDown={() => startRepeat("moveRight")}
            onMouseUp={clearRepeat}
            onMouseLeave={clearRepeat}
            onTouchStart={(e) => { e.preventDefault(); startRepeat("moveRight"); }}
            onTouchEnd={clearRepeat}
            onTouchCancel={clearRepeat}
            className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-3 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1 cursor-pointer select-none mb-1"
          >
            <ArrowRight size={20} />
          </div>
          <div
            data-move="down"
            role="button"
            tabIndex={0}
            aria-label="Move Down"
            onMouseDown={() => startRepeat("moveDown")}
            onMouseUp={clearRepeat}
            onMouseLeave={clearRepeat}
            onTouchStart={(e) => { e.preventDefault(); startRepeat("moveDown"); }}
            onTouchEnd={clearRepeat}
            onTouchCancel={clearRepeat}
            className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-3 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1 cursor-pointer select-none"
          >
            <ArrowDown size={20} />
          </div>
        </div>

        {/* Mobile Top Controls (Next/Hold) - only visible on small screens */}
        <div className="flex md:hidden w-full max-w-full justify-between mt-1 px-0 landscape-short:hidden">
          <div className="flex flex-col gap-1 w-20 z-10">
            <div className="text-[10px] text-center uppercase text-zinc-600 font-bold">Stash</div>
            <button
              type="button"
              onClick={() => { if (!isGameOver && !isPaused) holdPiece(); }}
              className="bg-zinc-900 border border-zinc-800 h-16 w-16 mx-auto grid place-items-center rounded shadow-md cursor-pointer hover:bg-zinc-800 active:bg-zinc-700 transition-colors touch-manipulation"
              aria-label="Stash piece"
            >
              {heldPiece && (
                <div
                  className="grid pointer-events-none"
                  style={{
                    gridTemplateColumns: `repeat(${heldPiece.shape[0].length}, 1fr)`,
                    width: `${heldPiece.shape[0].length * 10}px`,
                    gap: '1px'
                  }}
                >
                  {heldPiece.shape.map((row, y) =>
                    row.map((val, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`w-2.5 h-2.5 ${val ? heldPiece.color : 'bg-transparent'}`}
                      />
                    ))
                  )}
                </div>
              )}
            </button>
          </div>
          <div className="flex flex-col gap-1 w-20 z-10">
            <div className="text-[10px] text-center uppercase text-zinc-600 font-bold">Next</div>
            <div className="bg-zinc-900 border border-zinc-800 h-16 w-16 mx-auto grid place-items-center rounded shadow-md">
              {nextPiece && (
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)`,
                    width: `${nextPiece.shape[0].length * 10}px`,
                    gap: '1px'
                  }}
                >
                  {nextPiece.shape.map((row, y) =>
                    row.map((val, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`w-2.5 h-2.5 ${val ? nextPiece.color : 'bg-transparent'}`}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left column - Hold */}
        <div className="hidden md:flex landscape-short:hidden flex-col gap-2 w-24">
          <div className="text-xs text-center uppercase tracking-widest text-zinc-500 font-bold">Stash</div>
          <button
            type="button"
            onClick={() => { if (!isGameOver && !isPaused) holdPiece(); }}
            className="bg-zinc-900 border-2 border-zinc-800 w-24 h-24 p-2 grid place-items-center rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
            aria-label="Stash piece"
          >
            {heldPiece && (
              <div
                className="grid pointer-events-none"
                style={{
                  gridTemplateColumns: `repeat(${heldPiece.shape[0].length}, 1fr)`,
                  width: `${heldPiece.shape[0].length * 16}px`,
                  gap: '1px'
                }}
              >
                {heldPiece.shape.map((row, y) =>
                  row.map((val, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`w-4 h-4 ${val ? `${heldPiece.color} shadow-[inset_1px_1px_rgba(255,255,255,0.2),inset_-1px_-1px_rgba(0,0,0,0.2)]` : 'bg-transparent'}`}
                    />
                  ))
                )}
              </div>
            )}
          </button>
        </div>

        {/* Main Board */}
        <div className="relative mt-1 md:mt-0 w-full flex justify-center">
          <div className="bg-zinc-900 border-2 md:border-4 border-zinc-800 p-1 rounded-sm shadow-2xl">
            <div
              className="grid bg-zinc-950 w-[min(94vw,340px)] h-[min(58vh,520px)] md:w-[min(80vw,300px)] md:h-[min(160vw,600px)] landscape-short:w-[min(35vw,160px)] landscape-short:h-[min(85vh,320px)]"
              style={{
                gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
                gap: '1px'
              }}
            >
              {board.map((row, y) =>
                row.map((val, x) => renderCell(val, x, y))
              )}
            </div>
          </div>

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-sm z-10 border-4 border-transparent">
              <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg shadow-2xl">
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">Board Full</h2>
                <p className="text-zinc-400 mb-6 text-sm">Take a breath. Ready to go again?</p>
                <button
                  type="button"
                  onClick={resetGame}
                  className="px-6 py-3 bg-zinc-200 text-zinc-900 font-bold rounded hover:bg-white transition-colors uppercase tracking-wider text-sm w-full"
                >
                  Restart
                </button>
              </div>
            </div>
          )}

          {/* Paused Overlay */}
          {isPaused && !isGameOver && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-sm z-10">
              <h2 className="text-2xl font-bold text-zinc-300 tracking-widest uppercase mb-4">Paused</h2>
              <button
                type="button"
                onClick={togglePause}
                className="px-6 py-2 border-2 border-zinc-500 text-zinc-300 font-bold rounded hover:bg-zinc-800 transition-colors uppercase text-sm"
              >
                Resume
              </button>
            </div>
          )}
        </div>

        {/* Mobile Landscape Right Controls - only visible on mobile landscape */}
        <div className="hidden landscape-short:flex flex-col gap-2 w-16 z-10 touch-none select-none justify-between h-[min(85vh,320px)]">
          <div className="flex flex-col gap-1 w-full z-10">
            <div className="text-[10px] text-center uppercase text-zinc-600 font-bold">Stash</div>
            <button
              type="button"
              onClick={() => { if (!isGameOver && !isPaused) holdPiece(); }}
              className="bg-zinc-900 border border-zinc-800 h-12 w-full mx-auto grid place-items-center rounded shadow-md cursor-pointer hover:bg-zinc-800 active:bg-zinc-700 transition-colors touch-manipulation"
              aria-label="Stash piece"
            >
              {heldPiece && (
                <div
                  className="grid pointer-events-none"
                  style={{
                    gridTemplateColumns: `repeat(${heldPiece.shape[0].length}, 1fr)`,
                    width: `${heldPiece.shape[0].length * 6}px`,
                    gap: '1px'
                  }}
                >
                  {heldPiece.shape.map((row, y) =>
                    row.map((val, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`w-1.5 h-1.5 ${val ? heldPiece.color : 'bg-transparent'}`}
                      />
                    ))
                  )}
                </div>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={rotate}
            className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-3 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1 w-full"
            aria-label="Rotate"
          >
            <RotateCw size={20} />
          </button>

          <div className="flex flex-col gap-1 w-full z-10">
            <div className="text-[10px] text-center uppercase text-zinc-600 font-bold">Next</div>
            <div className="bg-zinc-900 border border-zinc-800 h-12 w-full mx-auto grid place-items-center rounded shadow-md">
              {nextPiece && (
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)`,
                    width: `${nextPiece.shape[0].length * 6}px`,
                    gap: '1px'
                  }}
                >
                  {nextPiece.shape.map((row, y) =>
                    row.map((val, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`w-1.5 h-1.5 ${val ? nextPiece.color : 'bg-transparent'}`}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={togglePause}
            className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors w-full flex justify-center"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>

        {/* Right column - Next */}
        <div className="hidden md:flex landscape-short:hidden flex-col gap-2 w-24">
          <div className="text-xs text-center uppercase tracking-widest text-zinc-500 font-bold">Next</div>
          <div className="bg-zinc-900 border-2 border-zinc-800 w-24 h-24 p-2 grid place-items-center rounded-lg">
            {nextPiece && (
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)`,
                  width: `${nextPiece.shape[0].length * 16}px`,
                  gap: '1px'
                }}
              >
                {nextPiece.shape.map((row, y) =>
                  row.map((val, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`w-4 h-4 ${val ? `${nextPiece.color} shadow-[inset_1px_1px_rgba(255,255,255,0.2),inset_-1px_-1px_rgba(0,0,0,0.2)]` : 'bg-transparent'}`}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Controls Bottom - touch uses passive: false so preventDefault stops long-press haptics */}
      <div
        ref={controlsRef}
        role="group"
        aria-label="Movement controls"
        onContextMenu={(e) => e.preventDefault()}
        className="select-none touch-none mt-4 md:mt-8 flex justify-between gap-2 w-full max-w-md px-0 md:px-2 landscape-short:hidden"
        style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
      >
        <div
          data-move="left"
          role="button"
          tabIndex={0}
          aria-label="Move Left"
          onMouseDown={() => startRepeat("moveLeft")}
          onMouseUp={clearRepeat}
          onMouseLeave={clearRepeat}
          className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-4 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1 cursor-pointer select-none"
        >
          <ArrowLeft size={24} />
        </div>
        <div
          data-move="right"
          role="button"
          tabIndex={0}
          aria-label="Move Right"
          onMouseDown={() => startRepeat("moveRight")}
          onMouseUp={clearRepeat}
          onMouseLeave={clearRepeat}
          className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-4 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1 cursor-pointer select-none"
        >
          <ArrowRight size={24} />
        </div>
        <button
          type="button"
          onClick={rotate}
          className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-4 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1"
          aria-label="Rotate"
        >
          <RotateCw size={24} />
        </button>
        <div
          data-move="down"
          role="button"
          tabIndex={0}
          aria-label="Move Down"
          onMouseDown={() => startRepeat("moveDown")}
          onMouseUp={clearRepeat}
          onMouseLeave={clearRepeat}
          className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 p-4 rounded-xl flex items-center justify-center touch-manipulation transition-colors border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1 cursor-pointer select-none"
        >
          <ArrowDown size={24} />
        </div>
      </div>

      {/* Mobile Landscape Bottom Controls - Speed Slider */}
      <div className="hidden landscape-short:flex w-full max-w-[min(35vw,160px)] mt-2 justify-center absolute bottom-1">
        <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800 w-full">
          <span className="text-[10px] uppercase text-zinc-500">Speed</span>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-full accent-zinc-500 h-1"
          />
        </div>
      </div>

      {/* Desktop instructions */}
      <div className="hidden md:flex landscape-short:hidden gap-6 mt-12 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">←</kbd>
          <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">→</kbd>
          <span>Move</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">↑</kbd>
          <span>Rotate</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">Space</kbd>
          <span>Drop</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">C</kbd>
          <span>Stash</span>
        </div>
      </div>
    </div>
  );
}