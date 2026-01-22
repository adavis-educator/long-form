'use client';

import { useState } from 'react';
import { Book, CircleMember } from '@/types';

interface RecommendBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  circleMembers: CircleMember[];
  onSend: (toUserId: string, bookTitle: string, bookAuthor: string, note?: string) => Promise<boolean>;
}

export function RecommendBookModal({
  isOpen,
  onClose,
  book,
  circleMembers,
  onSend,
}: RecommendBookModalProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!book || !selectedMember) return;

    setSending(true);
    const success = await onSend(selectedMember, book.title, book.author, note.trim() || undefined);
    setSending(false);

    if (success) {
      setSent(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setSelectedMember(null);
    setNote('');
    setSent(false);
    onClose();
  };

  if (!isOpen || !book) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={handleClose} />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Recommend Book</h2>
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
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">Recommendation Sent!</h3>
              <p className="text-ink-light">
                {circleMembers.find((m) => m.userId === selectedMember)?.displayName} will see your recommendation in their inbox.
              </p>
            </div>
          ) : (
            <>
              {/* Book Preview */}
              <div className="bg-white rounded-lg border border-parchment p-4 mb-4">
                <div className="font-serif font-medium text-ink">{book.title}</div>
                <div className="text-ink-light text-sm">by {book.author}</div>
              </div>

              {/* Select Member */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-light mb-2">
                  Recommend to
                </label>
                {circleMembers.length === 0 ? (
                  <div className="text-center py-6 bg-parchment/30 rounded-lg">
                    <p className="text-ink-light">No one in your circle yet</p>
                    <p className="text-ink-faint text-sm mt-1">
                      Invite friends to start sharing recommendations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {circleMembers.map((member) => (
                      <button
                        key={member.userId}
                        onClick={() => setSelectedMember(member.userId)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          selectedMember === member.userId
                            ? 'bg-leather/10 border-leather'
                            : 'bg-white border-parchment hover:bg-parchment/30'
                        }`}
                      >
                        <div className="w-10 h-10 bg-parchment rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-ink font-medium">
                            {member.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-ink">{member.displayName}</div>
                          <div className="text-ink-faint text-xs">@{member.username}</div>
                        </div>
                        {selectedMember === member.userId && (
                          <div className="ml-auto">
                            <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              {selectedMember && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-ink-light mb-1">
                    Add a note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base resize-none bg-white"
                    placeholder="Why you loved this book..."
                  />
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!selectedMember || sending}
                className="w-full py-3 px-4 bg-leather text-white font-medium rounded-lg hover:bg-leather-light disabled:bg-ink-faint disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Sending...' : 'Send Recommendation'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
