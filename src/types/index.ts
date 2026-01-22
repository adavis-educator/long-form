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

// =============================================
// SOCIAL FEATURES - TYPES
// =============================================

export type InviteStatus = 'pending' | 'accepted' | 'declined';
export type RecommendationStatus = 'pending' | 'added' | 'dismissed';
export type RequestStatus = 'open' | 'fulfilled' | 'closed';

// Profile
export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export function dbProfileToProfile(db: DbProfile): Profile {
  return {
    id: db.id,
    userId: db.user_id,
    username: db.username,
    displayName: db.display_name,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Circle Invite
export interface CircleInvite {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: InviteStatus;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  fromProfile?: Profile;
  toProfile?: Profile;
}

export interface DbCircleInvite {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: InviteStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  from_profile?: DbProfile;
  to_profile?: DbProfile;
}

export function dbCircleInviteToCircleInvite(db: DbCircleInvite): CircleInvite {
  return {
    id: db.id,
    fromUserId: db.from_user_id,
    toUserId: db.to_user_id,
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    fromProfile: db.from_profile ? dbProfileToProfile(db.from_profile) : undefined,
    toProfile: db.to_profile ? dbProfileToProfile(db.to_profile) : undefined,
  };
}

// Connection (circle member)
export interface Connection {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  // The other user's profile (computed based on current user)
  profile?: Profile;
}

export interface DbConnection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
}

// Circle Member (simplified view of a connection)
export interface CircleMember {
  userId: string;
  username: string;
  displayName: string;
}

// Public Shelf Item
export interface PublicShelfItem {
  id: string;
  userId: string;
  bookId: string;
  position: number;
  createdAt: string;
  book?: Book;
}

export interface DbPublicShelfItem {
  id: string;
  user_id: string;
  book_id: string;
  position: number;
  created_at: string;
  books?: DbBook;
}

export function dbPublicShelfItemToPublicShelfItem(db: DbPublicShelfItem): PublicShelfItem {
  return {
    id: db.id,
    userId: db.user_id,
    bookId: db.book_id,
    position: db.position,
    createdAt: db.created_at,
    book: db.books ? dbBookToBook(db.books) : undefined,
  };
}

// Recommendation
export interface Recommendation {
  id: string;
  fromUserId: string;
  toUserId: string;
  bookTitle: string;
  bookAuthor: string;
  note?: string;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  fromProfile?: Profile;
}

export interface DbRecommendation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  book_title: string;
  book_author: string;
  note: string | null;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  from_profile?: DbProfile;
}

export function dbRecommendationToRecommendation(db: DbRecommendation): Recommendation {
  return {
    id: db.id,
    fromUserId: db.from_user_id,
    toUserId: db.to_user_id,
    bookTitle: db.book_title,
    bookAuthor: db.book_author,
    note: db.note ?? undefined,
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    fromProfile: db.from_profile ? dbProfileToProfile(db.from_profile) : undefined,
  };
}

// Recommendation Request
export interface RecommendationRequest {
  id: string;
  fromUserId: string;
  toUserId?: string; // null = asking full circle
  note?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  fromProfile?: Profile;
  toProfile?: Profile;
}

export interface DbRecommendationRequest {
  id: string;
  from_user_id: string;
  to_user_id: string | null;
  note: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  from_profile?: DbProfile;
  to_profile?: DbProfile;
}

export function dbRequestToRequest(db: DbRecommendationRequest): RecommendationRequest {
  return {
    id: db.id,
    fromUserId: db.from_user_id,
    toUserId: db.to_user_id ?? undefined,
    note: db.note ?? undefined,
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    fromProfile: db.from_profile ? dbProfileToProfile(db.from_profile) : undefined,
    toProfile: db.to_profile ? dbProfileToProfile(db.to_profile) : undefined,
  };
}
