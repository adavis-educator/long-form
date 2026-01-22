'use client';

import { useState } from 'react';
import { Book, PublicShelfItem } from '@/types';

interface PublicShelfManagerProps {
  isOpen: boolean;
  onClose: () => void;
  shelfItems: PublicShelfItem[];
  wantToReadBooks: Book[];
  onAddToShelf: (bookId: string, position: number) => Promise<boolean>;
  onRemoveFromShelf: (bookId: string) => Promise<boolean>;
}

export function PublicShelfManager({
  isOpen,
  onClose,
  shelfItems,
  wantToReadBooks,
  onAddToShelf,
  onRemoveFromShelf,
}: PublicShelfManagerProps) {
  const [selectingForSlot, setSelectingForSlot] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  // Create array of 5 slots
  const slots = [1, 2, 3, 4, 5].map((position) => {
    const item = shelfItems.find((i) => i.position === position);
    return {
      position,
      book: item?.book || null,
      bookId: item?.bookId || null,
    };
  });

  // Get books not already on shelf
  const availableBooks = wantToReadBooks.filter(
    (book) => !shelfItems.some((item) => item.bookId === book.id)
  );

  const handleRemove = async (bookId: string) => {
    setProcessing(true);
    await onRemoveFromShelf(bookId);
    setProcessing(false);
  };

  const handleSelectBook = async (bookId: string) => {
    if (selectingForSlot === null) return;
    setProcessing(true);
    await onAddToShelf(bookId, selectingForSlot);
    setProcessing(false);
    setSelectingForSlot(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up flex flex-col">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-ink">Your Public Shelf</h2>
            <p className="text-ink-faint text-xs">Books others see when they view your profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-ink-faint hover:text-ink-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectingForSlot !== null ? (
            // Book Selection Mode
            <>
              <button
                onClick={() => setSelectingForSlot(null)}
                className="flex items-center gap-2 text-leather text-sm font-medium mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to shelf
              </button>

              <h3 className="font-medium text-ink mb-3">
                Select a book for slot {selectingForSlot}
              </h3>

              {availableBooks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-ink-light">No more books to add</p>
                  <p className="text-ink-faint text-sm mt-1">
                    Add books to your &quot;Want to Read&quot; list first
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleSelectBook(book.id)}
                      disabled={processing}
                      className="w-full bg-white rounded-lg border border-parchment p-3 text-left hover:bg-parchment/30 transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium text-ink text-sm">{book.title}</div>
                      <div className="text-ink-light text-xs">{book.author}</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Shelf View Mode
            <>
              <p className="text-ink-light text-sm mb-4">
                Choose up to 5 books from your &quot;Want to Read&quot; list to show others. This helps friends know what to recommend.
              </p>

              <div className="space-y-3">
                {slots.map((slot) => (
                  <div
                    key={slot.position}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-ink-light font-medium text-sm">{slot.position}</span>
                    </div>

                    {slot.book ? (
                      <div className="flex-1 bg-white rounded-lg border border-parchment p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-ink text-sm">{slot.book.title}</div>
                          <div className="text-ink-light text-xs">{slot.book.author}</div>
                        </div>
                        <button
                          onClick={() => handleRemove(slot.bookId!)}
                          disabled={processing}
                          className="p-2 text-ink-faint hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectingForSlot(slot.position)}
                        disabled={processing || wantToReadBooks.length === 0}
                        className="flex-1 border-2 border-dashed border-parchment rounded-lg p-3 text-ink-faint hover:border-leather hover:text-leather transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm">+ Add a book</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {wantToReadBooks.length === 0 && (
                <div className="mt-4 p-4 bg-parchment/50 rounded-lg">
                  <p className="text-ink-light text-sm">
                    <span className="font-medium">Tip:</span> Add books to your &quot;Want to Read&quot; list first, then you can feature them on your public shelf.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
