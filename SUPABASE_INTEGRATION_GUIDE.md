# Supabase Integration Guide
## Complete Database & Backend Setup for Junior Engineers

This guide provides a step-by-step approach to integrate Supabase as the complete backend solution for the Taichi Nerves Academy application.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Schema Design](#database-schema-design)
5. [Authentication Setup](#authentication-setup)
6. [API Integration](#api-integration)
7. [Real-time Features](#real-time-features)
8. [File Storage](#file-storage)
9. [Testing & Validation](#testing--validation)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Tools
- **Node.js** (v18+)
- **npm** or **yarn**
- **Git**
- **VS Code** (recommended)

### Required Knowledge
- Basic SQL understanding
- React hooks knowledge
- TypeScript fundamentals
- REST API concepts

### Current Project Setup
The project already has:
- ✅ `@supabase/supabase-js` installed
- ✅ Basic configuration files
- ✅ Authentication hooks
- ✅ User API service

---

## 🚀 Supabase Project Setup

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or Google
4. Verify your email address

### Step 2: Create New Project
1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Project Name**: `taichi-nerves-academy`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project setup (2-3 minutes)

### Step 3: Get Project Credentials
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

## ⚙️ Environment Configuration

### Step 4: Set Up Environment Variables

Create `.env` file in project root:

```bash
# Create the file
touch .env
```

Add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important**: Never commit `.env` to Git. It's already in `.gitignore`.

### Step 5: Verify Configuration

The project has built-in configuration validation. Check if it works:

```typescript
// In your browser console, you should see:
// ✅ Supabase configured successfully
```

If you see warnings, double-check your `.env` file.

---

## 🗄️ Database Schema Design

### Step 6: Create Database Tables

Go to Supabase Dashboard → SQL Editor and run these queries:

#### Users Profile Table
```sql
-- Extended user profiles
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

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Lectures Table
```sql
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view lectures" ON lectures
  FOR SELECT USING (true);

-- Only authenticated users can create lectures
CREATE POLICY "Authenticated users can create lectures" ON lectures
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only lecture creators can update
CREATE POLICY "Lecture creators can update lectures" ON lectures
  FOR UPDATE USING (auth.uid() = created_by);

-- Only lecture creators can delete
CREATE POLICY "Lecture creators can delete lectures" ON lectures
  FOR DELETE USING (auth.uid() = created_by);
```

#### Resources Table
```sql
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('slides', 'notes', 'quiz', 'reference', 'practice')),
  url TEXT NOT NULL,
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view resources" ON resources
  FOR SELECT USING (true);
```

#### Enrollment Table
```sql
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lecture_id)
);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own enrollments
CREATE POLICY "Users can create own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 7: Create Database Functions

```sql
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
```

---

## 🔐 Authentication Setup

### Step 8: Configure Authentication Settings

Go to Supabase Dashboard → Authentication → Settings:

#### Email Configuration
1. Enable **Confirm email** (recommended for production)
2. Set email templates:
   - **Confirmation**: Customize with your branding
   - **Recovery**: Customize password reset emails
   - **Magic Link**: Optional for passwordless login

#### Social Providers (Optional)
1. Go to Authentication → Providers
2. Enable desired providers:
   - Google: Set up OAuth app
   - GitHub: Set up OAuth app
   - Others as needed

#### Site URL
Set your site URL:
- **Development**: `http://localhost:5173`
- **Production**: `https://your-domain.com`

### Step 9: Test Authentication

The project already has authentication setup. Test it:

```typescript
// Test signup
import { userApi } from '@/services/userApi';

try {
  const result = await userApi.signup({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  console.log('✅ Signup successful:', result);
} catch (error) {
  console.error('❌ Signup failed:', error.message);
}
```

---

## 🔌 API Integration

### Step 10: Create Database Services

Create `src/services/database.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import type { Lecture, Resource } from '@/types/lecture';

export const databaseService = {
  // Lectures
  async getLectures() {
    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as Lecture[];
  },

  async getLectureBySlug(slug: string) {
    const { data, error } = await supabase
      .from('lectures')
      .select(`
        *,
        resources (*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data as Lecture & { resources: Resource[] };
  },

  async createLecture(lecture: Partial<Lecture>) {
    const { data, error } = await supabase
      .from('lectures')
      .insert(lecture)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Enrollments
  async enrollInLecture(userId: string, lectureId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, lecture_id: lectureId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserEnrollments(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        lectures (*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
};
```

### Step 11: Create Custom Hooks

Create `src/hooks/useDatabase.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/database';
import { useAuth } from './useAuth';

export const useLectures = () => {
  return useQuery({
    queryKey: ['lectures'],
    queryFn: () => databaseService.getLectures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLecture = (slug: string) => {
  return useQuery({
    queryKey: ['lecture', slug],
    queryFn: () => databaseService.getLectureBySlug(slug),
    enabled: !!slug,
  });
};

export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => databaseService.getProfile(user!.id),
    enabled: !!user?.id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (updates: any) => 
      databaseService.updateProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useEnrollInLecture = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (lectureId: string) => 
      databaseService.enrollInLecture(user!.id, lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};
```

---

## 🔄 Real-time Features

### Step 12: Set Up Real-time Subscriptions

Create `src/services/realtime.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to lecture updates
  subscribeToLectures(callback: (payload: any) => void) {
    const channelName = 'lectures';
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lectures'
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to profile updates
  subscribeToProfile(userId: string, callback: (payload: any) => void) {
    const channelName = `profile-${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Unsubscribe from channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();
```

### Step 13: Use Real-time in Components

```typescript
// Example: Real-time lecture updates
import { useEffect } from 'react';
import { realtimeService } from '@/services/realtime';

const LectureList = () => {
  const { data: lectures, refetch } = useLectures();

  useEffect(() => {
    const channel = realtimeService.subscribeToLectures(() => {
      refetch(); // Refresh data when changes occur
    });

    return () => {
      realtimeService.unsubscribe('lectures');
    };
  }, [refetch]);

  return (
    // Render lectures...
  );
};
```

---

## 📁 File Storage

### Step 14: Set Up Storage Buckets

Go to Supabase Dashboard → Storage:

1. Create **avatars** bucket:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('avatars', 'avatars', true);
   ```

2. Create **lecture-resources** bucket:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('lecture-resources', 'lecture-resources', true);
   ```

3. Set up storage policies:

```sql
-- Avatar bucket policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own avatar" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

-- Lecture resources policies
CREATE POLICY "Anyone can view lecture resources" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lecture-resources'
  );

CREATE POLICY "Authenticated users can upload lecture resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lecture-resources' AND 
    auth.role() = 'authenticated'
  );
```

### Step 15: File Upload Service

Create `src/services/storage.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export const storageService = {
  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  // Upload lecture resource
  async uploadLectureResource(lectureId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${lectureId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('lecture-resources')
      .upload(fileName, file, {
        contentType: file.type
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lecture-resources')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  // Delete file
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }
};
```

---

## 🧪 Testing & Validation

### Step 16: Test Database Operations

Create test file `src/utils/testSupabase.ts`:

```typescript
import { databaseService } from '@/services/database';
import { storageService } from '@/services/storage';
import { userApi } from '@/services/userApi';

export const testSupabaseIntegration = async () => {
  console.log('🧪 Testing Supabase Integration...');
  
  try {
    // Test 1: Authentication
    console.log('1️⃣ Testing authentication...');
    const testUser = await userApi.signup({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Authentication works:', testUser.user.email);

    // Test 2: Database operations
    console.log('2️⃣ Testing database operations...');
    const lectures = await databaseService.getLectures();
    console.log('✅ Database query works:', `${lectures.length} lectures found`);

    // Test 3: File upload
    console.log('3️⃣ Testing file upload...');
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const avatarUrl = await storageService.uploadAvatar(testUser.user.id, testFile);
    console.log('✅ File upload works:', avatarUrl);

    console.log('🎉 All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};
```

### Step 17: Run Tests

In your browser console:

```javascript
import { testSupabaseIntegration } from '@/utils/testSupabase';
testSupabaseIntegration();
```

---

## 🚀 Deployment

### Step 18: Production Configuration

1. **Update environment variables**:
```env
# Production
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

2. **Update site URL in Supabase**:
   - Go to Authentication → Settings
   - Set **Site URL** to your production domain
   - Update **Redirect URLs** accordingly

3. **Enable additional security**:
   - Enable **Email confirmation**
   - Set up **Custom SMTP** for emails
   - Configure **Rate limiting**

### Step 19: Build and Deploy

```bash
# Build for production
npm run build

# Deploy to your hosting provider
# (Vercel, Netlify, Railway, etc.)
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Supabase not configured" error
**Solution**: Check your `.env` file and restart dev server
```bash
# Restart dev server after changing .env
npm run dev
```

#### Issue 2: RLS policy violations
**Solution**: Check your Row Level Security policies
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### Issue 3: CORS errors
**Solution**: Add your domain to Supabase CORS settings
- Go to Settings → API
- Add your domain to CORS origins

#### Issue 4: Authentication not working
**Solution**: Check email confirmation settings
- Verify email templates are configured
- Check if emails are being sent
- Look in Auth → Users for verification status

#### Issue 5: Real-time not working
**Solution**: Check Realtime permissions
```sql
-- Check Realtime is enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Debug Tools

1. **Browser Console**: Check for Supabase errors
2. **Network Tab**: Monitor API requests
3. **Supabase Dashboard**: Check logs and metrics
4. **Database Logs**: SQL query debugging

---

## 📚 Additional Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

### Best Practices
1. **Always use RLS** for security
2. **Validate inputs** before database operations
3. **Handle errors** gracefully
4. **Use TypeScript** for type safety
5. **Monitor performance** with Supabase logs

### Security Checklist
- ✅ RLS policies enabled on all tables
- ✅ Environment variables secured
- ✅ Email confirmation enabled
- ✅ CORS properly configured
- ✅ API keys have minimal permissions
- ✅ Regular security audits

---

## 🎯 Next Steps

After completing this guide:

1. **Implement remaining features**:
   - User profiles management
   - Lecture progress tracking
   - Certificate generation
   - Payment integration

2. **Add advanced features**:
   - Real-time notifications
   - Offline support
   - Analytics tracking
   - Performance monitoring

3. **Scale your application**:
   - Database optimization
   - CDN setup
   - Load balancing
   - Backup strategies

---

## 🤝 Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [troubleshooting section](#troubleshooting)
3. Check your browser console for errors
4. Verify your database schema
5. Test with the provided test utilities

---

**🎉 Congratulations!** You now have a fully functional Supabase backend integrated with your Taichi Nerves Academy application. Your users can authenticate, access content, and interact with your application in real-time.
