import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Upload,
  Calendar,
  Clock,
  Play,
  FileText,
  Headphones,
  HelpCircle
} from 'lucide-react'
import GridView from '@/components/admin/GridView'
import ListView from '@/components/admin/ListView'
import BulkActionsToolbar from '@/components/admin/BulkActionsToolbar'
import FilterBar from '@/components/admin/FilterBar'
import Pagination from '@/components/admin/Pagination'
import { ContentItem, ContentType, ViewMode, SortBy, SortOrder, Filters } from '@/types/media'

export default function MediaLibrary() {
  const [contentType, setContentType] = useState<ContentType>('video')
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    topic: 'all',
    status: 'all',
    dateRange: 'all'
  })
  const [sortBy, setSortBy] = useState<SortBy>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([])
  const itemsPerPage = 20

  // Get table name based on content type
  const getTableName = () => {
    return 'content' // All content is in the content table
  }

  // Get date range for filtering
  const getDateRange = (range: string) => {
    const now = new Date()
    switch (range) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(0)
    }
  }

  // Fetch topics for filter dropdown
  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('id, name')
        .order('name')

      if (error) throw error
      setTopics(data || [])
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  // Fetch content with filters
  const fetchContent = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from(getTableName())
        .select(`
          *,
          topics(id, name, slug),
          author:author_id(id, full_name, email)
        `, { count: 'exact' })

      // Filter by content type
      query = query.eq('content_type', contentType)

      // Apply filters
      if (filters.topic !== 'all') {
        query = query.contains('topics', [{ id: filters.topic }])
      }
      if (filters.status === 'published') {
        query = query.eq('status', 'published')
      } else if (filters.status === 'unpublished') {
        query = query.eq('status', 'draft')
      }
      if (filters.dateRange !== 'all') {
        const date = getDateRange(filters.dateRange)
        query = query.gte('created_at', date.toISOString())
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      setContent(data || [])
      setFilteredContent(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics()
  }, [])

  // Fetch content when filters change
  useEffect(() => {
    fetchContent()
  }, [contentType, filters, searchQuery, sortBy, sortOrder, page])

  // Bulk operations
  const handleBulkPublish = async () => {
    if (selectedItems.size === 0) return

    try {
      const { error } = await supabase
        .from(getTableName())
        .update({ status: 'published', published_at: new Date().toISOString() })
        .in('id', Array.from(selectedItems))

      if (error) throw error
      setSelectedItems(new Set())
      fetchContent()
    } catch (error) {
      console.error('Bulk publish failed:', error)
    }
  }

  const handleBulkUnpublish = async () => {
    if (selectedItems.size === 0) return

    try {
      const { error } = await supabase
        .from(getTableName())
        .update({ status: 'draft', published_at: null })
        .in('id', Array.from(selectedItems))

      if (error) throw error
      setSelectedItems(new Set())
      fetchContent()
    } catch (error) {
      console.error('Bulk unpublish failed:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    if (!confirm(`Delete ${selectedItems.size} items? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from(getTableName())
        .delete()
        .in('id', Array.from(selectedItems))

      if (error) throw error
      setSelectedItems(new Set())
      fetchContent()
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  // Toggle item selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Select all on page
  const selectAll = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredContent.map(item => item.id)))
    }
  }

  // Individual actions
  const handleEdit = (item: ContentItem) => {
    // Navigate to edit page
    window.location.href = `/admin/content/${item.id}`
  }

  const handlePreview = (item: ContentItem) => {
    // Open preview modal or navigate to preview
    window.open(item.file_url || '#', '_blank')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from(getTableName())
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchContent()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  // Get content type icon
  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'podcast': return <Headphones className="h-4 w-4" />
      case 'quiz': return <HelpCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage all your content in one place</p>
        </div>
        <Link to="/admin/content/new">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New Content
          </Button>
        </Link>
      </div>

      {/* Content type tabs */}
      <div className="flex space-x-1 border-b">
        {(['video', 'note', 'podcast', 'quiz'] as ContentType[]).map(type => (
          <button
            key={type}
            onClick={() => setContentType(type)}
            className={`px-4 py-2 font-medium transition-colors ${
              contentType === type 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              {getContentIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </div>
          </button>
        ))}
      </div>

      {/* Search and filters */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        topics={topics}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Bulk actions toolbar */}
      {selectedItems.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedItems.size}
          onPublish={handleBulkPublish}
          onUnpublish={handleBulkUnpublish}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedItems(new Set())}
        />
      )}

      {/* Content display */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                {getContentIcon(contentType)}
              </div>
              <h3 className="text-lg font-semibold mb-2">No {contentType}s found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filters.topic !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all'
                  ? 'Try adjusting your search or filters'
                  : `Get started by uploading your first ${contentType}`
                }
              </p>
              <Link to="/admin/content/new">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <GridView
          content={filteredContent}
          selectedItems={selectedItems}
          onToggleSelect={toggleSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      ) : (
        <ListView
          content={filteredContent}
          selectedItems={selectedItems}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      )}

      {/* Pagination */}
      {totalCount > itemsPerPage && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalCount / itemsPerPage)}
          onPageChange={setPage}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  )
}
