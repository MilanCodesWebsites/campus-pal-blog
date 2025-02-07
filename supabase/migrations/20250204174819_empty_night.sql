/*
  # Storage bucket policies for blog images

  1. Security
    - Enable RLS on storage.objects
    - Add policies for authenticated users to upload images
    - Allow public read access to uploaded images
    - Restrict modifications to image owners
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to blog images
CREATE POLICY "Public can view blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND owner = auth.uid()
  );

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'blog-images' AND owner = auth.uid());

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images' AND owner = auth.uid());