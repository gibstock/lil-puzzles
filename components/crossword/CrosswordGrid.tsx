'use client';

import { MutableRefObject } from 'react';
import { Puzzle, Cell, Direction, CellStatus } from '../../types';
import clsx from 'clsx';

interface CrosswordGridProps {
  puzzle: Puzzle;
  grid: string[][];
  cellStatus: CellStatus[][];
  activeCell: Cell;
  direction: Direction;
  inputRefs: MutableRefObject<(HTMLInputElement | null)[][]>;
  handleCellClick: (row: number, col: number) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => void;
}

export default function CrosswordGrid({
  puzzle,
  grid,
  cellStatus,
  activeCell,
  direction,
  inputRefs,
  handleCellClick,
  handleInputChange,
  handleKeyDown,
}: CrosswordGridProps) {
  const isCellInActiveWord = (row: number, col: number) => {
    if (!activeCell) return false;

    if (direction === 'across') {
      if (row !== activeCell.row) return false;
      let start = activeCell.col;
      while (start > 0 && puzzle.solution[row][start - 1] !== ' ') start--;
      let end = activeCell.col;
      while (end < puzzle.size - 1 && puzzle.solution[row][end + 1] !== ' ')
        end++;
      return col >= start && col <= end;
    } else {
      if (col !== activeCell.col) return false;
      let start = activeCell.row;
      while (start > 0 && puzzle.solution[start - 1][col] !== ' ') start--;
      let end = activeCell.row;
      while (end < puzzle.size - 1 && puzzle.solution[end + 1][col] !== ' ')
        end++;
      return row >= start && row <= end;
    }
  };

  return (
    <div
      className="grid gap-px bg-neutral-600 w-full aspect-square"
      style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
    >
      {puzzle.solution.map((rowArr, rIndex) =>
        rowArr.map((cell, cIndex) => {
          const isBlackCell = cell === ' ';
          if (isBlackCell) {
            return <div key={`${rIndex}-${cIndex}`} className="bg-black" />;
          }

          const isActive =
            activeCell &&
            activeCell.row === rIndex &&
            activeCell.col === cIndex;
          const isInWord = !isActive && isCellInActiveWord(rIndex, cIndex);
          const status = cellStatus[rIndex][cIndex];
          const isCorrect = status === 'correct';
          const isIncorrect = status === 'incorrect';

          return (
            <div key={`${rIndex}-${cIndex}`} className="relative">
              <span className="absolute top-0 left-1 text-[10px] text-neutral-500">
                {puzzle.gridnums[rIndex][cIndex] || ''}
              </span>
              <input
                ref={(el) => {
                  if (!inputRefs.current[rIndex]) {
                    inputRefs.current[rIndex] = [];
                  }
                  inputRefs.current[rIndex][cIndex] = el;
                }}
                type="text"
                maxLength={1}
                value={grid[rIndex]?.[cIndex] || ''}
                onClick={() => handleCellClick(rIndex, cIndex)}
                onChange={(e) => handleInputChange(e, rIndex, cIndex)}
                onKeyDown={(e) => handleKeyDown(e, rIndex, cIndex)}
                className={clsx(
                  'w-full h-full text-center text-xl md:text-2xl uppercase font-bold caret-transparent',
                  'bg-white text-black',
                  {
                    'bg-yellow-400': isActive,
                    'bg-blue-200': isInWord,
                    'bg-green-300 text-green-800': isCorrect,
                    'bg-red-300 text-red-800': isIncorrect,
                  }
                )}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
