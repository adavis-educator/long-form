-- Reading Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Create books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('currently_reading', 'have_read', 'want_to_read')),
  consumption_type TEXT CHECK (consumption_type IN ('listen', 'read')),
  listen_platform TEXT CHECK (listen_platform IN ('audible', 'libby', 'spotify')),
  read_format TEXT CHECK (read_format IN ('paper', 'digital')),
  recommended_by TEXT,
  priority INTEGER CHECK (priority IS NULL OR priority BETWEEN 1 AND 3),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT false
);

-- Create indexes for common queries
CREATE INDEX idx_books_user_status ON books(user_id, status);
CREATE INDEX idx_books_user_priority ON books(user_id, priority);
CREATE INDEX idx_books_user_position ON books(user_id, position);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own books
CREATE POLICY "Users can view their own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before each update
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
