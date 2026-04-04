import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Upload, EyeOff, Trash2 } from 'lucide-react'

interface BulkActionsToolbarProps {
  selectedCount: number
  onPublish: () => void
  onUnpublish: () => void
  onDelete: () => void
  onClearSelection: () => void
}

export default function BulkActionsToolbar({
  selectedCount,
  onPublish,
  onUnpublish,
  onDelete,
  onClearSelection
}: BulkActionsToolbarProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4 mr-1" />
            Clear selection
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPublish}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUnpublish}
            className="gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Unpublish
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
