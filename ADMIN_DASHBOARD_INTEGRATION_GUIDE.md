# Admin Dashboard Supabase Integration Guide
## Step-by-Step Implementation with Existing Supabase Setup

### **Overview**
Your application already has Supabase implemented for user authentication and payment systems. This guide leverages that existing infrastructure to transform the mock admin dashboard into a fully functional, secure content management system.

---

## 🏗️ **Phase 1: Database Schema Setup**

### **Step 1.1: Create Content Management Tables**

Create a new migration file: `supabase/migrations/20240304000003_admin_content.sql`

```sql
-- Content Management Tables
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'pdf', 'quiz')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  content JSONB,
  summary TEXT,
  references TEXT[],
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Files
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

-- Content Audit Log
CREATE TABLE IF NOT EXISTS content_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin User Roles (extends existing auth.users)
CREATE TABLE IF NOT EXISTS admin_user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'reviewer')),
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Content Categories
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content-Category Relationships
CREATE TABLE IF NOT EXISTS content_categories_junction (
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  category_id UUID REFERENCES content_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, category_id)
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories_junction ENABLE ROW LEVEL SECURITY;
```

### **Step 1.2: RLS Policies**

```sql
-- Content RLS Policies
CREATE POLICY "Users can view published content" ON content
FOR SELECT USING (
  status = 'published' OR 
  auth.uid() = author_id OR 
  auth.uid() IN (
    SELECT user_id FROM admin_user_roles 
    WHERE role IN ('admin', 'reviewer')
  )
);

CREATE POLICY "Authors can create content" ON content
FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and reviewers can update content" ON content
FOR UPDATE USING (
  auth.uid() = author_id OR 
  (auth.uid() IN (SELECT user_id FROM admin_user_roles WHERE role = 'reviewer') AND status = 'review')
);

CREATE POLICY "Admins can delete content" ON content
FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM admin_user_roles WHERE role = 'admin')
);

-- Content Files RLS
CREATE POLICY "Content authors can manage files" ON content_files
FOR ALL USING (
  auth.uid() IN (
    SELECT author_id FROM content WHERE id = content_files.content_id
  )
);

-- Admin Roles RLS
CREATE POLICY "Users can view own admin role" ON admin_user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages admin roles" ON admin_user_roles
FOR ALL USING (auth.role() = 'service_role');
```

---

## 🔐 **Phase 2: Admin Authentication Integration**

### **Step 2.1: Update Admin Auth Hook**

Replace `src/hooks/useAdminAuth.tsx` with Supabase integration:

```typescript
import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

type AdminRole = "admin" | "editor" | "reviewer";

interface AdminUser extends User {
  adminRole?: AdminRole;
  permissions?: string[];
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session and admin role
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user has admin role
        const { data: adminRole } = await supabase
          .from('admin_user_roles')
          .select('role, permissions')
          .eq('user_id', session.user.id)
          .single();

        if (adminRole) {
          setUser({
            ...session.user,
            adminRole: adminRole.role,
            permissions: adminRole.permissions || [],
          });
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: adminRole } = await supabase
            .from('admin_user_roles')
            .select('role, permissions')
            .eq('user_id', session.user.id)
            .single();

          if (adminRole) {
            setUser({
              ...session.user,
              adminRole: adminRole.role,
              permissions: adminRole.permissions || [],
            });
          } else {
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check admin role
      if (data.user) {
        const { data: adminRole } = await supabase
          .from('admin_user_roles')
          .select('role, permissions')
          .eq('user_id', data.user.id)
          .single();

        if (!adminRole) {
          return { success: false, error: 'Access denied: Admin privileges required' };
        }

        setUser({
          ...data.user,
          adminRole: adminRole.role,
          permissions: adminRole.permissions || [],
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || user?.adminRole === 'admin';
  };

  const value = useMemo(() => ({
    user, token: user ? supabase.auth.session()?.access_token : null, loading, login, logout, hasPermission
  }), [user, loading]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
};
```

### **Step 2.2: Update Admin Login Page**

Update `src/pages/admin/AdminLogin.tsx`:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    
    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.error || "Login failed");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Sign in to manage content</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
```

---

## 📝 **Phase 3: Content Management Service**

### **Step 3.1: Create Admin Content Service**

Create `src/services/adminContentService.ts`:

```typescript
import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content_type: 'article' | 'video' | 'pdf' | 'quiz';
  status: 'draft' | 'review' | 'published' | 'archived';
  content: any;
  summary?: string;
  references: string[];
  author_id: string;
  reviewer_id?: string;
  version: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentFile {
  id: string;
  content_id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  mime_type: string;
  public_url: string;
  created_at: string;
}

