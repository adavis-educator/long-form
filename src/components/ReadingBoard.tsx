'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Book, BookStatus, BookFormData } from '@/types';
import { useBooksSupabase } from '@/hooks/useBooksSupabase';
import { CurrentlyReadingSection } from './sections/CurrentlyReadingSection';
import { WantToReadSection } from './sections/WantToReadSection';
import { HaveReadSection } from './sections/HaveReadSection';
import { AddBookForm } from './AddBookForm';
import { BookDetailsModal } from './BookDetailsModal';
import { ReadingStats } from './ReadingStats';

interface ReadingBoardProps {
  userId: string;
}

export function ReadingBoard({ userId }: ReadingBoardProps) {
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
          />
        </div>
      </DragDropContext>

      {/* Floating Action Button */}
      <button
        onClick={() => handleOpenAddForm()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-leather text-white rounded-full shadow-lg hover:bg-leather-light active:scale-95 transition-all flex items-center justify-center z-30"
        aria-label="Add book"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
    </>
  );
}
