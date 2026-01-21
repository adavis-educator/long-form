'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Book } from '@/types';

interface BookCardProps {
  book: Book;
  index: number;
  onClick?: () => void;
  showConsumptionInfo?: boolean;
  compact?: boolean;
}

export function BookCard({
  book,
  index,
  onClick,
  showConsumptionInfo = false,
  compact = false,
}: BookCardProps) {
  const getConsumptionLabel = () => {
    if (!book.consumptionType) return null;

    if (book.consumptionType === 'listen') {
      const platformLabels: Record<string, string> = {
        audible: 'Audible',
        libby: 'Libby',
        spotify: 'Spotify',
      };
      return `Listened on ${book.listenPlatform ? platformLabels[book.listenPlatform] : 'unknown'}`;
    }

    const formatLabels: Record<string, string> = {
      paper: 'Paper',
      digital: 'Digital',
    };
    return `Read (${book.readFormat ? formatLabels[book.readFormat] : 'unknown'})`;
  };

  return (
    <Draggable draggableId={book.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`
            bg-white rounded-lg border border-parchment shadow-sm
            ${compact ? 'p-3' : 'p-4'}
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-leather/40' : ''}
            ${onClick ? 'cursor-pointer hover:border-leather/30 hover:shadow-md' : ''}
            transition-all duration-150 touch-manipulation
            min-h-[44px]
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium text-ink truncate ${compact ? 'text-sm' : 'text-base'}`}
              >
                {book.title}
              </h3>
              <p className={`text-ink-light truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                {book.author}
              </p>

              {showConsumptionInfo && book.consumptionType && (
                <p className="text-xs text-ink-faint mt-1 italic">{getConsumptionLabel()}</p>
              )}

              {book.recommendedBy && !compact && (
                <p className="text-xs text-ink-faint mt-1 italic">
                  Recommended by {book.recommendedBy}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 text-ink-faint/50">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
