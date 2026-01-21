'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Book } from '@/types';
import { BookCard } from '../BookCard';
import { TopThreeSlots } from '../TopThreeSlots';

interface WantToReadSectionProps {
  books: Book[];
  priorityBooks: (Book | null)[];
  onBookClick: (book: Book) => void;
}

export function WantToReadSection({ books, priorityBooks, onBookClick }: WantToReadSectionProps) {
  const nonPriorityBooks = books.filter((book) => !book.priority);

  return (
    <section className="mb-6">
      <h2 className="font-serif text-lg font-semibold text-ink mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-gold rounded-full" />
        Want to Read
      </h2>

      {/* Top 3 Priority Slots */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-ink-light mb-2 italic">Up Next</h3>
        <TopThreeSlots priorityBooks={priorityBooks} onBookClick={onBookClick} />
      </div>

      {/* Rest of the list */}
      <Droppable droppableId="want_to_read">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[80px] rounded-xl p-3 transition-colors border
              ${snapshot.isDraggingOver
                ? 'bg-gold/10 border-gold/30 border-dashed'
                : 'bg-parchment/50 border-parchment'}
            `}
          >
            {nonPriorityBooks.length === 0 && books.length === 0 ? (
              <div className="flex items-center justify-center h-[60px] text-ink-faint text-sm italic">
                Add books you want to read
              </div>
            ) : nonPriorityBooks.length === 0 ? (
              <div className="flex items-center justify-center h-[60px] text-ink-faint text-sm italic">
                All books are prioritized above
              </div>
            ) : (
              <div className="space-y-2">
                {nonPriorityBooks.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={index}
                    onClick={() => onBookClick(book)}
                  />
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {books.length > 0 && (
        <p className="text-xs text-ink-faint mt-2 text-center italic">
          {books.length} book{books.length !== 1 ? 's' : ''} in your reading list
        </p>
      )}
    </section>
  );
}
