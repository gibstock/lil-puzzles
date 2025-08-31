'use client';

interface ToolbarProps {
  onCheck: () => void;
  onReveal: () => void;
  onReset: () => void;
  elapsedTime: number;
}

const formatTime = (time: number) => {
  const totalSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function Toolbar({
  onCheck,
  onReveal,
  onReset,
  elapsedTime,
}: ToolbarProps) {
  return (
    <div className="flex justify-between items-center p-2 bg-neutral-800">
      <div className="text-lg font-mono w-20">{formatTime(elapsedTime)}</div>
      <div className="flex gap-4">
        <button
          onClick={onCheck}
          title="Check Puzzle"
          className="text-white hover:text-yellow-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
        <button
          onClick={onReveal}
          title="Reveal Puzzle"
          className="text-white hover:text-yellow-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button
          onClick={onReset}
          title="Reset Puzzle"
          className="text-white hover:text-yellow-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 2v6h6" />
            <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
            <path d="M21 22v-6h-6" />
            <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
