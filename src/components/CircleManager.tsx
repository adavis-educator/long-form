'use client';

import { useState } from 'react';
import { CircleMember, CircleInvite, Profile } from '@/types';

interface CircleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile | null;
  members: CircleMember[];
  sentInvites: CircleInvite[];
  onRemoveMember: (memberId: string) => Promise<boolean>;
  onOpenFindPeople: () => void;
}

export function CircleManager({
  isOpen,
  onClose,
  currentProfile,
  members,
  sentInvites,
  onRemoveMember,
  onOpenFindPeople,
}: CircleManagerProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<CircleMember | null>(null);

  const handleRemove = async (member: CircleMember) => {
    setRemoving(member.userId);
    await onRemoveMember(member.userId);
    setRemoving(null);
    setConfirmRemove(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up flex flex-col">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-ink">Your Circle</h2>
            {currentProfile && (
              <p className="text-ink-faint text-xs">@{currentProfile.username}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-ink-faint hover:text-ink-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Members List */}
          {members.length === 0 && sentInvites.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-parchment rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg text-ink mb-2">No one here yet</h3>
              <p className="text-ink-light mb-4">
                Start building your reading circle by inviting friends.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenFindPeople();
                }}
                className="px-4 py-2 bg-leather text-white font-medium rounded-lg hover:bg-leather-light transition-colors"
              >
                Find People
              </button>
            </div>
          ) : (
            <>
              {/* Active Members */}
              {members.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-ink-light mb-3">
                    Circle Members ({members.length})
                  </h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.userId}
                        className="bg-white rounded-lg border border-parchment p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-parchment rounded-full flex items-center justify-center">
                            <span className="text-ink font-medium">
                              {member.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-ink">{member.displayName}</div>
                            <div className="text-ink-faint text-xs">@{member.username}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setConfirmRemove(member)}
                          className="p-2 text-ink-faint hover:text-red-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Invites I've Sent */}
              {sentInvites.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-ink-light mb-3">
                    Pending Invites ({sentInvites.length})
                  </h3>
                  <div className="space-y-2">
                    {sentInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="bg-parchment/30 rounded-lg border border-parchment p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-parchment rounded-full flex items-center justify-center">
                            <span className="text-ink-faint font-medium">
                              {invite.toProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-ink-light">
                              {invite.toProfile?.displayName || 'Unknown'}
                            </div>
                            <div className="text-ink-faint text-xs">
                              @{invite.toProfile?.username} • Waiting for response
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-ink-faint bg-parchment px-2 py-1 rounded">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add More Button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenFindPeople();
                }}
                className="w-full mt-4 py-3 px-4 border-2 border-dashed border-parchment rounded-lg text-leather font-medium hover:bg-parchment/30 transition-colors"
              >
                + Find More People
              </button>
            </>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setConfirmRemove(null)} />
          <div className="relative bg-cream rounded-xl p-6 max-w-sm w-full shadow-xl border border-parchment">
            <h3 className="font-serif text-lg text-ink mb-2">Remove from Circle?</h3>
            <p className="text-ink-light mb-4">
              Are you sure you want to remove {confirmRemove.displayName} from your reading circle?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2.5 px-4 border border-parchment text-ink-light font-medium rounded-lg hover:bg-parchment/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirmRemove)}
                disabled={removing === confirmRemove.userId}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-ink-faint transition-colors"
              >
                {removing === confirmRemove.userId ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
