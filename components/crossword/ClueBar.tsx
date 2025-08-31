import { Puzzle, Cell, Direction } from '../../types';

interface ClueBarProps {
  puzzle: Puzzle;
  activeCell: Cell;
  direction: Direction;
}

export default function ClueBar({
  puzzle,
  activeCell,
  direction,
}: ClueBarProps) {
  const findCurrentClue = (): { num: string; text: string } => {
    // Defensive check to prevent crash if activeCell is undefined during a render
    if (!activeCell) {
      return { num: ' ', text: ' ' };
    }

    const { row, col } = activeCell;
    const clues = puzzle.clues[direction];

    if (direction === 'across') {
      let currentCol = col;
      while (currentCol >= 0 && puzzle.solution[row][currentCol] !== ' ') {
        const clueNum = puzzle.gridnums[row][currentCol];
        if (clueNum && clues[clueNum]) {
          return { num: `${clueNum}.`, text: clues[clueNum] };
        }
        currentCol--;
      }
    } else {
      // 'down'
      let currentRow = row;
      while (currentRow >= 0 && puzzle.solution[currentRow][col] !== ' ') {
        const clueNum = puzzle.gridnums[currentRow][col];
        if (clueNum && clues[clueNum]) {
          return { num: `${clueNum}.`, text: clues[clueNum] };
        }
        currentRow--;
      }
    }
    return { num: ' ', text: ' ' };
  };

  const { num, text } = findCurrentClue();

  return (
    <div className="w-full h-16 bg-black flex items-center justify-center text-center px-4">
      <div className="flex items-center text-sm md:text-base">
        <span className="font-bold mr-2">{num}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
