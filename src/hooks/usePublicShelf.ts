'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  PublicShelfItem,
  DbPublicShelfItem,
  dbPublicShelfItemToPublicShelfItem,
  Book,
  DbBook,
  dbBookToBook,
} from '@/types';

interface UsePublicShelfResult {
  shelfItems: PublicShelfItem[];
  loading: boolean;
  error: string | null;
  addToShelf: (bookId: string, position: number) => Promise<boolean>;
  removeFromShelf: (bookId: string) => Promise<boolean>;
  reorderShelf: (bookId: string, newPosition: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function usePublicShelf(userId: string | null): UsePublicShelfResult {
  const [shelfItems, setShelfItems] = useState<PublicShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShelf = useCallback(async () => {
    if (!userId) {
      setShelfItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('public_shelf')
        .select(`
          *,
          books(*)
        `)
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;

      const items = (data || []).map((item) => {
        const i = item as DbPublicShelfItem & { books: DbBook };
        return {
          ...dbPublicShelfItemToPublicShelfItem(i),
          book: i.books ? dbBookToBook(i.books) : undefined,
        };
      });

      setShelfItems(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch public shelf');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchShelf();
  }, [fetchShelf]);

  const addToShelf = useCallback(
    async (bookId: string, position: number): Promise<boolean> => {
      if (!userId) return false;

      try {
        // Check if position is already taken
        const existingAtPosition = shelfItems.find((item) => item.position === position);

        if (existingAtPosition) {
          // Remove the existing item at this position
          await supabase
            .from('public_shelf')
            .delete()
            .eq('user_id', userId)
            .eq('position', position);
        }

        // Check if book is already on shelf
        const existingBook = shelfItems.find((item) => item.bookId === bookId);
        if (existingBook) {
          // Move to new position
          const { error: updateError } = await supabase
            .from('public_shelf')
            .update({ position })
            .eq('user_id', userId)
            .eq('book_id', bookId);

          if (updateError) throw updateError;
        } else {
          // Add new item
          const { error: insertError } = await supabase.from('public_shelf').insert({
            user_id: userId,
            book_id: bookId,
            position,
          });

          if (insertError) throw insertError;
        }

        await fetchShelf();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add to shelf');
        return false;
      }
    },
    [userId, shelfItems, fetchShelf]
  );

  const removeFromShelf = useCallback(
    async (bookId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const { error: deleteError } = await supabase
          .from('public_shelf')
          .delete()
          .eq('user_id', userId)
          .eq('book_id', bookId);

        if (deleteError) throw deleteError;

        await fetchShelf();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove from shelf');
        return false;
      }
    },
    [userId, fetchShelf]
  );

  const reorderShelf = useCallback(
    async (bookId: string, newPosition: number): Promise<boolean> => {
      return addToShelf(bookId, newPosition);
    },
    [addToShelf]
  );

  return {
    shelfItems,
    loading,
    error,
    addToShelf,
    removeFromShelf,
    reorderShelf,
    refresh: fetchShelf,
  };
}

// Hook to fetch another user's public shelf
export function useOtherUserShelf(username: string | null) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOtherShelf = async () => {
      if (!username) {
        setBooks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // First get the user ID from username
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', username.toLowerCase())
          .single();

        if (profError) throw profError;

        // Then get their public shelf with book details
        const { data, error: fetchError } = await supabase
          .from('public_shelf')
          .select(`
            position,
            books(*)
          `)
          .eq('user_id', profile.user_id)
          .order('position', { ascending: true });

        if (fetchError) throw fetchError;

        const booksList = (data || [])
          .filter((item) => item.books)
          .map((item) => dbBookToBook(item.books as unknown as DbBook));

        setBooks(booksList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch shelf');
      } finally {
        setLoading(false);
      }
    };

    fetchOtherShelf();
  }, [username]);

  return { books, loading, error };
}
