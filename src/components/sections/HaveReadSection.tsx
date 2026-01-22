'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Book } from '@/types';
import { BookCard } from '../BookCard';

interface HaveReadSectionProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onRecommend?: (book: Book) => void;
}

export function HaveReadSection({ books, onBookClick, onRecommend }: HaveReadSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-serif text-lg font-semibold text-ink mb-3"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-leather rounded-full" />
          Have Read ({books.length})
        </span>
        <svg
          className={`w-5 h-5 text-ink-faint transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Droppable droppableId="have_read">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[80px] rounded-xl p-3 transition-all border relative
              ${snapshot.isDraggingOver
                ? 'bg-leather/10 border-leather/30 border-dashed'
                : 'bg-parchment/50 border-parchment'}
              ${!isExpanded && books.length > 0 ? 'max-h-[120px] overflow-hidden' : ''}
            `}
          >
            {books.length === 0 ? (
              <div className="flex items-center justify-center h-[60px] text-ink-faint text-sm italic">
                Drag a book here when you finish it
              </div>
            ) : (
              <div className="space-y-2">
                {books.map((book, index) => (
                  <div key={book.id} className="relative group">
                    <BookCard
                      book={book}
                      index={index}
                      onClick={() => onBookClick(book)}
                      showConsumptionInfo
                      compact={!isExpanded}
                    />
                    {onRecommend && isExpanded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecommend(book);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 px-2 py-1 bg-leather text-white text-xs font-medium rounded transition-opacity"
                        title="Recommend to someone"
                      >
                        Recommend
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {provided.placeholder}

            {!isExpanded && books.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-parchment/80 to-transparent pointer-events-none" />
            )}
          </div>
        )}
      </Droppable>

      {!isExpanded && books.length > 1 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full mt-2 py-2 text-sm text-leather hover:text-leather-light font-medium"
        >
          Show all {books.length} books
        </button>
      )}
    </section>
  );
}
