import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Define Tetromino shapes and colors (muted palette)
const TETROMINOES = {
  I: {
    shape: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    color: 'bg-cyan-600/80',
  },
  J: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    color: 'bg-blue-600/80',
  },
  L: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    color: 'bg-orange-600/80',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-600/80',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-green-600/80',
  },
  T: {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-purple-600/80',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-red-600/80',
  },
};

type TetrominoType = keyof typeof TETROMINOES;
type Grid = (string | 0)[][];

export interface Piece {
  x: number;
  y: number;
  shape: number[][];
  color: string;
  type: TetrominoType;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 15;

// Helper to create an empty board
const createEmptyBoard = (): Grid =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

// Helper to get a random piece
const getRandomPiece = (): Piece => {
  const keys = Object.keys(TETROMINOES) as TetrominoType[];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const { shape, color } = TETROMINOES[randomKey];

  return {
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
    y: 0,
    shape,
    color,
    type: randomKey,
  };
};

export const useTetris = () => {
  const [board, setBoard] = useState<Grid>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [heldPiece, setHeldPiece] = useState<Piece | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(5); // 1-10

  // Calculate fall speed interval based on speed setting (1 = slowest, 10 = fastest)
  // 1: 1000ms, 10: 100ms
  const getSpeedMs = useCallback(() => {
    return 1100 - (speed * 100);
  }, [speed]);

  // Initialize game
  useEffect(() => {
    if (!currentPiece && !isGameOver) {
      setCurrentPiece(getRandomPiece());
      setNextPiece(getRandomPiece());
    }
  }, [currentPiece, isGameOver]);

  // Collision detection
  const checkCollision = useCallback((piece: Piece, targetBoard: Grid = board): boolean => {
    if (!piece) return false;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && targetBoard[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  const commitPieceToBoard = useCallback((piece: Piece, dropY: number) => {
     setBoard(prev => {
         const newBoard = prev.map(row => [...row]);
         let gameOver = false;

         piece.shape.forEach((row, y) => {
             row.forEach((val, x) => {
                 if (val) {
                     const boardY = dropY + y;
                     if (boardY < 0 || (boardY >= 0 && boardY < BOARD_HEIGHT && prev[boardY][piece.x + x] !== 0)) {
                         gameOver = true;
                     } else if (boardY < BOARD_HEIGHT) {
                         newBoard[boardY][piece.x + x] = piece.color;
                     }
                 }
             });
         });

         if (gameOver) {
             setIsGameOver(true);
             return prev;
         }

         const filteredBoard = newBoard.filter(row => row.some(cell => cell === 0));
         const linesCleared = BOARD_HEIGHT - filteredBoard.length;
         const emptyLines = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(0));
         return [...emptyLines, ...filteredBoard];
     });

     setCurrentPiece(nextPiece);
     setNextPiece(getRandomPiece());
     setCanHold(true);
  }, [nextPiece]);

  // Lock piece and clear lines
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;
    commitPieceToBoard(currentPiece, currentPiece.y);
  }, [currentPiece, commitPieceToBoard]);

  // Move piece down
  const currentPieceRef = useRef<Piece | null>(currentPiece);
  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  const moveDown = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || isGameOver || isPaused) return;

    const newPiece = { ...piece, y: piece.y + 1 };

    if (checkCollision(newPiece)) {
      commitPieceToBoard(piece, piece.y);
    } else {
      setCurrentPiece(newPiece);
    }
  }, [isGameOver, isPaused, checkCollision, commitPieceToBoard]);

  // Game loop
  useEffect(() => {
    let dropInterval: NodeJS.Timeout;

    if (currentPieceRef.current && !isGameOver && !isPaused) {
      dropInterval = setInterval(moveDown, getSpeedMs());
    }

    return () => {
      if (dropInterval) clearInterval(dropInterval);
    };
  }, [isGameOver, isPaused, speed, getSpeedMs, moveDown]);

  // Controls
  const moveLeft = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused) return;
    const newPiece = { ...currentPiece, x: currentPiece.x - 1 };
    if (!checkCollision(newPiece)) setCurrentPiece(newPiece);
  }, [currentPiece, isGameOver, isPaused, checkCollision]);

  const moveRight = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused) return;
    const newPiece = { ...currentPiece, x: currentPiece.x + 1 };
    if (!checkCollision(newPiece)) setCurrentPiece(newPiece);
  }, [currentPiece, isGameOver, isPaused, checkCollision]);

  const rotate = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused) return;

    const rotatedShape = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );

    const newPiece = { ...currentPiece, shape: rotatedShape };

    // Simple wall kick handling (could be more robust)
    if (!checkCollision(newPiece)) {
      setCurrentPiece(newPiece);
    } else {
      // Try moving left or right once to see if it fits
      if (!checkCollision({ ...newPiece, x: newPiece.x - 1 })) {
        setCurrentPiece({ ...newPiece, x: newPiece.x - 1 });
      } else if (!checkCollision({ ...newPiece, x: newPiece.x + 1 })) {
        setCurrentPiece({ ...newPiece, x: newPiece.x + 1 });
      }
    }
  }, [currentPiece, isGameOver, isPaused, checkCollision]);

  // Better hardDrop that locks immediately
  const immediateHardDrop = useCallback(() => {
     if (!currentPiece || isGameOver || isPaused) return;
     let dropY = currentPiece.y;
     while (!checkCollision({ ...currentPiece, y: dropY + 1 })) {
         dropY++;
     }

     commitPieceToBoard(currentPiece, dropY);
  }, [currentPiece, isGameOver, isPaused, checkCollision, commitPieceToBoard]);


  const holdPiece = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused || !canHold) return;

    if (heldPiece) {
      // Swap
      const temp = currentPiece.type;
      const { shape, color } = TETROMINOES[heldPiece.type];

      setCurrentPiece({
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        shape,
        color,
        type: heldPiece.type,
      });

      setHeldPiece({
        x: 0, // values that will be ignored
        y: 0,
        type: temp,
        shape: TETROMINOES[temp].shape,
        color: TETROMINOES[temp].color
      });
    } else {
      // First hold
      setHeldPiece({
        ...currentPiece,
        shape: TETROMINOES[currentPiece.type].shape // reset rotation
      });
      setCurrentPiece(nextPiece);
      setNextPiece(getRandomPiece());
    }

    setCanHold(false);
  }, [currentPiece, heldPiece, nextPiece, isGameOver, isPaused, canHold]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setHeldPiece(null);
    setIsGameOver(false);
    setIsPaused(false);
    setCanHold(true);
  }, []);

  const togglePause = useCallback(() => {
    if (!isGameOver) setIsPaused(prev => !prev);
  }, [isGameOver]);

  // Calculate shadow piece
  const shadowPiece = useMemo(() => {
    if (!currentPiece) return null;
    let dropY = currentPiece.y;
    while (!checkCollision({ ...currentPiece, y: dropY + 1 })) {
      dropY++;
    }
    return { ...currentPiece, y: dropY };
  }, [currentPiece, checkCollision]);

  return {
    board,
    currentPiece,
    nextPiece,
    heldPiece,
    shadowPiece,
    isGameOver,
    isPaused,
    speed,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop: immediateHardDrop,
    rotate,
    holdPiece,
    resetGame,
    setSpeed,
    togglePause,
  };
};