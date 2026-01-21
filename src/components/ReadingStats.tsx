'use client';

import { Book } from '@/types';

interface ReadingStatsProps {
  books: Book[];
}

export function ReadingStats({ books }: ReadingStatsProps) {
  const haveRead = books.filter((b) => b.status === 'have_read');

  const currentYear = new Date().getFullYear();
  const booksThisYear = haveRead.filter((book) => {
    if (!book.completedAt) return false;
    const completedYear = new Date(book.completedAt).getFullYear();
    return completedYear === currentYear;
  });

  const allTimeCount = haveRead.length;
  const thisYearCount = booksThisYear.length;

  return (
    <div className="bg-parchment rounded-xl p-4 mb-6 border border-gold/20">
      <div className="flex items-center justify-around">
        <div className="text-center">
          <div className="font-serif text-3xl text-leather font-bold">
            {thisYearCount}
          </div>
          <div className="text-ink-faint text-sm mt-1">
            {currentYear}
          </div>
        </div>

        <div className="w-px h-12 bg-gold/30" />

        <div className="text-center">
          <div className="font-serif text-3xl text-forest font-bold">
            {allTimeCount}
          </div>
          <div className="text-ink-faint text-sm mt-1">
            all time
          </div>
        </div>
      </div>

      <p className="text-center text-ink-faint text-xs mt-3 italic">
        Books finished, not skimmed
      </p>
    </div>
  );
}
