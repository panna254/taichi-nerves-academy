-- Content Management Tables for Admin Dashboard

-- TABLE: content
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('article','video','pdf','quiz')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  content JSONB,
  summary TEXT,
  "references" TEXT[],
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: content_files
CREATE TABLE IF NOT EXISTS content_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: content_audit_log
CREATE TABLE IF NOT EXISTS content_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: admin_user_roles
CREATE TABLE IF NOT EXISTS admin_user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','reviewer')),
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- TABLE: content_categories
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: content_categories_junction
CREATE TABLE IF NOT EXISTS content_categories_junction (
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  category_id UUID REFERENCES content_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, category_id)
);

-- Enable RLS on all tables
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories_junction ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Content policies
CREATE POLICY "Users can view published content" ON content FOR SELECT
  USING (
    status = 'published' OR
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT user_id FROM admin_user_roles WHERE role IN ('admin','reviewer')
    )
  );

CREATE POLICY "Authors can create content" ON content FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and reviewers can update content" ON content FOR UPDATE
  USING (
    auth.uid() = author_id OR
    (auth.uid() IN (SELECT user_id FROM admin_user_roles WHERE role = 'reviewer')
     AND status = 'review')
  );

CREATE POLICY "Admins can delete content" ON content FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_user_roles WHERE role = 'admin')
  );

-- Content files policies
CREATE POLICY "Content authors can manage files" ON content_files FOR ALL
  USING (
    auth.uid() IN (
      SELECT author_id FROM content WHERE id = content_files.content_id
    )
  );

-- Admin roles policies
CREATE POLICY "Users can view own admin role" ON admin_user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages admin roles" ON admin_user_roles FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_updated ON content(updated_at DESC);
CREATE INDEX idx_content_files_content_id ON content_files(content_id);
CREATE INDEX idx_audit_log_content_id ON content_audit_log(content_id);
CREATE INDEX idx_admin_roles_user_id ON admin_user_roles(user_id);
