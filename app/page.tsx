import GameTile from '../components/GameTile';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2">Family Game Hub</h1>
        <p className="text-lg text-neutral-400">Choose a game to play!</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameTile
          title="Daily Mini Crossword"
          description="A new 5x5 puzzle to solve every day."
          href="/games/crossword"
        />
        {/* You can add more GameTile components here for future games! */}
      </div>
    </main>
  );
}
