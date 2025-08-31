export interface Puzzle {
  id: string;
  size: number;
  solution: string[][];
  clues: {
    across: { [key: number]: string };
    down: { [key: number]: string };
  };
  gridnums: number[][];
}

export type Direction = 'across' | 'down';
export type Cell = { row: number; col: number };

// To track the correctness of each cell for UI feedback
export type CellStatus = 'neutral' | 'correct' | 'incorrect';