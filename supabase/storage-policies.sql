-- Storage Policies for wine-labels bucket
-- Run this after creating the bucket in Supabase Dashboard

-- First, create the bucket (do this in Supabase Dashboard or run):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('wine-labels', 'wine-labels', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload wine labels"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wine-labels' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own images
CREATE POLICY "Users can view own wine labels"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'wine-labels' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access (since bucket is public)
CREATE POLICY "Public can view wine labels"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wine-labels');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own wine labels"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'wine-labels' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
