'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Recommendation,
  RecommendationRequest,
  DbRecommendation,
  DbRecommendationRequest,
  DbProfile,
  dbRecommendationToRecommendation,
  dbRequestToRequest,
  dbProfileToProfile,
  CircleMember,
} from '@/types';

interface UseRecommendationsResult {
  // Recommendations I've received
  incomingRecommendations: Recommendation[];
  // Recommendations I've sent
  sentRecommendations: Recommendation[];
  // Requests for recommendations (from me or to me)
  incomingRequests: RecommendationRequest[];
  myRequests: RecommendationRequest[];
  loading: boolean;
  error: string | null;
  // Actions
  sendRecommendation: (
    toUserId: string,
    bookTitle: string,
    bookAuthor: string,
    note?: string
  ) => Promise<boolean>;
  markRecommendationAdded: (recommendationId: string) => Promise<boolean>;
  dismissRecommendation: (recommendationId: string) => Promise<boolean>;
  requestRecommendation: (toUserId: string | null, note?: string) => Promise<boolean>;
  closeRequest: (requestId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useRecommendations(
  userId: string | null,
  circleMembers: CircleMember[]
): UseRecommendationsResult {
  const [incomingRecommendations, setIncomingRecommendations] = useState<Recommendation[]>([]);
  const [sentRecommendations, setSentRecommendations] = useState<Recommendation[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RecommendationRequest[]>([]);
  const [myRequests, setMyRequests] = useState<RecommendationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) {
      setIncomingRecommendations([]);
      setSentRecommendations([]);
      setIncomingRequests([]);
      setMyRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch recommendations I've received
      const { data: incoming, error: inError } = await supabase
        .from('recommendations')
        .select(`
          *,
          from_profile:profiles!recommendations_from_user_id_fkey(*)
        `)
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      if (inError) throw inError;

      setIncomingRecommendations(
        (incoming || []).map((rec) => {
          const r = rec as DbRecommendation & { from_profile: DbProfile };
          return {
            ...dbRecommendationToRecommendation(r),
            fromProfile: r.from_profile ? dbProfileToProfile(r.from_profile) : undefined,
          };
        })
      );

      // Fetch recommendations I've sent
      const { data: sent, error: sentError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      setSentRecommendations(
        (sent || []).map((r) => dbRecommendationToRecommendation(r as DbRecommendation))
      );

      // Fetch recommendation requests directed to me or to my circle (when to_user_id is null)
      const circleMemberIds = circleMembers.map((m) => m.userId);

      // Requests directed specifically to me
      const { data: directRequests, error: directError } = await supabase
        .from('recommendation_requests')
        .select(`
          *,
          from_profile:profiles!recommendation_requests_from_user_id_fkey(*)
        `)
        .eq('to_user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (directError) throw directError;

      // Requests to full circle from my circle members
      let circleRequests: RecommendationRequest[] = [];
      if (circleMemberIds.length > 0) {
        const { data: broadcastRequests, error: broadcastError } = await supabase
          .from('recommendation_requests')
          .select(`
            *,
            from_profile:profiles!recommendation_requests_from_user_id_fkey(*)
          `)
          .is('to_user_id', null)
          .in('from_user_id', circleMemberIds)
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (broadcastError) throw broadcastError;

        circleRequests = (broadcastRequests || []).map((req) => {
          const r = req as DbRecommendationRequest & { from_profile: DbProfile };
          return {
            ...dbRequestToRequest(r),
            fromProfile: r.from_profile ? dbProfileToProfile(r.from_profile) : undefined,
          };
        });
      }

      const allIncomingRequests = [
        ...(directRequests || []).map((req) => {
          const r = req as DbRecommendationRequest & { from_profile: DbProfile };
          return {
            ...dbRequestToRequest(r),
            fromProfile: r.from_profile ? dbProfileToProfile(r.from_profile) : undefined,
          };
        }),
        ...circleRequests,
      ];
      setIncomingRequests(allIncomingRequests);

      // Fetch my own requests
      const { data: mine, error: mineError } = await supabase
        .from('recommendation_requests')
        .select(`
          *,
          to_profile:profiles!recommendation_requests_to_user_id_fkey(*)
        `)
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      if (mineError) throw mineError;

      setMyRequests(
        (mine || []).map((req) => {
          const r = req as DbRecommendationRequest & { to_profile: DbProfile | null };
          return {
            ...dbRequestToRequest(r),
            toProfile: r.to_profile ? dbProfileToProfile(r.to_profile) : undefined,
          };
        })
      );

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [userId, circleMembers]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const sendRecommendation = useCallback(
    async (
      toUserId: string,
      bookTitle: string,
      bookAuthor: string,
      note?: string
    ): Promise<boolean> => {
      if (!userId) return false;

      try {
        const { error: insertError } = await supabase.from('recommendations').insert({
          from_user_id: userId,
          to_user_id: toUserId,
          book_title: bookTitle,
          book_author: bookAuthor,
          note: note || null,
          status: 'pending',
        });

        if (insertError) throw insertError;

        await fetchRecommendations();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send recommendation');
        return false;
      }
    },
    [userId, fetchRecommendations]
  );

  const markRecommendationAdded = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('recommendations')
          .update({ status: 'added' })
          .eq('id', recommendationId);

        if (updateError) throw updateError;

        await fetchRecommendations();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update recommendation');
        return false;
      }
    },
    [fetchRecommendations]
  );

  const dismissRecommendation = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('recommendations')
          .update({ status: 'dismissed' })
          .eq('id', recommendationId);

        if (updateError) throw updateError;

        await fetchRecommendations();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to dismiss recommendation');
        return false;
      }
    },
    [fetchRecommendations]
  );

  const requestRecommendation = useCallback(
    async (toUserId: string | null, note?: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const { error: insertError } = await supabase.from('recommendation_requests').insert({
          from_user_id: userId,
          to_user_id: toUserId,
          note: note || null,
          status: 'open',
        });

        if (insertError) throw insertError;

        await fetchRecommendations();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create request');
        return false;
      }
    },
    [userId, fetchRecommendations]
  );

  const closeRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('recommendation_requests')
          .update({ status: 'closed' })
          .eq('id', requestId);

        if (updateError) throw updateError;

        await fetchRecommendations();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to close request');
        return false;
      }
    },
    [fetchRecommendations]
  );

  return {
    incomingRecommendations,
    sentRecommendations,
    incomingRequests,
    myRequests,
    loading,
    error,
    sendRecommendation,
    markRecommendationAdded,
    dismissRecommendation,
    requestRecommendation,
    closeRequest,
    refresh: fetchRecommendations,
  };
}
