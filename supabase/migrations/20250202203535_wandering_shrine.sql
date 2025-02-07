/*
  # Initial Blog Schema Setup

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `published` (boolean)
      - `author_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `cover_image` (text)
      - `slug` (text, unique)
    
  2. Security
    - Enable RLS on `posts` table
    - Add policies for:
      - Public read access to published posts
      - Authenticated users can create posts
      - Authors can update/delete their own posts
*/

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  published boolean DEFAULT false,
  author_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  cover_image text,
  slug text UNIQUE NOT NULL,
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Public can view published posts"
  ON posts
  FOR SELECT
  USING (published = true);

-- Allow authenticated users to create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Allow authors to update their own posts
CREATE POLICY "Authors can update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow authors to delete their own posts
CREATE POLICY "Authors can delete their own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);