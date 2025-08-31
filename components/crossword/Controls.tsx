'use client';

interface ControlsProps {
  onCheck: () => void;
  onReveal: () => void;
  onReset: () => void;
}

export default function Controls({
  onCheck,
  onReveal,
  onReset,
}: ControlsProps) {
  return (
    <div className="flex gap-2 my-4">
      <button
        onClick={onCheck}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold"
      >
        Check Grid
      </button>
      <button
        onClick={onReveal}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold"
      >
        Reveal Puzzle
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-neutral-500 hover:bg-neutral-600 rounded-md text-white font-semibold"
      >
        Reset
      </button>
    </div>
  );
}
