'use client';

import { useState } from 'react';
import { Profile } from '@/types';

interface FindPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userId: string) => Promise<boolean>;
  findByUsername: (username: string) => Promise<Profile | null>;
  currentUserId: string | null;
}

export function FindPeopleModal({
  isOpen,
  onClose,
  onInvite,
  findByUsername,
  currentUserId,
}: FindPeopleModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<Profile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setFoundUser(null);
    setNotFound(false);
    setInvited(false);

    const user = await findByUsername(searchQuery.trim());

    if (user && user.userId !== currentUserId) {
      setFoundUser(user);
    } else if (user?.userId === currentUserId) {
      setNotFound(true); // Can't add yourself
    } else {
      setNotFound(true);
    }

    setSearching(false);
  };

  const handleInvite = async () => {
    if (!foundUser) return;

    setInviting(true);
    const success = await onInvite(foundUser.userId);
    setInviting(false);

    if (success) {
      setInvited(true);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setFoundUser(null);
    setNotFound(false);
    setInvited(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Find People</h2>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-ink-faint hover:text-ink-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <label className="block text-sm font-medium text-ink-light mb-2">
              Search by username
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">@</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full pl-8 pr-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-white"
                  placeholder="username"
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim() || searching}
                className="px-4 py-2.5 bg-leather text-white font-medium rounded-lg hover:bg-leather-light disabled:bg-ink-faint disabled:cursor-not-allowed transition-colors"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Results */}
          {notFound && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-ink-light">No user found with that username</p>
              <p className="text-ink-faint text-sm mt-1">Make sure you typed it correctly</p>
            </div>
          )}

          {foundUser && (
            <div className="bg-white rounded-lg border border-parchment p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-ink">{foundUser.displayName}</div>
                  <div className="text-ink-light text-sm">@{foundUser.username}</div>
                </div>
                {invited ? (
                  <div className="flex items-center gap-2 text-forest">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Invite Sent</span>
                  </div>
                ) : (
                  <button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="px-4 py-2 bg-leather text-white text-sm font-medium rounded-lg hover:bg-leather-light disabled:bg-ink-faint transition-colors"
                  >
                    {inviting ? 'Sending...' : 'Invite to Circle'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="mt-6 p-4 bg-parchment/50 rounded-lg">
            <p className="text-ink-light text-sm">
              <span className="font-medium">Tip:</span> Ask your friends for their Long Form username so you can add them to your reading circle.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
