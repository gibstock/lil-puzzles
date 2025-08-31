'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Puzzle, Direction, Cell, CellStatus } from '@/types';
import CrosswordGrid from '@/components/crossword/CrosswordGrid';
import ClueBar from '@/components/crossword/ClueBar';
import Keyboard from '@/components/crossword/Keyboard';
import Toolbar from '@/components/crossword/Toolbar';
import CompletionModal from '@/components/crossword/CompletionModal';

// Helper to check if a cell is part of a word in a given direction
const hasWord = (
  puzzle: Puzzle,
  row: number,
  col: number,
  direction: Direction
): boolean => {
  if (direction === 'across') {
    const leftCell = col > 0 ? puzzle.solution[row][col - 1] : ' ';
    const rightCell =
      col < puzzle.size - 1 ? puzzle.solution[row][col + 1] : ' ';
    return leftCell !== ' ' || rightCell !== ' ';
  } else {
    // down
    const topCell = row > 0 ? puzzle.solution[row - 1][col] : ' ';
    const bottomCell =
      row < puzzle.size - 1 ? puzzle.solution[row + 1][col] : ' ';
    return topCell !== ' ' || bottomCell !== ' ';
  }
};

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
  return { row: 0, col: 0 }; // Fallback
};

interface CrosswordProps {
  puzzle: Puzzle;
}

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
  const [pauseTime, setPauseTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Load state from localStorage
  useEffect(() => {
    const savedGrid = localStorage.getItem(`crossword-${puzzle.id}`);
    if (savedGrid) setGrid(JSON.parse(savedGrid));

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
  }, [puzzle.id]);

  // Save grid to localStorage
  useEffect(() => {
    localStorage.setItem(`crossword-${puzzle.id}`, JSON.stringify(grid));
  }, [grid, puzzle.id]);

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

  // Pause timer when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isTimerRunning) {
          setIsTimerRunning(false);
          setPauseTime(Date.now());
        }
      } else {
        if (pauseTime && startTime) {
          const newStartTime = startTime + (Date.now() - pauseTime);
          setStartTime(newStartTime);
          localStorage.setItem(
            `crossword-startTime-${puzzle.id}`,
            newStartTime.toString()
          );
          setIsTimerRunning(true);
          setPauseTime(null);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerRunning, pauseTime, startTime, puzzle.id]);

  // Focus input on activeCell change
  useEffect(() => {
    inputRefs.current[activeCell.row]?.[activeCell.col]?.focus();
  }, [activeCell]);

  // Check for puzzle completion
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
        setIsTimerRunning(false);
        setFinalTime(Date.now() - startTime);
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

  // --- EVENT HANDLERS ---
  const handleFirstInput = () => {
    if (!startTime) {
      const now = Date.now();
      setStartTime(now);
      setIsTimerRunning(true);
      localStorage.setItem(`crossword-startTime-${puzzle.id}`, now.toString());
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const hasAcross = hasWord(puzzle, row, col, 'across');
    const hasDown = hasWord(puzzle, row, col, 'down');

    if (activeCell.row === row && activeCell.col === col) {
      // FIX: Improved direction toggling
      if (direction === 'across' && hasDown) setDirection('down');
      else if (direction === 'down' && hasAcross) setDirection('across');
    } else {
      // FIX: Intelligently set initial direction
      if (hasAcross) setDirection('across');
      else if (hasDown) setDirection('down');
    }
    setActiveCell({ row, col });
    setCellStatus(createInitialStatus(puzzle.size));
  };

  const moveToNextCell = (row: number, col: number) => {
    if (direction === 'across') {
      let nextCol = col + 1;
      while (nextCol < puzzle.size && puzzle.solution[row][nextCol] === ' ')
        nextCol++;
      if (nextCol < puzzle.size) setActiveCell({ row, col: nextCol });
    } else {
      let nextRow = row + 1;
      while (nextRow < puzzle.size && puzzle.solution[nextRow][col] === ' ')
        nextRow++;
      if (nextRow < puzzle.size) setActiveCell({ row: nextRow, col });
    }
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
    if (key === 'BACKSPACE') {
      newGrid[row][col] = '';
      setGrid(newGrid);
    } else {
      newGrid[row][col] = key.toUpperCase();
      setGrid(newGrid);
      moveToNextCell(row, col);
    }
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
    const url = 'https://lilpuzzles.com';
    const shareText = `I solved the ${date} Mini Crossword in ${timeStr}!\n\n${url}`;
    const shareData = { text: shareText, title: 'My Mini Crossword Score' };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
        navigator.clipboard.writeText(shareText);
      }
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto h-full flex flex-col">
      <Toolbar
        onCheck={handleCheck}
        onReveal={handleReveal}
        onReset={handleReset}
        elapsedTime={elapsedTime}
      />
      <div className="flex-grow flex items-center justify-center p-1">
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
      <ClueBar puzzle={puzzle} activeCell={activeCell} direction={direction} />
      <Keyboard
        onKeyPress={handleVirtualKeyPress}
        onBackspace={() => handleVirtualKeyPress('BACKSPACE')}
      />
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
