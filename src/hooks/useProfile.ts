'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Profile, DbProfile, dbProfileToProfile } from '@/types';

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  createProfile: (username: string, displayName: string) => Promise<Profile | null>;
  updateProfile: (displayName: string) => Promise<Profile | null>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  findUserByUsername: (username: string) => Promise<Profile | null>;
  findUserByEmail: (email: string) => Promise<Profile | null>;
}

export function useProfile(userId: string | null): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No profile exists yet
          setProfile(null);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(dbProfileToProfile(data as DbProfile));
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
    try {
      const { data, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (checkError) throw checkError;
      return data === null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check username');
      return false;
    }
  }, []);

  const createProfile = useCallback(
    async (username: string, displayName: string): Promise<Profile | null> => {
      if (!userId) return null;

      try {
        const { data, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            username: username.toLowerCase(),
            display_name: displayName,
          })
          .select()
          .single();

        if (createError) throw createError;

        const newProfile = dbProfileToProfile(data as DbProfile);
        setProfile(newProfile);
        return newProfile;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create profile');
        return null;
      }
    },
    [userId]
  );

  const updateProfile = useCallback(
    async (displayName: string): Promise<Profile | null> => {
      if (!userId || !profile) return null;

      try {
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;

        const updatedProfile = dbProfileToProfile(data as DbProfile);
        setProfile(updatedProfile);
        return updatedProfile;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        return null;
      }
    },
    [userId, profile]
  );

  const findUserByUsername = useCallback(async (username: string): Promise<Profile | null> => {
    try {
      const { data, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (findError) {
        if (findError.code === 'PGRST116') return null;
        throw findError;
      }

      return dbProfileToProfile(data as DbProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find user');
      return null;
    }
  }, []);

  const findUserByEmail = useCallback(async (email: string): Promise<Profile | null> => {
    try {
      // First find the user ID from auth.users (requires admin or RPC)
      // For now, we'll use a simpler approach - this would need an RPC function
      // to look up users by email securely
      const { data, error: findError } = await supabase
        .rpc('find_user_by_email', { p_email: email.toLowerCase() });

      if (findError) {
        if (findError.code === 'PGRST116') return null;
        throw findError;
      }

      if (!data) return null;
      return dbProfileToProfile(data as DbProfile);
    } catch {
      // Email lookup may not be available - fall back gracefully
      return null;
    }
  }, []);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    checkUsernameAvailable,
    findUserByUsername,
    findUserByEmail,
  };
}
