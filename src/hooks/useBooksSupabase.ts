'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Book,
  BookStatus,
  BookFormData,
  DbBook,
  dbBookToBook,
  bookToDbBook,
  Priority,
} from '@/types';

interface UseBooksResult {
  books: Book[];
  loading: boolean;
  error: string | null;
  addBook: (data: BookFormData) => Promise<Book | null>;
  updateBook: (id: string, data: Partial<BookFormData>) => Promise<Book | null>;
  deleteBook: (id: string) => Promise<boolean>;
  moveBook: (bookId: string, newStatus: BookStatus, newPosition: number) => Promise<boolean>;
  setPriority: (bookId: string, priority: Priority) => Promise<boolean>;
  reorderBooks: (bookIds: string[], status: BookStatus) => Promise<boolean>;
  getBooksByStatus: (status: BookStatus) => Book[];
  getPriorityBooks: () => (Book | null)[];
}

export function useBooksSupabase(userId: string | null): UseBooksResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    if (!userId) {
      setBooks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;

      const mappedBooks = (data as DbBook[]).map(dbBookToBook);
      setBooks(mappedBooks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const getNextPosition = useCallback(
    (status: BookStatus): number => {
      const statusBooks = books.filter((b) => b.status === status);
      if (statusBooks.length === 0) return 0;
      return Math.max(...statusBooks.map((b) => b.position)) + 1;
    },
    [books]
  );

  const addBook = useCallback(
    async (data: BookFormData): Promise<Book | null> => {
      if (!userId) return null;

      try {
        const position = getNextPosition(data.status);
        const newBook = {
          ...bookToDbBook({ ...data, userId }),
          position,
          completed_at: data.status === 'have_read' ? new Date().toISOString() : null,
        };

        const { data: inserted, error: insertError } = await supabase
          .from('books')
          .insert(newBook)
          .select()
          .single();

        if (insertError) throw insertError;

        const book = dbBookToBook(inserted as DbBook);
        setBooks((prev) => [...prev, book]);
        return book;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add book');
        return null;
      }
    },
    [userId, getNextPosition]
  );

  const updateBook = useCallback(
    async (id: string, data: Partial<BookFormData>): Promise<Book | null> => {
      try {
        const updates = bookToDbBook(data);

        // If status changes to have_read, set completed_at
        if (data.status === 'have_read') {
          const currentBook = books.find((b) => b.id === id);
          if (currentBook?.status !== 'have_read') {
            (updates as Partial<DbBook>).completed_at = new Date().toISOString();
          }
        }

        const { data: updated, error: updateError } = await supabase
          .from('books')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        const book = dbBookToBook(updated as DbBook);
        setBooks((prev) => prev.map((b) => (b.id === id ? book : b)));
        return book;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update book');
        return null;
      }
    },
    [books]
  );

  const deleteBook = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.from('books').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setBooks((prev) => prev.filter((b) => b.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
      return false;
    }
  }, []);

  const moveBook = useCallback(
    async (bookId: string, newStatus: BookStatus, newPosition: number): Promise<boolean> => {
      try {
        const book = books.find((b) => b.id === bookId);
        if (!book) return false;

        const updates: Partial<DbBook> = {
          status: newStatus,
          position: newPosition,
        };

        // Clear priority if moving out of want_to_read
        if (book.status === 'want_to_read' && newStatus !== 'want_to_read') {
          updates.priority = null;
        }

        // Set completed_at if moving to have_read
        if (newStatus === 'have_read' && book.status !== 'have_read') {
          updates.completed_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('books')
          .update(updates)
          .eq('id', bookId);

        if (updateError) throw updateError;

        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  status: newStatus,
                  position: newPosition,
                  priority: newStatus === 'want_to_read' ? b.priority : undefined,
                  completedAt: updates.completed_at ?? b.completedAt,
                }
              : b
          )
        );

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to move book');
        return false;
      }
    },
    [books]
  );

  const setPriority = useCallback(
    async (bookId: string, priority: Priority): Promise<boolean> => {
      try {
        // If setting a priority, clear it from any other book first
        if (priority !== null) {
          const existingPriorityBook = books.find(
            (b) => b.priority === priority && b.id !== bookId
          );
          if (existingPriorityBook) {
            await supabase
              .from('books')
              .update({ priority: null })
              .eq('id', existingPriorityBook.id);
          }
        }

        const { error: updateError } = await supabase
          .from('books')
          .update({ priority })
          .eq('id', bookId);

        if (updateError) throw updateError;

        setBooks((prev) =>
          prev.map((b) => {
            if (b.id === bookId) {
              return { ...b, priority };
            }
            // Clear priority from other book if we took its slot
            if (priority !== null && b.priority === priority) {
              return { ...b, priority: undefined };
            }
            return b;
          })
        );

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set priority');
        return false;
      }
    },
    [books]
  );

  const reorderBooks = useCallback(
    async (bookIds: string[], status: BookStatus): Promise<boolean> => {
      try {
        // Update positions based on array order
        const updates = bookIds.map((id, index) => ({
          id,
          position: index,
        }));

        // Batch update in parallel
        await Promise.all(
          updates.map(({ id, position }) =>
            supabase.from('books').update({ position }).eq('id', id)
          )
        );

        setBooks((prev) =>
          prev.map((book) => {
            const newIndex = bookIds.indexOf(book.id);
            if (newIndex !== -1 && book.status === status) {
              return { ...book, position: newIndex };
            }
            return book;
          })
        );

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reorder books');
        return false;
      }
    },
    []
  );

  const getBooksByStatus = useCallback(
    (status: BookStatus): Book[] => {
      return books
        .filter((b) => b.status === status)
        .sort((a, b) => a.position - b.position);
    },
    [books]
  );

  const getPriorityBooks = useCallback((): (Book | null)[] => {
    const slots: (Book | null)[] = [null, null, null];
    books
      .filter((b) => b.status === 'want_to_read' && b.priority)
      .forEach((book) => {
        if (book.priority && book.priority >= 1 && book.priority <= 3) {
          slots[book.priority - 1] = book;
        }
      });
    return slots;
  }, [books]);

  return {
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
  };
}
