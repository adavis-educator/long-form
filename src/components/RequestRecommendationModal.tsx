'use client';

import { useState } from 'react';
import { CircleMember } from '@/types';

interface RequestRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleMembers: CircleMember[];
  onRequest: (toUserId: string | null, note?: string) => Promise<boolean>;
}

export function RequestRecommendationModal({
  isOpen,
  onClose,
  circleMembers,
  onRequest,
}: RequestRecommendationModalProps) {
  const [askWho, setAskWho] = useState<'everyone' | 'specific'>('everyone');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const toUserId = askWho === 'specific' ? selectedMember : null;

    setSending(true);
    const success = await onRequest(toUserId, note.trim() || undefined);
    setSending(false);

    if (success) {
      setSent(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setAskWho('everyone');
    setSelectedMember(null);
    setNote('');
    setSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={handleClose} />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Ask for a Recommendation</h2>
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
              <h3 className="font-serif text-xl text-ink mb-2">Request Sent!</h3>
              <p className="text-ink-light">
                {askWho === 'everyone'
                  ? 'Your circle will see your request.'
                  : `${circleMembers.find((m) => m.userId === selectedMember)?.displayName} will see your request.`}
              </p>
            </div>
          ) : circleMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-parchment rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-ink mb-2">No one to ask yet</h3>
              <p className="text-ink-light">
                Invite friends to your reading circle first, then you can ask them for book recommendations.
              </p>
            </div>
          ) : (
            <>
              {/* Ask Who */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-light mb-2">
                  Who do you want to ask?
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAskWho('everyone');
                      setSelectedMember(null);
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      askWho === 'everyone'
                        ? 'bg-leather/10 border-leather text-leather'
                        : 'border-parchment text-ink-light hover:bg-parchment/50'
                    }`}
                  >
                    My Whole Circle
                  </button>
                  <button
                    onClick={() => setAskWho('specific')}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      askWho === 'specific'
                        ? 'bg-leather/10 border-leather text-leather'
                        : 'border-parchment text-ink-light hover:bg-parchment/50'
                    }`}
                  >
                    Specific Person
                  </button>
                </div>
              </div>

              {/* Select Member */}
              {askWho === 'specific' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-ink-light mb-2">
                    Select who to ask
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
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
                </div>
              )}

              {/* Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-light mb-1">
                  What are you in the mood for? (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base resize-none bg-white"
                  placeholder="Looking for something uplifting..."
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={(askWho === 'specific' && !selectedMember) || sending}
                className="w-full py-3 px-4 bg-leather text-white font-medium rounded-lg hover:bg-leather-light disabled:bg-ink-faint disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
