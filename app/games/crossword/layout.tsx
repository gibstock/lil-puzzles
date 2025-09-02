import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lil Puzzles',
  description: 'Lil Puzzles for the Fam',
  openGraph: {
    type: 'website',
    images: ['https://lilpuzzles.com/link-image.png'],
    url: 'https://lilpuzzles.com/games/crossword',
    description: 'Simple and fun games and puzzles',
    title: 'Lil Puzzles',
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
