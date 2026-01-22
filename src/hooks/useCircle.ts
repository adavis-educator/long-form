'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  CircleInvite,
  CircleMember,
  DbCircleInvite,
  DbProfile,
  dbCircleInviteToCircleInvite,
  dbProfileToProfile,
} from '@/types';

interface UseCircleResult {
  members: CircleMember[];
  pendingInvites: CircleInvite[]; // Invites I've received
  sentInvites: CircleInvite[]; // Invites I've sent
  loading: boolean;
  error: string | null;
  sendInvite: (toUserId: string) => Promise<boolean>;
  acceptInvite: (inviteId: string) => Promise<boolean>;
  declineInvite: (inviteId: string) => Promise<boolean>;
  removeConnection: (memberId: string) => Promise<boolean>;
  refreshCircle: () => Promise<void>;
}

export function useCircle(userId: string | null): UseCircleResult {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CircleInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<CircleInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCircle = useCallback(async () => {
    if (!userId) {
      setMembers([]);
      setPendingInvites([]);
      setSentInvites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch connections and member profiles
      const { data: connections, error: connError } = await supabase
        .from('connections')
        .select('id, user_a_id, user_b_id, created_at')
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

      if (connError) throw connError;

      // Get the other user's ID for each connection
      const otherUserIds = (connections || []).map((c) =>
        c.user_a_id === userId ? c.user_b_id : c.user_a_id
      );

      // Fetch profiles for those users
      let membersList: CircleMember[] = [];
      if (otherUserIds.length > 0) {
        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', otherUserIds);

        if (profError) throw profError;

        membersList = (profiles || []).map((p: DbProfile) => ({
          userId: p.user_id,
          username: p.username,
          displayName: p.display_name,
        }));
      }
      setMembers(membersList);

      // Fetch pending invites I've received
      const { data: received, error: recError } = await supabase
        .from('circle_invites')
        .select(`
          *,
          from_profile:profiles!circle_invites_from_user_id_fkey(*)
        `)
        .eq('to_user_id', userId)
        .eq('status', 'pending');

      if (recError) throw recError;

      setPendingInvites(
        (received || []).map((inv) => {
          const invite = inv as DbCircleInvite & { from_profile: DbProfile };
          return {
            ...dbCircleInviteToCircleInvite(invite),
            fromProfile: invite.from_profile ? dbProfileToProfile(invite.from_profile) : undefined,
          };
        })
      );

      // Fetch invites I've sent that are still pending
      const { data: sent, error: sentError } = await supabase
        .from('circle_invites')
        .select(`
          *,
          to_profile:profiles!circle_invites_to_user_id_fkey(*)
        `)
        .eq('from_user_id', userId)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setSentInvites(
        (sent || []).map((inv) => {
          const invite = inv as DbCircleInvite & { to_profile: DbProfile };
          return {
            ...dbCircleInviteToCircleInvite(invite),
            toProfile: invite.to_profile ? dbProfileToProfile(invite.to_profile) : undefined,
          };
        })
      );

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch circle');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCircle();
  }, [fetchCircle]);

  const sendInvite = useCallback(
    async (toUserId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        // Check if already connected
        const isAlreadyMember = members.some((m) => m.userId === toUserId);
        if (isAlreadyMember) {
          setError('Already in your circle');
          return false;
        }

        // Check if invite already exists
        const { data: existing } = await supabase
          .from('circle_invites')
          .select('id, status')
          .or(
            `and(from_user_id.eq.${userId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${userId})`
          )
          .single();

        if (existing) {
          if (existing.status === 'pending') {
            setError('Invite already pending');
            return false;
          }
        }

        const { error: inviteError } = await supabase.from('circle_invites').insert({
          from_user_id: userId,
          to_user_id: toUserId,
          status: 'pending',
        });

        if (inviteError) throw inviteError;

        await fetchCircle();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send invite');
        return false;
      }
    },
    [userId, members, fetchCircle]
  );

  const acceptInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        // Get the invite to find the other user
        const { data: invite, error: fetchErr } = await supabase
          .from('circle_invites')
          .select('from_user_id, to_user_id')
          .eq('id', inviteId)
          .single();

        if (fetchErr) throw fetchErr;

        // Update invite status
        const { error: updateError } = await supabase
          .from('circle_invites')
          .update({ status: 'accepted' })
          .eq('id', inviteId);

        if (updateError) throw updateError;

        // Create connection (ensure user_a_id < user_b_id)
        const [userA, userB] =
          invite.from_user_id < invite.to_user_id
            ? [invite.from_user_id, invite.to_user_id]
            : [invite.to_user_id, invite.from_user_id];

        const { error: connError } = await supabase.from('connections').insert({
          user_a_id: userA,
          user_b_id: userB,
        });

        if (connError) throw connError;

        await fetchCircle();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to accept invite');
        return false;
      }
    },
    [userId, fetchCircle]
  );

  const declineInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('circle_invites')
          .update({ status: 'declined' })
          .eq('id', inviteId);

        if (updateError) throw updateError;

        await fetchCircle();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to decline invite');
        return false;
      }
    },
    [fetchCircle]
  );

  const removeConnection = useCallback(
    async (memberId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        // Find and delete the connection
        const { error: deleteError } = await supabase
          .from('connections')
          .delete()
          .or(
            `and(user_a_id.eq.${userId},user_b_id.eq.${memberId}),and(user_a_id.eq.${memberId},user_b_id.eq.${userId})`
          );

        if (deleteError) throw deleteError;

        await fetchCircle();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove from circle');
        return false;
      }
    },
    [userId, fetchCircle]
  );

  return {
    members,
    pendingInvites,
    sentInvites,
    loading,
    error,
    sendInvite,
    acceptInvite,
    declineInvite,
    removeConnection,
    refreshCircle: fetchCircle,
  };
}
