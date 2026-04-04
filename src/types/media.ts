export type ContentType = 'video' | 'note' | 'podcast' | 'quiz'
export type ViewMode = 'grid' | 'list'
export type SortBy = 'title' | 'created_at' | 'view_count'
export type SortOrder = 'asc' | 'desc'

export interface ContentItem {
  id: string
  title: string
  description?: string
  content_type: ContentType
  status: 'draft' | 'published' | 'archived'
  thumbnail_url?: string
  file_url?: string
  duration?: number
  view_count?: number
  created_at: string
  updated_at: string
  topics?: { id: string; name: string; slug: string }[]
  author?: { id: string; full_name?: string; email: string }
}

export interface Filters {
  topic: string
  status: string
  dateRange: string
}
