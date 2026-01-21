'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ReadingBoard } from '@/components/ReadingBoard';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

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
          <button
            onClick={handleSignOut}
            className="text-sm text-ink-faint hover:text-ink-light"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <ReadingBoard userId={user.id} />
      </div>
    </main>
  );
}
