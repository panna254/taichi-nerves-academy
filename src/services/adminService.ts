import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { validators, sanitizers } from "@/utils/validation"
import { auditService } from "@/services/auditService"
import { withRateLimit, RATE_LIMITS } from "@/utils/rateLimit"

// Types
export interface ContentItem {
  id: string
  title: string
  slug: string
  content_type: 'article' | 'video' | 'pdf' | 'quiz'
  status: 'draft' | 'review' | 'published' | 'archived'
  content: any
  summary?: string
  references: string[]
  author_id: string
  reviewer_id?: string
  version: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ContentFile {
  id: string
  content_id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  storage_path: string
  mime_type: string
  public_url: string
  created_at: string
}

export interface CreateContentPayload {
  title: string
  content_type: 'article' | 'video' | 'pdf' | 'quiz'
  content: any
  summary?: string
  references?: string[]
  status?: 'draft' | 'review' | 'published' | 'archived'
  published_at?: string
}

export interface Topic {
  id: string
  name: string
  slug: string
  description?: string
  order_index: number
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  membership_status: 'active' | 'inactive' | 'expired'
  membership_expires_at?: string
  created_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  role: 'admin' | 'editor' | 'reviewer'
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalContent: number
  publishedContent: number
  draftContent: number
  reviewQueue: number
  totalUsers: number
  activeSubscriptions: number
  totalAdmins: number
}

export interface ContentAnalytics {
  views: number
  completions: number
  averageTime: number
  engagement: number
}

export interface UserEngagement {
  activeUsers: number
  retentionRate: number
  averageSessionTime: number
  newUsers: number
}

// Error handling wrapper
const handleServiceCall = async <T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error: any) {
    console.error(errorMessage, error)
    const userMessage = error?.message || errorMessage
    return { success: false, error: userMessage }
  }
}