export interface CreateContentPayload {
  title: string;
  content_type: 'article' | 'video' | 'pdf' | 'quiz';
  content: any;
  summary?: string;
  references?: string[];
}

export const adminContentService = {
  // Get all content with filters
  async getContents(filters?: {
    search?: string;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('content')
      .select(`
        id, title, slug, content_type, status, 
        summary, references, version, published_at,
        created_at, updated_at,
        author:profiles(name, email),
        reviewer:profiles(name)
      `)
      .order('updated_at', { ascending: false });

    if (filters?.search) {
      query = query.textSearch('title', filters.search);
    }
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('content_type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get content by ID
  async getContentById(id: string) {
    const { data, error } = await supabase
      .from('content')
      .select(`
        id, title, slug, content_type, status,
        content, summary, references, version, published_at,
        created_at, updated_at,
        author:profiles(name, email),
        reviewer:profiles(name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new content
  async createContent(payload: CreateContentPayload) {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate slug from title
    const slug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const { data, error } = await supabase
      .from('content')
      .insert({
        ...payload,
        slug,
        author_id: user.id,
        status: 'draft',
        version: 1,
      })
      .select()
      .single();

    if (error) throw error;

    // Log creation
    await this.logContentChange(data.id, 'created', user.id);

    return data;
  },

  // Update content
  async updateContent(id: string, payload: Partial<CreateContentPayload>) {
    // Get current content for audit
    const current = await this.getContentById(id);

    const { data, error } = await supabase
      .from('content')
      .update({
        ...payload,
        version: current.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log update
    await this.logContentChange(id, 'updated', current.author_id, current, payload);

    return data;
  },

  // Delete content
  async deleteContent(id: string) {
    const current = await this.getContentById(id);

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log deletion
    await this.logContentChange(id, 'deleted', current.author_id, current);

    return { success: true };
  },

  // Submit for review
  async submitForReview(id: string) {
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log review submission
    await this.logContentChange(id, 'submitted_for_review', data.author_id);

    return data;
  },

  // Approve content
  async approveContent(id: string, reviewerId: string) {
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'published',
        reviewer_id,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log approval
    await this.logContentChange(id, 'approved', reviewerId);

    return data;
  },

  // Request changes
  async requestChanges(id: string, notes: string) {
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log change request
    await this.logContentChange(id, 'changes_requested', data.author_id, { notes });

    return data;
  },

  // Log content changes
  async logContentChange(
    contentId: string, 
    action: string, 
    userId: string, 
    oldData?: any, 
    newData?: any
  ) {
    await supabase
      .from('content_audit_log')
      .insert({
        content_id: contentId,
        user_id: userId,
        action,
        old_values: oldData,
        new_values: newData,
      });
  },

  // Get content files
  async getContentFiles(contentId: string) {
    const { data, error } = await supabase
      .from('content_files')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
```

---

## 📁 **Phase 4: File Management Integration**

### **Step 4.1: Create File Service**

Create `src/services/adminFileService.ts`:

```typescript
import { supabase } from "@/lib/supabase";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  storagePath: string;
  uploadedAt: string;
}

export const adminFileService = {
  // Upload file to Supabase Storage
  async uploadFile(
    file: File, 
    contentId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const fileName = `${timestamp}-${random}.${fileExt}`;
    const filePath = `content/${contentId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('content-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const percentage = Math.round((progress.loadedBytes / progress.totalBytes) * 100);
          onProgress?.(percentage);
        },
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-files')
      .getPublicUrl(filePath);

    // Save file record to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('content_files')
      .insert({
        content_id: contentId,
        filename: fileName,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        mime_type: file.type,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      id: fileRecord.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: publicUrl,
      storagePath: filePath,
      uploadedAt: fileRecord.created_at,
    };
  },

  // Delete file
  async deleteFile(fileId: string) {
    // Get file info first
    const { data: file } = await supabase
      .from('content_files')
      .select('storage_path')
      .eq('id', fileId)
      .single();

    if (!file) throw new Error('File not found');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('content-files')
      .remove([file.storage_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('content_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;

    return { success: true };
  },

  // Get signed URL for private files
  async getSignedUrl(filePath: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from('content-files')
      .createSignedUrl(filePath, { expiresIn });

    if (error) throw error;
    return data.signedUrl;
  },

  // Validate file
  validateFile(file: File) {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'text/plain', 'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const maxSize = 100 * 1024 * 1024; // 100MB

    const isValidType = allowedTypes.includes(file.type);
    const isValidSize = file.size <= maxSize;

    return {
      valid: isValidType && isValidSize,
      error: !isValidType ? 'Invalid file type' : !isValidSize ? 'File too large (max 100MB)' : null,
    };
  },
};
```

---

## 🔄 **Phase 5: Update Admin Components**

### **Step 5.1: Update Content Editor**

Update `src/pages/admin/ContentEditorPage.tsx` to use real services:

```typescript
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminContentService } from "@/services/adminContentService";
import { adminFileService } from "@/services/adminFileService";
import { useAdminAuth } from "@/hooks/useAdminAuth";
// ... other imports

const ContentEditorPage = () => {
  const { id } = useParams();
  const { user, hasPermission } = useAdminAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  // Form state
  const [form, setForm] = useState({
    title: "",
    content_type: "article" as const,
    content: "",
    summary: "",
    references: "",
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load content for editing
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      adminContentService.getContentById(id)
        .then((content) => {
          if (content) {
            setForm({
              title: content.title,
              content_type: content.content_type,
              content: content.content || "",
              summary: content.summary || "",
              references: content.references?.join("\n") || "",
            });
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleFileUpload = async (file: File) => {
    if (!id && !isEdit) {
      // For new content, we'll upload after content is created
      setFiles(prev => [...prev, file]);
      return;
    }

    try {
      setSaving(true);
      const uploadedFile = await adminFileService.uploadFile(
        file, 
        id!, 
        (progress) => setUploadProgress(progress)
      );
      
      setFiles(prev => [...prev, file]);
      setSaving(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setSaving(false);
    }
  };

  const handleSave = async (status: 'draft' | 'review' = 'draft') => {
    if (!hasPermission('content.edit')) {
      setError('You do not have permission to edit content');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        title: form.title,
        content_type: form.content_type,
        content: form.content,
        summary: form.summary || undefined,
        references: form.references ? form.references.split('\n').filter(r => r.trim()) : undefined,
      };

      let savedContent;
      if (isEdit && id) {
        savedContent = await adminContentService.updateContent(id, payload);
      } else {
        savedContent = await adminContentService.createContent(payload);
        navigate(`/admin/content/${savedContent.id}`);
      }

      // Upload files if any
      if (files.length > 0 && savedContent.id) {
        for (const file of files) {
          await adminFileService.uploadFile(file, savedContent.id);
        }
      }

      if (status === 'review') {
        await adminContentService.submitForReview(savedContent.id);
      }

      setSaving(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Form fields with real data binding */}
      {/* File upload with progress tracking */}
      {/* Save buttons with proper permissions */}
    </div>
  );
};
```

---

## 🚀 **Phase 6: Deployment & Testing**

### **Step 6.1: Run Database Migration**

```bash
# Push new tables to Supabase
supabase db push
```

### **Step 6.2: Test Integration**

```bash
# Start development server
npm run dev

# Test admin login with existing user
# Navigate to /admin
# Create new content
# Upload files
# Test workflow states
```

### **Step 6.3: Set Up Storage**

```bash
# Create storage bucket in Supabase Dashboard
# 1. Go to Supabase Project
# 2. Storage -> Create new bucket
# 3. Bucket name: "content-files"
# 4. Set up RLS policies for storage
```

---

## 📋 **Implementation Checklist**

### **Database Setup**
- [ ] Create content management tables
- [ ] Set up RLS policies
- [ ] Create indexes for performance
- [ ] Test database operations

### **Authentication**
- [ ] Replace mock auth with Supabase
- [ ] Implement role-based access control
- [ ] Add permission checking
- [ ] Test login/logout flows

### **Content Management**
- [ ] Create content service
- [ ] Implement CRUD operations
- [ ] Add workflow states
- [ ] Add audit logging

### **File Management**
- [ ] Integrate Supabase Storage
- [ ] Add file validation
- [ ] Implement upload progress
- [ ] Add file access control

### **UI Integration**
- [ ] Update all admin components
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test user permissions

---

## 🎯 **Expected Outcomes**

After completing this integration:

1. **Secure Authentication**: Real JWT-based auth with role management
2. **Data Persistence**: All content saved to Supabase database
3. **File Storage**: Files uploaded to Supabase Storage with CDN
4. **Audit Trail**: Complete change logging for compliance
5. **Role-Based Access**: Proper permissions for admin, editor, reviewer roles
6. **Real-Time Updates**: Content changes reflected immediately
7. **Scalability**: Built on Supabase infrastructure
8. **Security**: RLS policies and input validation

This integration leverages your existing Supabase setup to transform the mock admin dashboard into a production-ready content management system.
