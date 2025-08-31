import Crossword from '@/components/crossword/Crossword';
import { Puzzle } from '@/types';

async function getTodaysPuzzle(): Promise<Puzzle | null> {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${appUrl}/api/puzzle`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Failed to fetch puzzle:', res.status, res.statusText);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    return null;
  }
}

export default async function CrosswordPage() {
  const puzzle = await getTodaysPuzzle();

  if (!puzzle) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No puzzle available for today.</h1>
          <p className="text-neutral-400">Please come back tomorrow!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen bg-black text-white">
      <Crossword puzzle={puzzle} />
    </main>
  );
}
