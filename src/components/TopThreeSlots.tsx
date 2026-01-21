'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Book } from '@/types';

interface TopThreeSlotsProps {
  priorityBooks: (Book | null)[];
  onBookClick: (book: Book) => void;
}

export function TopThreeSlots({ priorityBooks, onBookClick }: TopThreeSlotsProps) {
  return (
    <div className="space-y-2 mb-4">
      {[1, 2, 3].map((slot) => {
        const book = priorityBooks[slot - 1];
        const slotId = `priority-${slot}` as const;

        return (
          <Droppable key={slot} droppableId={slotId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition-colors min-h-[60px] border
                  ${snapshot.isDraggingOver
                    ? 'bg-gold/20 border-gold/50 border-dashed'
                    : 'bg-gold/10 border-gold/20'}
                `}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/30 flex items-center justify-center font-serif font-bold text-leather">
                  {slot}
                </div>

                {book ? (
                  <Draggable draggableId={book.id} index={0}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        onClick={() => onBookClick(book)}
                        className={`
                          flex-1 bg-white rounded-lg border border-gold/30 p-3
                          ${dragSnapshot.isDragging ? 'shadow-lg ring-2 ring-gold/50' : ''}
                          cursor-pointer hover:border-gold/50 hover:shadow-md
                          transition-all duration-150 touch-manipulation
                        `}
                      >
                        <h4 className="font-medium text-ink truncate text-sm">
                          {book.title}
                        </h4>
                        <p className="text-xs text-ink-light truncate">{book.author}</p>
                      </div>
                    )}
                  </Draggable>
                ) : (
                  <div className="flex-1 border-2 border-dashed border-gold/30 rounded-lg p-3 text-center text-gold/60 text-sm italic">
                    Drag a book here
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );
      })}
    </div>
  );
}
