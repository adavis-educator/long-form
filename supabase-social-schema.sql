-- Reading Circles - Social Features Schema
-- Run this in your Supabase SQL Editor AFTER the initial schema

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Username must be lowercase, alphanumeric, 3-20 chars
ALTER TABLE profiles ADD CONSTRAINT username_format
  CHECK (username ~ '^[a-z0-9_]{3,20}$');

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- =============================================
-- CIRCLE INVITES
-- =============================================
CREATE TABLE circle_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_circle_invites_to_user ON circle_invites(to_user_id, status);
CREATE INDEX idx_circle_invites_from_user ON circle_invites(from_user_id, status);

-- =============================================
-- CONNECTIONS (created when invite accepted)
-- =============================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ensure user_a_id < user_b_id to prevent duplicates
  CONSTRAINT connection_order CHECK (user_a_id < user_b_id),
  UNIQUE(user_a_id, user_b_id)
);

CREATE INDEX idx_connections_user_a ON connections(user_a_id);
CREATE INDEX idx_connections_user_b ON connections(user_b_id);

-- =============================================
-- PUBLIC SHELF (up to 5 books to show others)
-- =============================================
CREATE TABLE public_shelf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, position),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_public_shelf_user ON public_shelf(user_id);

-- =============================================
-- RECOMMENDATIONS
-- =============================================
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_title TEXT NOT NULL,
  book_author TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'added', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_to_user ON recommendations(to_user_id, status);
CREATE INDEX idx_recommendations_from_user ON recommendations(from_user_id);

-- =============================================
-- RECOMMENDATION REQUESTS
-- =============================================
CREATE TABLE recommendation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means "ask full circle"
  note TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rec_requests_to_user ON recommendation_requests(to_user_id, status);
CREATE INDEX idx_rec_requests_from_user ON recommendation_requests(from_user_id, status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Profiles: Public read, own write
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Circle Invites: Participants can view, sender can create
ALTER TABLE circle_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites they sent or received"
  ON circle_invites FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create invites"
  ON circle_invites FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipients can update invite status"
  ON circle_invites FOR UPDATE
  USING (auth.uid() = to_user_id);

-- Connections: Participants can view
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "System can create connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Public Shelf: Public read, own write
ALTER TABLE public_shelf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public shelves"
  ON public_shelf FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their public shelf"
  ON public_shelf FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their public shelf"
  ON public_shelf FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from their public shelf"
  ON public_shelf FOR DELETE
  USING (auth.uid() = user_id);

-- Recommendations: Participants can view, sender can create
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations they sent or received"
  ON recommendations FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipients can update recommendation status"
  ON recommendations FOR UPDATE
  USING (auth.uid() = to_user_id);

-- Recommendation Requests: Relevant parties can view
ALTER TABLE recommendation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view requests they made or received"
  ON recommendation_requests FOR SELECT
  USING (
    auth.uid() = from_user_id
    OR auth.uid() = to_user_id
    OR (to_user_id IS NULL AND EXISTS (
      SELECT 1 FROM connections
      WHERE (user_a_id = auth.uid() AND user_b_id = from_user_id)
         OR (user_b_id = auth.uid() AND user_a_id = from_user_id)
    ))
  );

CREATE POLICY "Users can create requests"
  ON recommendation_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own requests"
  ON recommendation_requests FOR UPDATE
  USING (auth.uid() = from_user_id);

-- =============================================
-- UPDATE TRIGGERS
-- =============================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circle_invites_updated_at
  BEFORE UPDATE ON circle_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rec_requests_updated_at
  BEFORE UPDATE ON recommendation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTION: Get user's circle members
-- =============================================
CREATE OR REPLACE FUNCTION get_circle_members(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.username,
    p.display_name
  FROM connections c
  JOIN profiles p ON (
    (c.user_a_id = p_user_id AND p.user_id = c.user_b_id) OR
    (c.user_b_id = p_user_id AND p.user_id = c.user_a_id)
  )
  WHERE c.user_a_id = p_user_id OR c.user_b_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
