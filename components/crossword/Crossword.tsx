'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Puzzle, Direction, Cell, CellStatus } from '../../types';
import CrosswordGrid from './CrosswordGrid';
import ClueBar from './ClueBar';
import Keyboard from './Keyboard';
import Toolbar from './Toolbar';
import CompletionModal from './CompletionModal';

interface CrosswordProps {
  puzzle: Puzzle;
}

const createEmptyGrid = (size: number): string[][] =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(''));
const createInitialStatus = (size: number): CellStatus[][] =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill('neutral'));

const findFirstCell = (puzzle: Puzzle): Cell => {
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      if (puzzle.solution[r][c] !== ' ') {
        return { row: r, col: c };
      }
    }
  }
  return { row: 0, col: 0 };
};

export default function Crossword({ puzzle }: CrosswordProps) {
  const [grid, setGrid] = useState<string[][]>(() =>
    createEmptyGrid(puzzle.size)
  );
  const [cellStatus, setCellStatus] = useState<CellStatus[][]>(() =>
    createInitialStatus(puzzle.size)
  );
  const [activeCell, setActiveCell] = useState<Cell>(() =>
    findFirstCell(puzzle)
  );
  const [direction, setDirection] = useState<Direction>('across');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasShownIncorrectModal, setHasShownIncorrectModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickTimeRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Pre-process and sort all clues to determine the puzzle's flow
  const sortedClues = useMemo(() => {
    const clues: { num: number; cell: Cell; direction: Direction }[] = [];
    const seen = new Set<number>();

    // Iterate through grid to find clue numbers and their positions
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const num = puzzle.gridnums[r][c];
        if (num > 0 && !seen.has(num)) {
          seen.add(num);
          const isAcross = !!puzzle.clues.across[num];
          const isDown = !!puzzle.clues.down[num];

          if (isAcross) {
            clues.push({ num, cell: { row: r, col: c }, direction: 'across' });
          }
          if (isDown) {
            clues.push({ num, cell: { row: r, col: c }, direction: 'down' });
          }
        }
      }
    }

    // Sort primarily by number, secondarily by direction (across first)
    clues.sort((a, b) => {
      if (a.num !== b.num) return a.num - b.num;
      return a.direction === 'across' ? -1 : 1;
    });

    return clues;
  }, [puzzle]);

  // Load saved state
  useEffect(() => {
    const savedGrid = localStorage.getItem(`crossword-${puzzle.id}`);
    if (savedGrid) setGrid(JSON.parse(savedGrid));

    // Check for saved elapsed time first for session restoration
    const savedElapsedTime = localStorage.getItem(
      `crossword-elapsedTime-${puzzle.id}`
    );
    if (savedElapsedTime) {
      const parsedElapsedTime = parseInt(savedElapsedTime, 10);
      if (!isNaN(parsedElapsedTime)) {
        setElapsedTime(parsedElapsedTime);
        // Reconstruct the start time to resume counting accurately
        setStartTime(Date.now() - parsedElapsedTime);
        setIsTimerRunning(true);
      }
    } else {
      // Fallback for older saved states or new games
      const savedStartTime = localStorage.getItem(
        `crossword-startTime-${puzzle.id}`
      );
      if (savedStartTime) {
        const parsedStartTime = parseInt(savedStartTime, 10);
        if (!isNaN(parsedStartTime)) {
          setStartTime(parsedStartTime);
          setIsTimerRunning(true);
        }
      }
    }
  }, [puzzle.id]);

  // Save grid state
  useEffect(() => {
    localStorage.setItem(`crossword-${puzzle.id}`, JSON.stringify(grid));
  }, [grid, puzzle.id]);

  // Save elapsed time right before the tab closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTimerRunning) {
        localStorage.setItem(
          `crossword-elapsedTime-${puzzle.id}`,
          elapsedTime.toString()
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [elapsedTime, isTimerRunning, puzzle.id]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, startTime]);

  // Pause/Resume timer on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTimerRunning(false);
        lastTickTimeRef.current = Date.now();
      } else {
        if (startTime && !finalTime) {
          if (lastTickTimeRef.current) {
            const pausedDuration = Date.now() - lastTickTimeRef.current;
            setStartTime((prev) => (prev ? prev + pausedDuration : null));
            lastTickTimeRef.current = null;
          }
          setIsTimerRunning(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startTime, finalTime]);

  // Check for completion
  const checkCompletion = useCallback(() => {
    if (!startTime) return;
    const isGridFull = grid.every((row, rIndex) =>
      row.every(
        (cell, cIndex) => puzzle.solution[rIndex][cIndex] === ' ' || cell !== ''
      )
    );
    if (isGridFull) {
      const isCorrect = grid.every((row, rIndex) =>
        row.every(
          (cell, cIndex) =>
            puzzle.solution[rIndex][cIndex] === ' ' ||
            cell === puzzle.solution[rIndex][cIndex]
        )
      );
      if (isCorrect) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        const finalTimestamp = Date.now() - startTime;

        setIsTimerRunning(false);
        setFinalTime(finalTimestamp);
        setElapsedTime(finalTimestamp);
        setIsModalOpen(true);
      } else if (!hasShownIncorrectModal) {
        setFinalTime(null);
        setIsModalOpen(true);
        setHasShownIncorrectModal(true);
      }
    }
  }, [grid, puzzle.solution, startTime, hasShownIncorrectModal]);

  useEffect(() => {
    checkCompletion();
  }, [grid, checkCompletion]);

  // Focus input
  useEffect(() => {
    inputRefs.current[activeCell.row]?.[activeCell.col]?.focus();
  }, [activeCell]);

  const handleFirstInput = () => {
    if (!startTime) {
      const now = Date.now();
      setStartTime(now);
      setIsTimerRunning(true);
    }
  };

  const moveToNextCell = (row: number, col: number) => {
    // Check if the current cell is the end of a word
    const isEndOfWord =
      direction === 'across'
        ? col === puzzle.size - 1 || puzzle.solution[row][col + 1] === ' '
        : row === puzzle.size - 1 || puzzle.solution[row + 1][col] === ' ';

    if (isEndOfWord) {
      // Find the start of the current word to identify its clue number
      let r = row,
        c = col;
      if (direction === 'across') {
        while (c > 0 && puzzle.solution[r][c - 1] !== ' ') c--;
      } else {
        while (r > 0 && puzzle.solution[r - 1][c] !== ' ') r--;
      }
      const currentClueNum = puzzle.gridnums[r][c];

      // Find the index of the current clue in our sorted list
      const currentIndex = sortedClues.findIndex(
        (clue) => clue.num === currentClueNum && clue.direction === direction
      );

      if (currentIndex !== -1 && currentIndex < sortedClues.length - 1) {
        // Move to the next clue in the sequence
        const nextClue = sortedClues[currentIndex + 1];
        setActiveCell(nextClue.cell);
        setDirection(nextClue.direction);
      }
    } else {
      // move to the next cell in the same word
      if (direction === 'across') {
        setActiveCell({ row, col: col + 1 });
      } else {
        setActiveCell({ row: row + 1, col });
      }
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const newDirection =
      activeCell.row === row && activeCell.col === col
        ? direction === 'across'
          ? 'down'
          : 'across'
        : direction;
    setDirection(newDirection);
    setActiveCell({ row, col });
    setCellStatus(createInitialStatus(puzzle.size));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    handleFirstInput();
    const value = e.target.value.toUpperCase().slice(-1);
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = value;
    setGrid(newGrid);
    setCellStatus(createInitialStatus(puzzle.size));
    if (value) moveToNextCell(row, col);
  };

  const handleVirtualKeyPress = (key: string) => {
    handleFirstInput();
    const { row, col } = activeCell;
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = key.toUpperCase();
    setGrid(newGrid);
    moveToNextCell(row, col);
    setCellStatus(createInitialStatus(puzzle.size));
  };

  const handleBackspace = () => {
    const { row, col } = activeCell;
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = '';
    setGrid(newGrid);
    setCellStatus(createInitialStatus(puzzle.size));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    handleFirstInput();
    let newRow = row,
      newCol = col,
      newDirection = direction;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newRow = Math.max(0, row - 1);
        while (newRow > 0 && puzzle.solution[newRow][col] === ' ') newRow--;
        newDirection = 'down';
        break;
      case 'ArrowDown':
        e.preventDefault();
        newRow = Math.min(puzzle.size - 1, row + 1);
        while (newRow < puzzle.size - 1 && puzzle.solution[newRow][col] === ' ')
          newRow++;
        newDirection = 'down';
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newCol = Math.max(0, col - 1);
        while (newCol > 0 && puzzle.solution[row][newCol] === ' ') newCol--;
        newDirection = 'across';
        break;
      case 'ArrowRight':
        e.preventDefault();
        newCol = Math.min(puzzle.size - 1, col + 1);
        while (newCol < puzzle.size - 1 && puzzle.solution[row][newCol] === ' ')
          newCol++;
        newDirection = 'across';
        break;
      case 'Backspace':
        if (!grid[row][col]) {
          e.preventDefault();
          if (direction === 'across') {
            newCol = Math.max(0, col - 1);
            while (newCol > 0 && puzzle.solution[row][newCol] === ' ') newCol--;
          } else {
            newRow = Math.max(0, row - 1);
            while (newRow > 0 && puzzle.solution[newRow][col] === ' ') newRow--;
          }
        }
        break;
      default:
        return;
    }
    setDirection(newDirection);
    if (puzzle.solution[newRow][newCol] !== ' ') {
      setActiveCell({ row: newRow, col: newCol });
      setCellStatus(createInitialStatus(puzzle.size));
    }
  };

  const handleCheck = () => {
    if (!puzzle || !puzzle.solution) {
      console.error('Check failed: Puzzle data is not ready.');
      return;
    }

    const newStatus = createInitialStatus(puzzle.size);
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (puzzle.solution[r][c] !== ' ') {
          if (grid[r][c] === '') newStatus[r][c] = 'neutral';
          else if (grid[r][c] === puzzle.solution[r][c])
            newStatus[r][c] = 'correct';
          else newStatus[r][c] = 'incorrect';
        }
      }
    }
    setCellStatus(newStatus);
  };

  const handleReveal = () => {
    setGrid(puzzle.solution);
    setCellStatus(createInitialStatus(puzzle.size));
    setIsTimerRunning(false);
  };

  const handleReset = () => {
    setGrid(createEmptyGrid(puzzle.size));
    setCellStatus(createInitialStatus(puzzle.size));
    setActiveCell(findFirstCell(puzzle));
    setStartTime(null);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setIsModalOpen(false);
    setHasShownIncorrectModal(false);
    localStorage.removeItem(`crossword-startTime-${puzzle.id}`);
    localStorage.removeItem(`crossword-elapsedTime-${puzzle.id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (finalTime === null) setIsTimerRunning(true);
  };

  const handleShare = async () => {
    if (finalTime === null) return;
    const timeStr = `${Math.floor(finalTime / 60000)}:${Math.floor(
      (finalTime % 60000) / 1000
    )
      .toString()
      .padStart(2, '0')}`;
    const date = new Date().toLocaleDateString('en-US');
    const url = 'https://lilpuzzles.com/games/crossword';
    // Combine the message and URL into the 'text' field for better compatibility
    const shareText = `I solved the ${date} Lil Puzzles Mini Crossword in ${timeStr}!\n\n${url}`;

    try {
      if (navigator.share) {
        // Use the combined text and omit the 'url' and 'title' fields
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Score copied to clipboard!');
      }
    } catch (error) {
      console.error('Sharing failed', error);
      // Fallback to clipboard if sharing fails
      await navigator.clipboard.writeText(shareText);
      alert('Sharing failed, score copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto h-full flex flex-col justify-center p-2">
      <Toolbar
        onCheck={handleCheck}
        onReveal={handleReveal}
        onReset={handleReset}
        elapsedTime={elapsedTime}
      />
      <div className="flex-grow flex items-center justify-center w-full">
        <CrosswordGrid
          puzzle={puzzle}
          grid={grid}
          cellStatus={cellStatus}
          activeCell={activeCell}
          direction={direction}
          inputRefs={inputRefs}
          handleCellClick={handleCellClick}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
        />
      </div>
      <div className="w-full">
        <ClueBar
          puzzle={puzzle}
          activeCell={activeCell}
          direction={direction}
        />
        <Keyboard
          onKeyPress={handleVirtualKeyPress}
          onBackspace={handleBackspace}
        />
      </div>
      {isModalOpen && (
        <CompletionModal
          finalTime={finalTime}
          onClose={handleCloseModal}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
