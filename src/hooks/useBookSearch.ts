'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface BookSearchResult {
  title: string;
  author: string;
  key: string; // Open Library ID
  firstPublishYear?: number;
  coverUrl?: string;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
  numFound: number;
}

export function useBookSearch(query: string, enabled: boolean = true) {
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchBooks = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodedQuery}&limit=6&fields=key,title,author_name,first_publish_year,cover_i`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      const data: OpenLibraryResponse = await response.json();

      const books: BookSearchResult[] = data.docs
        .filter((doc) => doc.title && doc.author_name?.length)
        .map((doc) => ({
          key: doc.key,
          title: doc.title,
          author: doc.author_name?.[0] || 'Unknown Author',
          firstPublishYear: doc.first_publish_year,
          coverUrl: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`
            : undefined,
        }));

      setResults(books);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!enabled) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchBooks(query);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, enabled, searchBooks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, loading, error, clearResults };
}
