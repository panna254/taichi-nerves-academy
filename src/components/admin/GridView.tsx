import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Edit, Trash2, Play, Clock, FileText, Headphones, HelpCircle } from 'lucide-react'
import { ContentItem } from '@/types/media'

interface GridViewProps {
  content: ContentItem[]
  selectedItems: Set<string>
  onToggleSelect: (id: string) => void
  onEdit: (item: ContentItem) => void
  onDelete: (id: string) => void
  onPreview: (item: ContentItem) => void
}

export default function GridView({ 
  content, 
  selectedItems, 
  onToggleSelect, 
  onEdit, 
  onDelete, 
  onPreview 
}: GridViewProps) {
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
      case 'published': return 'bg-green-500 text-white'
      case 'draft': return 'bg-gray-500 text-white'
      case 'archived': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return null
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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {content.map(item => (
        <Card key={item.id} className="group hover:shadow-lg transition-shadow">
          <div className="relative">
            {/* Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedItems.has(item.id)}
                onCheckedChange={() => onToggleSelect(item.id)}
                className="bg-white/90 backdrop-blur"
              />
            </div>

            {/* Thumbnail/Preview */}
            <div className="relative aspect-video bg-muted overflow-hidden">
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

              {/* Status badge */}
              <div className="absolute top-3 right-3">
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>

              {/* Duration badge for videos/podcasts */}
              {item.duration && (
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {formatDuration(item.duration)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            {/* Title and description */}
            <div className="mb-3">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {item.description}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.topics && item.topics.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {item.topics[0].name}
                </Badge>
              )}
              {item.view_count !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {item.view_count.toLocaleString()} views
                </Badge>
              )}
            </div>

            {/* Date */}
            <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(item.created_at)}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(item)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
