'use client';

import { Puzzle } from '../../types';

interface ClueListProps {
  clues: Puzzle['clues'];
}

export default function ClueList({ clues }: ClueListProps) {
  return (
    <div className="flex gap-8 text-sm">
      <div>
        <h2 className="font-bold mb-2">ACROSS</h2>
        <ul className="space-y-2">
          {Object.entries(clues.across).map(([num, clue]) => (
            <li key={`across-${num}`}>
              <span className="font-bold w-6 inline-block">{num}.</span> {clue}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-bold mb-2">DOWN</h2>
        <ul className="space-y-2">
          {Object.entries(clues.down).map(([num, clue]) => (
            <li key={`down-${num}`}>
              <span className="font-bold w-6 inline-block">{num}.</span> {clue}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
