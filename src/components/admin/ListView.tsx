import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Edit, Trash2, Play, Clock, FileText, Headphones, HelpCircle } from 'lucide-react'
import { ContentItem } from '@/types/media'

interface ListViewProps {
  content: ContentItem[]
  selectedItems: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onEdit: (item: ContentItem) => void
  onDelete: (id: string) => void
  onPreview: (item: ContentItem) => void
}

export default function ListView({ 
  content, 
  selectedItems, 
  onToggleSelect, 
  onSelectAll,
  onEdit, 
  onDelete, 
  onPreview 
}: ListViewProps) {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'podcast': return <Headphones className="h-4 w-4" />
      case 'quiz': return <HelpCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return '-'
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isAllSelected = content.length > 0 && selectedItems.size === content.length
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < content.length

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                ref={(el) => {
                  if (el && isIndeterminate) {
                    el.indeterminate = true
                  }
                }}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {content.map(item => (
            <TableRow key={item.id} className="hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => onToggleSelect(item.id)}
                  aria-label={`Select ${item.title}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.thumbnail_url ? (
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                        <div className="text-primary/60">
                          {getContentIcon(item.content_type)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Title and description */}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate max-w-xs">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getContentIcon(item.content_type)}
                  {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                </div>
              </TableCell>
              <TableCell>
                {item.topics && item.topics.length > 0 ? (
                  <Badge variant="outline" className="text-xs">
                    {item.topics[0].name}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No topic</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDuration(item.duration)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.view_count !== undefined ? item.view_count.toLocaleString() : '-'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(item.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
