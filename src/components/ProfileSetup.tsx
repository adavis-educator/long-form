'use client';

import { useState, useEffect } from 'react';

interface ProfileSetupProps {
  isOpen: boolean;
  onComplete: (username: string, displayName: string) => Promise<void>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

export function ProfileSetup({
  isOpen,
  onComplete,
  checkUsernameAvailable,
}: ProfileSetupProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validate username format
  const validateUsername = (value: string): string | null => {
    if (value.length < 3) return 'Must be at least 3 characters';
    if (value.length > 20) return 'Must be 20 characters or less';
    if (!/^[a-z0-9_]+$/.test(value)) return 'Only lowercase letters, numbers, and underscores';
    return null;
  };

  // Check username availability when it changes
  useEffect(() => {
    const formatError = validateUsername(username);
    if (formatError || !username) {
      setUsernameError(formatError);
      return;
    }

    setChecking(true);
    const timeoutId = setTimeout(async () => {
      const available = await checkUsernameAvailable(username);
      setUsernameError(available ? null : 'Username is taken');
      setChecking(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameError || !username || !displayName.trim()) return;

    setSubmitting(true);
    try {
      await onComplete(username, displayName.trim());
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-cream rounded-2xl shadow-2xl max-w-md w-full p-6 border border-parchment">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-leather/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-ink mb-2">Set Up Your Profile</h2>
            <p className="text-ink-light text-sm">
              Create a username so your reading circle can find you and share recommendations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className={`w-full pl-8 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-leather/30 text-base bg-white ${
                    usernameError ? 'border-red-400' : 'border-parchment focus:border-leather'
                  }`}
                  placeholder="yourname"
                  maxLength={20}
                  required
                />
                {checking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-ink-faint" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
                {!checking && username && !usernameError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-5 w-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="text-red-600 text-xs mt-1">{usernameError}</p>
              )}
              <p className="text-ink-faint text-xs mt-1">
                3-20 characters, lowercase letters, numbers, and underscores only
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-white"
                placeholder="Your Name"
                maxLength={50}
                required
              />
              <p className="text-ink-faint text-xs mt-1">
                This is what your circle will see
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!!usernameError || !username || !displayName.trim() || checking || submitting}
              className="w-full py-3 px-4 bg-leather text-white font-medium rounded-lg hover:bg-leather-light disabled:bg-ink-faint disabled:cursor-not-allowed transition-colors mt-6"
            >
              {submitting ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