// Content Operations
export const contentService = {
  async getVideoLectures(filters?: {
    search?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    return handleServiceCall(async () => {
      let query = supabase
        .from('content')
        .select(`
          id, title, slug, content_type, status, summary, references,
          version, published_at, created_at, updated_at,
          author:author_id(id, email, full_name),
          reviewer:reviewer_id(id, email, full_name)
        `)
        .eq('content_type', 'video')
        .order('updated_at', { ascending: false })

      if (filters?.search) {
        query = query.textSearch('title', filters.search)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset && filters?.limit) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }, 'Failed to fetch video lectures')
  },

  async createVideoLecture(data: CreateContentPayload) {
    return withRateLimit('CREATE_CONTENT', async () => {
      // Validate input
      const validation = validators.videoLecture(data)
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') }
      }

      // Sanitize input
      const sanitizedData = {
        ...data,
        title: sanitizers.text(data.title),
        summary: data.summary ? sanitizers.text(data.summary) : undefined,
        content_type: 'video' as const
      }

      return handleServiceCall(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const slug = sanitizers.slug(data.title)

        const { data: result, error } = await supabase
          .from('content')
          .insert({
            ...sanitizedData,
            slug,
            author_id: user.id,
            status: 'draft',
            version: 1,
          })
          .select()
          .single()

        if (error) throw error

        // Log audit
        await auditService.logContentCreation(result.id, 'video', result.title)

        return result
      }, 'Failed to create video lecture')
    }, RATE_LIMITS.CREATE_CONTENT.limit, RATE_LIMITS.CREATE_CONTENT.windowMs)
  },

  async updateVideoLecture(id: string, data: Partial<CreateContentPayload>) {
    return withRateLimit('UPDATE_CONTENT', async () => {
      // Validate input
      const validation = validators.videoLecture(data)
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') }
      }

      // Sanitize input
      const sanitizedData = {
        ...data,
        title: data.title ? sanitizers.text(data.title) : undefined,
        summary: data.summary ? sanitizers.text(data.summary) : undefined,
      }

      return handleServiceCall(async () => {
        // Get current content for audit
        const { data: current } = await supabase
          .from('content')
          .select('title, content')
          .eq('id', id)
          .single()

        const { data: result, error } = await supabase
          .from('content')
          .update({
            ...sanitizedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Log audit
        await auditService.logContentUpdate(id, 'video', {
          changes: sanitizedData,
          previous: current
        })

        return result
      }, 'Failed to update video lecture')
    }, RATE_LIMITS.UPDATE_CONTENT.limit, RATE_LIMITS.UPDATE_CONTENT.windowMs)
  },

  async deleteVideoLecture(id: string) {
    return withRateLimit('DELETE_CONTENT', async () => {
      return handleServiceCall(async () => {
        // Get content info for audit
        const { data: content } = await supabase
          .from('content')
          .select('title, content_type')
          .eq('id', id)
          .single()

        const { error } = await supabase
          .from('content')
          .update({ 
            status: 'archived',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (error) throw error

        // Log audit
        if (content) {
          await auditService.logContentDeletion(id, content.content_type, content.title)
        }

        return { success: true }
      }, 'Failed to delete video lecture')
    }, RATE_LIMITS.DELETE_CONTENT.limit, RATE_LIMITS.DELETE_CONTENT.windowMs)
  },

  async publishVideoLecture(id: string) {
    return withRateLimit('UPDATE_CONTENT', async () => {
      return handleServiceCall(async () => {
        const { data: result, error } = await supabase
          .from('content')
          .update({ 
            status: 'published',
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Log audit
        await auditService.logContentUpdate(id, 'video', { 
          action: 'publish',
          status: 'published' 
        })

        // Clear any client-side caches
        this.clearContentCache()

        return result
      }, 'Failed to publish video lecture')
    }, RATE_LIMITS.UPDATE_CONTENT.limit, RATE_LIMITS.UPDATE_CONTENT.windowMs)
  },

  async unpublishVideoLecture(id: string) {
    return withRateLimit('UPDATE_CONTENT', async () => {
      return handleServiceCall(async () => {
        const { data: result, error } = await supabase
          .from('content')
          .update({
            status: 'draft',
            published_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Log audit
        await auditService.logContentUpdate(id, 'video', { 
          action: 'unpublish',
          status: 'draft' 
        })

        // Clear any client-side caches
        this.clearContentCache()

        return result
      }, 'Failed to unpublish video lecture')
    }, RATE_LIMITS.UPDATE_CONTENT.limit, RATE_LIMITS.UPDATE_CONTENT.windowMs)
  },

  // Generic content methods for other types
  async getNotes(filters?: any) {
    return handleServiceCall(async () => {
      let query = supabase
        .from('content')
        .select('*')
        .eq('content_type', 'pdf')
        .order('updated_at', { ascending: false })

      if (filters?.search) {
        query = query.textSearch('title', filters.search)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }, 'Failed to fetch notes')
  },

  async createNote(data: CreateContentPayload) {
    return handleServiceCall(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      const { data: result, error } = await supabase
        .from('content')
        .insert({
          ...data,
          slug,
          author_id: user.id,
          status: 'draft',
          version: 1,
        })
        .select()
        .single()

      if (error) throw error
      return result
    }, 'Failed to create note')
  },

  async getPodcasts(filters?: any) {
    return handleServiceCall(async () => {
      // For now, treat podcasts as articles
      let query = supabase
        .from('content')
        .select('*')
        .eq('content_type', 'article')
        .order('updated_at', { ascending: false })

      if (filters?.search) {
        query = query.textSearch('title', filters.search)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }, 'Failed to fetch podcasts')
  },

  async createPodcast(data: CreateContentPayload) {
    return handleServiceCall(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      const { data: result, error } = await supabase
        .from('content')
        .insert({
          ...data,
          slug,
          author_id: user.id,
          status: 'draft',
          version: 1,
        })
        .select()
        .single()

      if (error) throw error
      return result
    }, 'Failed to create podcast')
  },

  async getQuizzes(filters?: any) {
    return handleServiceCall(async () => {
      let query = supabase
        .from('content')
        .select('*')
        .eq('content_type', 'quiz')
        .order('updated_at', { ascending: false })

      if (filters?.search) {
        query = query.textSearch('title', filters.search)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }, 'Failed to fetch quizzes')
  },

  async createQuiz(data: CreateContentPayload) {
    return handleServiceCall(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      const { data: result, error } = await supabase
        .from('content')
        .insert({
          ...data,
          slug,
          author_id: user.id,
          status: 'draft',
          version: 1,
        })
        .select()
        .single()

      if (error) throw error
      return result
    }, 'Failed to create quiz')
  }
}

// Topic Operations
export const topicService = {
  async getTopics() {
    return handleServiceCall(async () => {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    }, 'Failed to fetch topics')
  },

  async createTopic(data: { name: string; description?: string }) {
    return handleServiceCall(async () => {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      const { data: result, error } = await supabase
        .from('content_categories')
        .insert({
          name: data.name,
          slug,
          description: data.description,
        })
        .select()
        .single()

      if (error) throw error
      return result
    }, 'Failed to create topic')
  },

  async updateTopic(id: string, data: { name?: string; description?: string }) {
    return handleServiceCall(async () => {
      const updateData: any = { ...data }
      if (data.name) {
        updateData.slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      }

      const { data: result, error } = await supabase
        .from('content_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    }, 'Failed to update topic')
  },

  async deleteTopic(id: string) {
    return handleServiceCall(async () => {
      const { error } = await supabase
        .from('content_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    }, 'Failed to delete topic')
  },

  async reorderTopics(topicsArray: { id: string; order_index: number }[]) {
    return handleServiceCall(async () => {
      const updates = topicsArray.map((topic, index) => 
        supabase
          .from('content_categories')
          .update({ order_index: index })
          .eq('id', topic.id)
      )

      await Promise.all(updates)
      return { success: true }
    }, 'Failed to reorder topics')
  }
}

// User Operations
export const userService = {
  async getUsers(filters?: {
    search?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    return handleServiceCall(async () => {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, membership_status, membership_expires_at, created_at')
        .order('created_at', { ascending: false })

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('membership_status', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset && filters?.limit) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }, 'Failed to fetch users')
  },

  async getUserSubscriptions() {
    return handleServiceCall(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_status')
        .eq('membership_status', 'active')

      if (error) throw error
      return { count: data?.length || 0 }
    }, 'Failed to fetch user subscriptions')
  },

  async updateUserSubscription(userId: string, subscriptionData: {
    membership_status: 'active' | 'inactive' | 'expired'
    membership_expires_at?: string
  }) {
    return handleServiceCall(async () => {
      const { data: result, error } = await supabase
        .from('profiles')
        .update(subscriptionData)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return result
    }, 'Failed to update user subscription')
  },

  async getAdminUsers() {
    return handleServiceCall(async () => {
      const { data, error } = await supabase
        .from('admin_user_roles')
        .select(`
          id, user_id, role, permissions, created_at, updated_at,
          user:user_id(id, email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }, 'Failed to fetch admin users')
  },

  async addAdminUser(userId: string, role: 'admin' | 'editor' | 'reviewer') {
    return handleServiceCall(async () => {
      const permissions = role === 'admin' 
        ? ['content.*', 'user.*', 'system.*']
        : role === 'editor'
        ? ['content.*', 'user.read']
        : ['content.review', 'content.read']

      const { data: result, error } = await supabase
        .from('admin_user_roles')
        .insert({
          user_id: userId,
          role,
          permissions,
        })
        .select()
        .single()

      if (error) throw error
      return result
    }, 'Failed to add admin user')
  },

  async removeAdminUser(userId: string) {
    return handleServiceCall(async () => {
      const { error } = await supabase
        .from('admin_user_roles')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    }, 'Failed to remove admin user')
  }
}

// Analytics Operations
export const analyticsService = {
  async getDashboardStats() {
    return handleServiceCall(async () => {
      // Get content stats
      const { data: contentStats, error: contentError } = await supabase
        .from('content')
        .select('status')
      
      if (contentError) throw contentError

      const totalContent = contentStats?.length || 0
      const publishedContent = contentStats?.filter(c => c.status === 'published').length || 0
      const draftContent = contentStats?.filter(c => c.status === 'draft').length || 0
      const reviewQueue = contentStats?.filter(c => c.status === 'review').length || 0

      // Get user stats
      const { count: totalUsers, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (userError) throw userError

      const { data: activeSubs, error: subsError } = await supabase
        .from('profiles')
        .select('membership_status', { count: 'exact' })
        .eq('membership_status', 'active')

      if (subsError) throw subsError

      const { count: totalAdmins, error: adminError } = await supabase
        .from('admin_user_roles')
        .select('*', { count: 'exact', head: true })

      if (adminError) throw adminError

      return {
        totalContent,
        publishedContent,
        draftContent,
        reviewQueue,
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubs?.length || 0,
        totalAdmins: totalAdmins || 0,
      }
    }, 'Failed to fetch dashboard stats')
  },

  async getContentAnalytics(contentType: string, contentId: string): Promise<ContentAnalytics> {
    return handleServiceCall(async () => {
      // This is a placeholder - in a real implementation, you would
      // track views, completions, etc. in separate analytics tables
      return {
        views: Math.floor(Math.random() * 1000),
        completions: Math.floor(Math.random() * 500),
        averageTime: Math.floor(Math.random() * 3600),
        engagement: Math.floor(Math.random() * 100),
      }
    }, 'Failed to fetch content analytics')
  },

  async getUserEngagement(): Promise<UserEngagement> {
    return handleServiceCall(async () => {
      // This is a placeholder - in a real implementation, you would
      // track user engagement metrics
      return {
        activeUsers: Math.floor(Math.random() * 100),
        retentionRate: Math.floor(Math.random() * 100),
        averageSessionTime: Math.floor(Math.random() * 1800),
        newUsers: Math.floor(Math.random() * 10),
      }
    }, 'Failed to fetch user engagement')
  }
}

// Combined Admin Service
export const adminService = {
  // Clear client-side caches
  clearContentCache() {
    localStorage.removeItem('cached_videos')
    localStorage.removeItem('cached_notes') 
    localStorage.removeItem('cached_podcasts')
    localStorage.removeItem('cached_quizzes')
    localStorage.removeItem('cached_topics')
    sessionStorage.clear()
  },

  ...contentService,
  ...topicService,
  ...userService,
  ...analyticsService,
  // Add the existing adminContentService methods
  getContents: async (filters?: {
    search?: string; type?: string; status?: string;
    limit?: number; offset?: number;
  }) => {
    return handleServiceCall(async () => {
      let query = supabase
        .from('content')
        .select(
          'id, title, slug, content_type, status, summary, references, ' +
          'version, published_at, created_at, updated_at, ' +
          'author:author_id(id, email, full_name), ' +
          'reviewer:reviewer_id(id, email, full_name)'
        )
        .order('updated_at', { ascending: false })

      if (filters?.search) {
        query = query.textSearch('title', filters.search)
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('content_type', filters.type)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset && filters?.limit) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1)
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    }, 'Failed to fetch content')
  },
  getContentById: async (id: string) => {
    return handleServiceCall(async () => {
      const { data, error } = await supabase
        .from('content')
        .select(
          'id, title, slug, content_type, status, content, summary, references, ' +
          'version, published_at, created_at, updated_at, ' +
          'author:author_id(id, email, full_name), ' +
          'reviewer:reviewer_id(id, email, full_name)'
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    }, 'Failed to fetch content')
  },
  createContent: async (payload: any) => {
    return handleServiceCall(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

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
        .single()

      if (error) throw error
      return data
    }, 'Failed to create content')
  },
  updateContent: async (id: string, payload: any) => {
    return handleServiceCall(async () => {
      const { data, error } = await supabase
        .from('content')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'Failed to update content')
  },
  deleteContent: async (id: string) => {
    return handleServiceCall(async () => {
      const { error } = await supabase
        .from('content')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      return { success: true }
    }, 'Failed to delete content')
  },
}

// Toast helper for consistent error/success handling
export const showToast = (success: boolean, message: string) => {
  if (success) {
    toast.success(message)
  } else {
    toast.error(message)
  }
}
