'use client';

import { useState } from 'react';
import { CircleInvite, Recommendation, RecommendationRequest, CircleMember } from '@/types';

interface InboxProps {
  isOpen: boolean;
  onClose: () => void;
  pendingInvites: CircleInvite[];
  incomingRecommendations: Recommendation[];
  incomingRequests: RecommendationRequest[];
  circleMembers: CircleMember[];
  onAcceptInvite: (inviteId: string) => Promise<boolean>;
  onDeclineInvite: (inviteId: string) => Promise<boolean>;
  onAddRecommendation: (rec: Recommendation) => void;
  onDismissRecommendation: (recommendationId: string) => Promise<boolean>;
  onRespondToRequest: (request: RecommendationRequest) => void;
}

type TabType = 'invites' | 'recommendations' | 'requests';

export function Inbox({
  isOpen,
  onClose,
  pendingInvites,
  incomingRecommendations,
  incomingRequests,
  onAcceptInvite,
  onDeclineInvite,
  onAddRecommendation,
  onDismissRecommendation,
  onRespondToRequest,
}: InboxProps) {
  const [activeTab, setActiveTab] = useState<TabType>('invites');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRecs = incomingRecommendations.filter((r) => r.status === 'pending');
  const openRequests = incomingRequests.filter((r) => r.status === 'open');

  const totalCount = pendingInvites.length + pendingRecs.length + openRequests.length;

  const handleAcceptInvite = async (inviteId: string) => {
    setProcessingId(inviteId);
    await onAcceptInvite(inviteId);
    setProcessingId(null);
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setProcessingId(inviteId);
    await onDeclineInvite(inviteId);
    setProcessingId(null);
  };

  const handleDismissRec = async (recId: string) => {
    setProcessingId(recId);
    await onDismissRecommendation(recId);
    setProcessingId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up flex flex-col">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl text-ink">Inbox</h2>
            {totalCount > 0 && (
              <span className="bg-leather text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
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

        {/* Tabs */}
        <div className="flex border-b border-parchment bg-cream">
          <button
            onClick={() => setActiveTab('invites')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'invites' ? 'text-leather' : 'text-ink-light'
            }`}
          >
            Circle Invites
            {pendingInvites.length > 0 && (
              <span className="ml-1.5 bg-leather/10 text-leather text-xs px-1.5 py-0.5 rounded-full">
                {pendingInvites.length}
              </span>
            )}
            {activeTab === 'invites' && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-leather" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'recommendations' ? 'text-leather' : 'text-ink-light'
            }`}
          >
            Books for You
            {pendingRecs.length > 0 && (
              <span className="ml-1.5 bg-leather/10 text-leather text-xs px-1.5 py-0.5 rounded-full">
                {pendingRecs.length}
              </span>
            )}
            {activeTab === 'recommendations' && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-leather" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'requests' ? 'text-leather' : 'text-ink-light'
            }`}
          >
            Requests
            {openRequests.length > 0 && (
              <span className="ml-1.5 bg-leather/10 text-leather text-xs px-1.5 py-0.5 rounded-full">
                {openRequests.length}
              </span>
            )}
            {activeTab === 'requests' && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-leather" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Circle Invites Tab */}
          {activeTab === 'invites' && (
            <div className="space-y-3">
              {pendingInvites.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-ink-light">No pending invites</p>
                </div>
              ) : (
                pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="bg-white rounded-lg border border-parchment p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-ink">
                          {invite.fromProfile?.displayName || 'Someone'}
                        </div>
                        <div className="text-ink-light text-sm">
                          @{invite.fromProfile?.username} wants to join your reading circle
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDeclineInvite(invite.id)}
                        disabled={processingId === invite.id}
                        className="flex-1 py-2 px-3 border border-parchment text-ink-light text-sm font-medium rounded-lg hover:bg-parchment/50 disabled:opacity-50 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptInvite(invite.id)}
                        disabled={processingId === invite.id}
                        className="flex-1 py-2 px-3 bg-leather text-white text-sm font-medium rounded-lg hover:bg-leather-light disabled:opacity-50 transition-colors"
                      >
                        {processingId === invite.id ? 'Accepting...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-3">
              {pendingRecs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-ink-light">No book recommendations yet</p>
                  <p className="text-ink-faint text-sm mt-1">Ask your circle for suggestions</p>
                </div>
              ) : (
                pendingRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-lg border border-parchment p-4"
                  >
                    <div className="mb-2">
                      <div className="font-serif font-medium text-ink">{rec.bookTitle}</div>
                      <div className="text-ink-light text-sm">by {rec.bookAuthor}</div>
                    </div>
                    <div className="text-ink-faint text-xs mb-2">
                      Recommended by {rec.fromProfile?.displayName || 'someone'}
                    </div>
                    {rec.note && (
                      <div className="text-ink-light text-sm italic bg-parchment/30 rounded p-2 mb-3">
                        &quot;{rec.note}&quot;
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDismissRec(rec.id)}
                        disabled={processingId === rec.id}
                        className="flex-1 py-2 px-3 border border-parchment text-ink-light text-sm font-medium rounded-lg hover:bg-parchment/50 disabled:opacity-50 transition-colors"
                      >
                        Not Interested
                      </button>
                      <button
                        onClick={() => onAddRecommendation(rec)}
                        disabled={processingId === rec.id}
                        className="flex-1 py-2 px-3 bg-leather text-white text-sm font-medium rounded-lg hover:bg-leather-light disabled:opacity-50 transition-colors"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {openRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-ink-light">No recommendation requests</p>
                </div>
              ) : (
                openRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-lg border border-parchment p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-leather/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-ink">
                          {req.fromProfile?.displayName || 'Someone'} is looking for a book
                        </div>
                        {req.note && (
                          <div className="text-ink-light text-sm mt-1">
                            &quot;{req.note}&quot;
                          </div>
                        )}
                        {!req.toUserId && (
                          <div className="text-ink-faint text-xs mt-1">
                            Asked their whole circle
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRespondToRequest(req)}
                      className="w-full mt-3 py-2 px-3 bg-leather text-white text-sm font-medium rounded-lg hover:bg-leather-light transition-colors"
                    >
                      Recommend a Book
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
