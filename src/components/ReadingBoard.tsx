'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Book, BookStatus, BookFormData, CircleMember } from '@/types';
import { useBooksSupabase } from '@/hooks/useBooksSupabase';
import { CurrentlyReadingSection } from './sections/CurrentlyReadingSection';
import { WantToReadSection } from './sections/WantToReadSection';
import { HaveReadSection } from './sections/HaveReadSection';
import { AddBookForm } from './AddBookForm';
import { BookDetailsModal } from './BookDetailsModal';
import { ReadingStats } from './ReadingStats';
import { RecommendBookModal } from './RecommendBookModal';

interface ReadingBoardProps {
  userId: string;
  circleMembers?: CircleMember[];
  onSendRecommendation?: (toUserId: string, bookTitle: string, bookAuthor: string, note?: string) => Promise<boolean>;
}

export function ReadingBoard({ userId, circleMembers = [], onSendRecommendation }: ReadingBoardProps) {
  const {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
    moveBook,
    setPriority,
    reorderBooks,
    getBooksByStatus,
    getPriorityBooks,
  } = useBooksSupabase(userId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<BookStatus>('want_to_read');
  const [recommendBook, setRecommendBook] = useState<Book | null>(null);

  const currentlyReading = getBooksByStatus('currently_reading');
  const wantToRead = getBooksByStatus('want_to_read');
  const haveRead = getBooksByStatus('have_read');
  const priorityBooks = getPriorityBooks();

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;

      const sourceDroppableId = source.droppableId;
      const destDroppableId = destination.droppableId;

      // Handle priority slot drops
      if (destDroppableId.startsWith('priority-')) {
        const prioritySlot = parseInt(destDroppableId.split('-')[1]) as 1 | 2 | 3;
        await setPriority(draggableId, prioritySlot);
        return;
      }

      // Handle drops from priority slots to regular lists
      if (sourceDroppableId.startsWith('priority-')) {
        await setPriority(draggableId, null);

        if (destDroppableId !== 'want_to_read') {
          await moveBook(draggableId, destDroppableId as BookStatus, destination.index);
        }
        return;
      }

      // Same list reorder
      if (sourceDroppableId === destDroppableId) {
        const status = sourceDroppableId as BookStatus;
        const statusBooks = getBooksByStatus(status);
        const bookIds = statusBooks.map((b) => b.id);

        const [removed] = bookIds.splice(source.index, 1);
        bookIds.splice(destination.index, 0, removed);

        await reorderBooks(bookIds, status);
        return;
      }

      // Moving between lists
      const newStatus = destDroppableId as BookStatus;
      await moveBook(draggableId, newStatus, destination.index);
    },
    [moveBook, setPriority, reorderBooks, getBooksByStatus]
  );

  const handleAddBook = async (data: BookFormData) => {
    await addBook(data);
  };

  const handleUpdateBook = async (id: string, data: Partial<BookFormData>) => {
    await updateBook(id, data);
  };

  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleOpenAddForm = (status: BookStatus = 'want_to_read') => {
    setDefaultStatus(status);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-leather border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-serif font-medium">Error loading books</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Reading Stats */}
      <ReadingStats books={books} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="pb-24">
          <CurrentlyReadingSection
            books={currentlyReading}
            onBookClick={handleBookClick}
          />

          <WantToReadSection
            books={wantToRead}
            priorityBooks={priorityBooks}
            onBookClick={handleBookClick}
          />

          <HaveReadSection
            books={haveRead}
            onBookClick={handleBookClick}
            onRecommend={circleMembers.length > 0 ? setRecommendBook : undefined}
          />
        </div>
      </DragDropContext>

      {/* Floating Action Button */}
      <button
        onClick={() => handleOpenAddForm()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-leather text-white rounded-2xl shadow-lg hover:bg-leather-light active:scale-95 transition-all flex items-center justify-center z-30"
        aria-label="Add book"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {/* Book shape */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 19.5A2.5 2.5 0 016.5 17H20"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          />
          {/* Plus sign */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v6m3-3H9"
          />
        </svg>
      </button>

      {/* Add Book Form */}
      <AddBookForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddBook}
        defaultStatus={defaultStatus}
      />

      {/* Book Details Modal */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onUpdate={handleUpdateBook}
        onDelete={handleDeleteBook}
      />

      {/* Recommend Book Modal */}
      {onSendRecommendation && (
        <RecommendBookModal
          isOpen={!!recommendBook}
          onClose={() => setRecommendBook(null)}
          book={recommendBook}
          circleMembers={circleMembers}
          onSend={onSendRecommendation}
        />
      )}
    </>
  );
}
