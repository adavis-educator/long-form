'use client';

import { Droppable } from '@hello-pangea/dnd';
import { Book } from '@/types';
import { BookCard } from '../BookCard';

interface CurrentlyReadingSectionProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

export function CurrentlyReadingSection({ books, onBookClick }: CurrentlyReadingSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="font-serif text-lg font-semibold text-ink mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-forest rounded-full" />
        Currently Reading
      </h2>

      <Droppable droppableId="currently_reading">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[80px] rounded-xl p-3 transition-colors border
              ${snapshot.isDraggingOver
                ? 'bg-forest/10 border-forest/30 border-dashed'
                : 'bg-parchment/50 border-parchment'}
            `}
          >
            {books.length === 0 ? (
              <div className="flex items-center justify-center h-[60px] text-ink-faint text-sm italic">
                Drag a book here to start reading
              </div>
            ) : (
              <div className="space-y-2">
                {books.map((book, index) => (
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
    </section>
  );
}
