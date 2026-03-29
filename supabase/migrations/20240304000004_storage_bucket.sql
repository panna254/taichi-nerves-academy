-- Storage bucket and RLS policies for content files

-- Insert the storage bucket using ON CONFLICT DO NOTHING
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-files',
  'content-files',
  false,
  104857600,
  ARRAY[
    'image/jpeg','image/png','image/gif',
    'video/mp4','video/webm','video/quicktime',
    'application/pdf','text/plain','text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create these three storage RLS policies on storage.objects
-- for the bucket named 'content-files'

-- Policy name: "Authenticated users can upload content files"
CREATE POLICY "Authenticated users can upload content files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content-files');

-- Policy name: "Content authors can view their files"
CREATE POLICY "Content authors can view their files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'content-files' AND
  auth.uid() IN (
    SELECT c.author_id
    FROM content_files cf
    JOIN content c ON c.id = cf.content_id
    WHERE cf.storage_path = name
  )
);

-- Policy name: "Authors and admins can delete content files"
CREATE POLICY "Authors and admins can delete content files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'content-files' AND (
    auth.uid() IN (
      SELECT c.author_id
      FROM content_files cf
      JOIN content c ON c.id = cf.content_id
      WHERE cf.storage_path = name
    ) OR
    auth.uid() IN (
      SELECT user_id FROM admin_user_roles WHERE role = 'admin'
    )
  )
);
