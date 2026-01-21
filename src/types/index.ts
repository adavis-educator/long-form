export type BookStatus = 'currently_reading' | 'have_read' | 'want_to_read';
export type ConsumptionType = 'listen' | 'read';
export type ListenPlatform = 'audible' | 'libby' | 'spotify';
export type ReadFormat = 'paper' | 'digital';
export type Priority = 1 | 2 | 3 | null;

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  notes?: string;
  status: BookStatus;
  consumptionType?: ConsumptionType;
  listenPlatform?: ListenPlatform;
  readFormat?: ReadFormat;
  recommendedBy?: string;
  priority?: Priority;
  position: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isPublic: boolean;
}

export interface BookFormData {
  title: string;
  author: string;
  notes?: string;
  status: BookStatus;
  consumptionType?: ConsumptionType;
  listenPlatform?: ListenPlatform;
  readFormat?: ReadFormat;
  recommendedBy?: string;
  priority?: Priority;
  completedAt?: string;
}

export interface DbBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  notes: string | null;
  status: BookStatus;
  consumption_type: ConsumptionType | null;
  listen_platform: ListenPlatform | null;
  read_format: ReadFormat | null;
  recommended_by: string | null;
  priority: number | null;
  position: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  is_public: boolean;
}

export function dbBookToBook(dbBook: DbBook): Book {
  return {
    id: dbBook.id,
    userId: dbBook.user_id,
    title: dbBook.title,
    author: dbBook.author,
    notes: dbBook.notes ?? undefined,
    status: dbBook.status,
    consumptionType: dbBook.consumption_type ?? undefined,
    listenPlatform: dbBook.listen_platform ?? undefined,
    readFormat: dbBook.read_format ?? undefined,
    recommendedBy: dbBook.recommended_by ?? undefined,
    priority: dbBook.priority as Priority,
    position: dbBook.position,
    createdAt: dbBook.created_at,
    updatedAt: dbBook.updated_at,
    completedAt: dbBook.completed_at ?? undefined,
    isPublic: dbBook.is_public,
  };
}

export function bookToDbBook(book: Partial<Book> & { userId?: string }): Partial<DbBook> {
  const dbBook: Partial<DbBook> = {};

  if (book.userId !== undefined) dbBook.user_id = book.userId;
  if (book.title !== undefined) dbBook.title = book.title;
  if (book.author !== undefined) dbBook.author = book.author;
  if (book.notes !== undefined) dbBook.notes = book.notes ?? null;
  if (book.status !== undefined) dbBook.status = book.status;
  if (book.consumptionType !== undefined) dbBook.consumption_type = book.consumptionType ?? null;
  if (book.listenPlatform !== undefined) dbBook.listen_platform = book.listenPlatform ?? null;
  if (book.readFormat !== undefined) dbBook.read_format = book.readFormat ?? null;
  if (book.recommendedBy !== undefined) dbBook.recommended_by = book.recommendedBy ?? null;
  if (book.priority !== undefined) dbBook.priority = book.priority;
  if (book.position !== undefined) dbBook.position = book.position;
  if (book.completedAt !== undefined) dbBook.completed_at = book.completedAt ?? null;
  if (book.isPublic !== undefined) dbBook.is_public = book.isPublic;

  return dbBook;
}
