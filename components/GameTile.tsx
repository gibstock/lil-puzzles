'use client';

import Link from 'next/link';

interface GameTileProps {
  title: string;
  description: string;
  href: string;
}

export default function GameTile({ title, description, href }: GameTileProps) {
  return (
    <Link
      href={href}
      className="block bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition-colors shadow-lg"
    >
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-neutral-400">{description}</p>
    </Link>
  );
}
