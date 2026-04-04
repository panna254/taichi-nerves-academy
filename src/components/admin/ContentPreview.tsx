import { Video, FileText, Headphones, HelpCircle, Clock, Calendar, User, Tag } from "lucide-react"

interface ContentPreviewProps {
  content: any
  contentType: string
}

export function ContentPreview({ content, contentType }: ContentPreviewProps) {
  const getTypeIcon = () => {
    switch (contentType) {
      case 'video':
        return <Video className="h-5 w-5" />
      case 'note':
      case 'pdf':
        return <FileText className="h-5 w-5" />
      case 'podcast':
        return <Headphones className="h-5 w-5" />
      case 'quiz':
        return <HelpCircle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeLabel = () => {
    switch (contentType) {
      case 'video':
        return 'Video Lecture'
      case 'note':
        return 'Study Notes'
      case 'pdf':
        return 'PDF Document'
      case 'podcast':
        return 'Podcast'
      case 'quiz':
        return 'Quiz'
      default:
        return 'Content'
    }
  }

  const formatDuration = (duration: number) => {
    if (!duration) return 'N/A'
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="border-4 border-blue-500 rounded-lg p-6 bg-blue-50">
      {/* Preview Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
          {getTypeIcon()}
        </div>
        <div className="text-blue-600 font-bold text-sm uppercase tracking-wide">
          LEARNER VIEW PREVIEW
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-4">
        {/* Title and Type */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {content.title || 'Untitled Content'}
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {getTypeLabel()}
            </span>
          </div>
          
          {content.summary && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {content.summary}
            </p>
          )}
        </div>

        {/* Video Specific Details */}
        {contentType === 'video' && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {content.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(content.duration)}</span>
              </div>
            )}
            {content.youtube_url && (
              <div className="text-blue-600 hover:text-blue-800 underline">
                YouTube Link Available
              </div>
            )}
          </div>
        )}

        {/* File Information */}
        {content.file_url && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">File:</span> {content.file_url}
          </div>
        )}

        {/* Topics */}
        {content.topics && content.topics.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Topics:</div>
            <div className="flex flex-wrap gap-2">
              {content.topics.map((topic: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  {topic.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status and Dates */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Status:</div>
              <div className="font-medium">
                {content.status === 'published' ? (
                  <span className="text-green-600">Published</span>
                ) : content.status === 'draft' ? (
                  <span className="text-gray-600">Draft</span>
                ) : content.status === 'review' ? (
                  <span className="text-yellow-600">In Review</span>
                ) : (
                  <span className="text-red-600">Archived</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-gray-500">Created:</div>
              <div className="font-medium">
                {formatDate(content.created_at)}
              </div>
            </div>
          </div>

          {content.published_at && (
            <div className="mt-2 text-sm">
              <div className="text-gray-500">Published:</div>
              <div className="font-medium text-green-600">
                {formatDate(content.published_at)}
              </div>
            </div>
          )}
        </div>

        {/* Author Information */}
        {content.author_id && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>Author ID: {content.author_id}</span>
          </div>
        )}

        {/* Access Control */}
        <div className="border-t pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm font-medium text-yellow-800">
              {content.status === 'published' 
                ? '✅ This content is visible to all subscribed learners.'
                : '🔒 This content is NOT visible to learners.'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
