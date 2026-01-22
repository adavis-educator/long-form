'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ReadingBoard } from '@/components/ReadingBoard';
import { ProfileSetup } from '@/components/ProfileSetup';
import { Inbox } from '@/components/Inbox';
import { FindPeopleModal } from '@/components/FindPeopleModal';
import { CircleManager } from '@/components/CircleManager';
import { PublicShelfManager } from '@/components/PublicShelfManager';
import { RequestRecommendationModal } from '@/components/RequestRecommendationModal';
import { useProfile } from '@/hooks/useProfile';
import { useCircle } from '@/hooks/useCircle';
import { useRecommendations } from '@/hooks/useRecommendations';
import { usePublicShelf } from '@/hooks/usePublicShelf';
import { useBooksSupabase } from '@/hooks/useBooksSupabase';
import { User } from '@supabase/supabase-js';
import { Recommendation } from '@/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Modal states
  const [showInbox, setShowInbox] = useState(false);
  const [showFindPeople, setShowFindPeople] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const [showPublicShelf, setShowPublicShelf] = useState(false);
  const [showRequestRec, setShowRequestRec] = useState(false);

  // Hooks
  const { profile, createProfile, checkUsernameAvailable, findUserByUsername } = useProfile(user?.id ?? null);
  const { members, pendingInvites, sentInvites, sendInvite, acceptInvite, declineInvite, removeConnection } = useCircle(user?.id ?? null);
  const {
    incomingRecommendations,
    incomingRequests,
    sendRecommendation,
    markRecommendationAdded,
    dismissRecommendation,
    requestRecommendation,
  } = useRecommendations(user?.id ?? null, members);
  const { shelfItems, addToShelf, removeFromShelf } = usePublicShelf(user?.id ?? null);
  const { getBooksByStatus, addBook } = useBooksSupabase(user?.id ?? null);

  const wantToReadBooks = getBooksByStatus('want_to_read');

  // Calculate unread counts
  const pendingRecs = incomingRecommendations.filter((r) => r.status === 'pending');
  const openRequests = incomingRequests.filter((r) => r.status === 'open');
  const totalUnread = pendingInvites.length + pendingRecs.length + openRequests.length;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileCreate = async (username: string, displayName: string) => {
    await createProfile(username, displayName);
  };

  const handleAddRecommendationToList = async (rec: Recommendation) => {
    // Add the book to want_to_read with recommendedBy set
    await addBook({
      title: rec.bookTitle,
      author: rec.bookAuthor,
      status: 'want_to_read',
      recommendedBy: rec.fromProfile?.displayName || 'A friend',
    });
    // Mark the recommendation as added
    await markRecommendationAdded(rec.id);
  };

  const handleRespondToRequest = () => {
    // Close inbox - user will use the "Recommend" feature from their Have Read books
    setShowInbox(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-leather border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-ink mb-2">Long Form</h1>
            <p className="text-ink-light italic">For those who still read the whole book</p>
          </div>

          <form onSubmit={handleAuth} className="bg-white rounded-xl shadow-sm border border-parchment p-6 space-y-4">
            <h2 className="font-serif text-xl text-ink">
              {isSignUp ? 'Join the readers' : 'Welcome back'}
            </h2>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-cream/50"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-cream/50"
                placeholder="Your password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 bg-leather text-white font-medium rounded-lg hover:bg-leather-light disabled:bg-ink-faint disabled:cursor-not-allowed transition-colors"
            >
              {authLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              className="w-full text-sm text-leather hover:text-leather-light"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-parchment z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-ink">Long Form</h1>
          <div className="flex items-center gap-2">
            {/* Inbox Button */}
            <button
              onClick={() => setShowInbox(true)}
              className="relative p-2 text-ink-faint hover:text-ink-light transition-colors"
              title="Inbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-leather text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </button>

            {/* Circle Button */}
            <button
              onClick={() => setShowCircle(true)}
              className="p-2 text-ink-faint hover:text-ink-light transition-colors"
              title="Your Circle"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Menu Dropdown */}
            <div className="relative group">
              <button className="p-2 text-ink-faint hover:text-ink-light transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-parchment opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                <button
                  onClick={() => setShowPublicShelf(true)}
                  className="w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-parchment/50 transition-colors rounded-t-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Public Shelf
                </button>
                <button
                  onClick={() => setShowRequestRec(true)}
                  className="w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-parchment/50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ask for Recommendation
                </button>
                <button
                  onClick={() => setShowFindPeople(true)}
                  className="w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-parchment/50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Find People
                </button>
                <div className="border-t border-parchment">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-left text-sm text-ink-faint hover:text-ink hover:bg-parchment/50 transition-colors rounded-b-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <ReadingBoard
          userId={user.id}
          circleMembers={members}
          onSendRecommendation={sendRecommendation}
        />
      </div>

      {/* Profile Setup Modal */}
      <ProfileSetup
        isOpen={!profile && user !== null}
        onComplete={handleProfileCreate}
        checkUsernameAvailable={checkUsernameAvailable}
      />

      {/* Inbox Modal */}
      <Inbox
        isOpen={showInbox}
        onClose={() => setShowInbox(false)}
        pendingInvites={pendingInvites}
        incomingRecommendations={incomingRecommendations}
        incomingRequests={incomingRequests}
        circleMembers={members}
        onAcceptInvite={acceptInvite}
        onDeclineInvite={declineInvite}
        onAddRecommendation={handleAddRecommendationToList}
        onDismissRecommendation={dismissRecommendation}
        onRespondToRequest={handleRespondToRequest}
      />

      {/* Find People Modal */}
      <FindPeopleModal
        isOpen={showFindPeople}
        onClose={() => setShowFindPeople(false)}
        onInvite={sendInvite}
        findByUsername={findUserByUsername}
        currentUserId={user?.id ?? null}
      />

      {/* Circle Manager Modal */}
      <CircleManager
        isOpen={showCircle}
        onClose={() => setShowCircle(false)}
        currentProfile={profile}
        members={members}
        sentInvites={sentInvites}
        onRemoveMember={removeConnection}
        onOpenFindPeople={() => setShowFindPeople(true)}
      />

      {/* Public Shelf Manager Modal */}
      <PublicShelfManager
        isOpen={showPublicShelf}
        onClose={() => setShowPublicShelf(false)}
        shelfItems={shelfItems}
        wantToReadBooks={wantToReadBooks}
        onAddToShelf={addToShelf}
        onRemoveFromShelf={removeFromShelf}
      />

      {/* Request Recommendation Modal */}
      <RequestRecommendationModal
        isOpen={showRequestRec}
        onClose={() => setShowRequestRec(false)}
        circleMembers={members}
        onRequest={requestRecommendation}
      />
    </main>
  );
}
