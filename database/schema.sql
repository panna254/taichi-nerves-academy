-- Taichi Nerves Academy - Supabase Database Schema
-- Run this SQL in Supabase Dashboard → SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users Profile Table
-- Extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  membership_status TEXT DEFAULT 'inactive' CHECK (membership_status IN ('active', 'inactive', 'expired')),
  membership_expires_at TIMESTAMPTZ,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lectures Table
-- Stores lecture content and metadata
CREATE TABLE IF NOT EXISTS lectures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT,
  duration TEXT,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  date TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[],
  resources JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources Table
-- Stores downloadable resources for lectures
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('slides', 'notes', 'quiz', 'reference', 'practice')),
  url TEXT NOT NULL,
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments Table
-- Tracks user enrollment in lectures
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lecture_id)
);

-- Progress Table
-- Tracks detailed progress through lectures
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lecture_id)
);

-- Certificates Table
-- Stores generated certificates for completed courses
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lecture_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Lectures RLS Policies
CREATE POLICY "Public can view lectures" ON lectures
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create lectures" ON lectures
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Lecture creators can update lectures" ON lectures
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Lecture creators can delete lectures" ON lectures
  FOR DELETE USING (auth.uid() = created_by);

-- Resources RLS Policies
CREATE POLICY "Public can view resources" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Resource creators can update resources" ON resources
  FOR UPDATE USING (auth.uid() IN (
    SELECT created_by FROM lectures WHERE id = lecture_id
  ));

CREATE POLICY "Resource creators can delete resources" ON resources
  FOR DELETE USING (auth.uid() IN (
    SELECT created_by FROM lectures WHERE id = lecture_id
  ));

-- Enrollments RLS Policies
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Progress RLS Policies
CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Certificates RLS Policies
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create certificates" ON certificates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get user profile with auth data
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  membership_status TEXT,
  membership_expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.full_name,
    p.avatar_url,
    p.membership_status,
    p.membership_expires_at
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lectures_updated_at
  BEFORE UPDATE ON lectures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_lectures_slug ON lectures(slug);
CREATE INDEX IF NOT EXISTS idx_lectures_level ON lectures(level);
CREATE INDEX IF NOT EXISTS idx_lectures_date ON lectures(date DESC);
CREATE INDEX IF NOT EXISTS idx_lectures_created_by ON lectures(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_lecture_id ON resources(lecture_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_lecture_id ON enrollments(lecture_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lecture_id ON progress(lecture_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

-- GIN indexes for array and JSONB columns
CREATE INDEX IF NOT EXISTS idx_lectures_tags ON lectures USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_lectures_resources ON lectures USING GIN(resources);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets (run in Supabase Dashboard → Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('lecture-resources', 'lecture-resources', true),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view lecture resources" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lecture-resources'
  );

CREATE POLICY "Authenticated users can upload lecture resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lecture-resources' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample lectures (optional)
INSERT INTO lectures (slug, title, description, youtube_id, duration, level, tags, created_by)
VALUES 
  (
    'introduction-to-cell-biology',
    'Introduction to Cell Biology',
    'A comprehensive introduction to the fundamental concepts of cell biology, including cell structure, organelles, and basic cellular processes.',
    'dQw4w9WgXcQ',
    '45 min',
    'Beginner',
    ARRAY['Cell Biology', 'Introduction', 'Basics'],
    NULL
  ),
  (
    'membrane-transport-mechanisms',
    'Membrane Transport Mechanisms',
    'Detailed exploration of how molecules cross cell membranes, including passive diffusion, active transport, and facilitated transport.',
    'UpAewnVYivA',
    '50 min',
    'Intermediate',
    ARRAY['Membrane Transport', 'Diffusion', 'Active Transport'],
    NULL
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VIEWS
-- ============================================

-- View for lecture statistics
CREATE OR REPLACE VIEW lecture_stats AS
SELECT 
  l.id,
  l.title,
  l.slug,
  COUNT(e.id) as enrollment_count,
  COUNT(p.id) FILTER (WHERE p.completed = TRUE) as completion_count,
  AVG(p.watch_time_seconds) as avg_watch_time
FROM lectures l
LEFT JOIN enrollments e ON l.id = e.lecture_id
LEFT JOIN progress p ON l.id = p.lecture_id
GROUP BY l.id, l.title, l.slug;

-- View for user progress summary
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(e.id) as enrolled_lectures,
  COUNT(p.id) FILTER (WHERE p.completed = TRUE) as completed_lectures,
  SUM(p.watch_time_seconds) as total_watch_time
FROM auth.users u
LEFT JOIN enrollments e ON u.id = e.user_id
LEFT JOIN progress p ON u.id = p.user_id
GROUP BY u.id, u.email;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- This will be shown when the script completes successfully
DO $$
BEGIN
  RAISE NOTICE '✅ Taichi Nerves Academy database schema created successfully!';
  RAISE NOTICE '📊 Tables created: profiles, lectures, resources, enrollments, progress, certificates';
  RAISE NOTICE '🔒 RLS policies enabled for security';
  RAISE NOTICE '📈 Performance indexes created';
  RAISE NOTICE '🗂️ Storage buckets configured';
  RAISE NOTICE '📋 Views created for analytics';
  RAISE NOTICE '🎉 Your Supabase database is ready for use!';
END $$;
