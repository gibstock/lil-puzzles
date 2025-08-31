'use client';

interface CompletionModalProps {
  finalTime: number | null;
  onClose: () => void;
  onShare: () => void;
}

export default function CompletionModal({
  finalTime,
  onClose,
  onShare,
}: CompletionModalProps) {
  const isSuccess = finalTime !== null;
  const timeStr = isSuccess
    ? `${Math.floor(finalTime / 60000)}:${Math.floor((finalTime % 60000) / 1000)
        .toString()
        .padStart(2, '0')}`
    : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg p-8 m-4 max-w-sm w-full text-center">
        {isSuccess ? (
          <>
            <div className="mx-auto bg-blue-600 rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-neutral-600 mb-4">You solved the puzzle in</p>
            <p className="text-4xl font-bold mb-6">{timeStr}</p>
            <button
              onClick={onShare}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Share Your Score
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 text-neutral-500 font-semibold py-2 rounded-md"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Oops!</h2>
            <p className="text-neutral-600 mb-6">
              Not quite right. Keep trying!
            </p>
            <button
              onClick={onClose}
              className="w-full bg-neutral-200 text-black font-bold py-3 rounded-md hover:bg-neutral-300 transition-colors"
            >
              Keep Trying
            </button>
          </>
        )}
      </div>
    </div>
  );
}
