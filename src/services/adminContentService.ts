import { supabase } from "@/lib/supabase"

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
}

export const adminContentService = {
  async getContents(filters?: {
    search?: string; type?: string; status?: string;
    limit?: number; offset?: number;
  }) {
    let query = supabase
      .from('content')
      .select(
        'id, title, slug, content_type, status, summary, references, ' +
        'version, published_at, created_at, updated_at, ' +
        'author:author_id(name, email), ' +
        'reviewer:reviewer_id(name, email)'
      )
      .order('updated_at', { ascending: false })

    // TODO: replace author_id join target with your profiles
    // table name if different from auth.users

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
  },

  async getContentById(id: string) {
    const { data, error } = await supabase
      .from('content')
      .select(
        'id, title, slug, content_type, status, content, summary, references, ' +
        'version, published_at, created_at, updated_at, ' +
        'author:author_id(name, email), ' +
        'reviewer:reviewer_id(name, email)'
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createContent(payload: CreateContentPayload) {
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

    await this.logContentChange(data.id, 'created', user.id)
    return data
  },

  async updateContent(id: string, payload: Partial<CreateContentPayload>) {
    const current = await this.getContentById(id)

    const { data, error } = await supabase
      .from('content')
      .update({
        ...payload,
        version: current.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await this.logContentChange(id, 'updated', current.author_id, current, payload)
    return data
  },

  async deleteContent(id: string) {
    const current = await this.getContentById(id)

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id)

    if (error) throw error

    await this.logContentChange(id, 'deleted', current.author_id, current, undefined)
    return { success: true }
  },

  async submitForReview(id: string) {
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await this.logContentChange(id, 'submitted_for_review', data.author_id)
    return data
  },

  async approveContent(id: string, reviewerId: string) {
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'published',
        reviewer_id: reviewerId,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await this.logContentChange(id, 'approved', reviewerId)
    return data
  },

  async requestChanges(id: string, notes: string) {
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await this.logContentChange(id, 'changes_requested', data.author_id, { notes }, undefined)
    return data
  },

  async logContentChange(
    contentId: string,
    action: string,
    userId: string,
    oldData?: any,
    newData?: any
  ) {
    try {
      await supabase
        .from('content_audit_log')
        .insert({
          content_id: contentId,
          user_id: userId,
          action,
          old_values: oldData ?? null,
          new_values: newData ?? null,
        })
    } catch {
      // Silently swallow any errors
    }
  },
}
