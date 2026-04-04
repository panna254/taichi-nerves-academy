import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, File, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { uploadService, UploadProgress, UploadResult } from '@/services/uploadService'

type FileType = 'video' | 'audio' | 'pdf' | 'image'
type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error' | 'cancelled'

interface FileUploadZoneProps {
  fileType: FileType
  bucket: string
  folder: string
  onUploadComplete?: (result: UploadResult) => void
  onThumbnailGenerated?: (thumbnail: string | null) => void
  label?: string
  required?: boolean
}

export default function FileUploadZone({
  fileType,
  bucket,
  folder,
  onUploadComplete,
  onThumbnailGenerated,
  label,
  required = false
}: FileUploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setUploadError] = useState<string | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Get accepted file types
  const getAcceptedTypes = (): string => {
    switch (fileType) {
      case 'video':
        return 'video/mp4,video/webm,video/ogg,video/quicktime'
      case 'audio':
        return 'audio/mp3,audio/wav,audio/ogg,audio/m4a'
      case 'pdf':
        return 'application/pdf'
      case 'image':
        return 'image/jpeg,image/png,image/gif,image/webp'
      default:
        return ''
    }
  }

  // Validate file type and size
  const validateFile = (selectedFile: File): string | null => {
    const acceptedTypes = getAcceptedTypes().split(',')
    if (!acceptedTypes.some(type => selectedFile.type.includes(type.split('/')[1]))) {
      return `Invalid file type. Please upload a ${fileType} file.`
    }

    const maxSize = fileType === 'video' ? 500 * 1024 * 1024 : // 500MB for videos
                   fileType === 'audio' ? 50 * 1024 * 1024 :  // 50MB for audio
                   fileType === 'pdf' ? 20 * 1024 * 1024 :    // 20MB for PDFs
                   10 * 1024 * 1024                           // 10MB for images

    if (selectedFile.size > maxSize) {
      return `File size exceeds ${uploadService.formatBytes(maxSize)} limit.`
    }

    return null
  }

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setUploadState('validating')
    setFile(selectedFile)
    setUploadError(null)

    // Validate file
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setUploadError(validationError)
      setUploadState('error')
      return
    }

    // Generate thumbnail for videos
    if (fileType === 'video' && onThumbnailGenerated) {
      const thumbnail = await uploadService.generateThumbnail(selectedFile)
      onThumbnailGenerated(thumbnail)
    }

    // Start upload
    startUpload(selectedFile)
  }, [fileType, onThumbnailGenerated])

  // Start upload process
  const startUpload = async (selectedFile: File) => {
    setUploadState('uploading')
    setProgress(null)
    
    abortControllerRef.current = new AbortController()

    const fileName = `${folder}/${Date.now()}_${selectedFile.name}`
    
    try {
      const result = await uploadService.uploadFile(
        selectedFile,
        bucket,
        fileName,
        (uploadProgress) => {
          setProgress(uploadProgress)
        }
      )

      if (result.success && result.url) {
        setUploadUrl(result.url)
        setUploadState('success')
        onUploadComplete?.(result)
      } else {
        setUploadError(result.error || 'Upload failed')
        setUploadState('error')
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
      setUploadState('error')
    }
  }

  // Cancel upload
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setUploadState('cancelled')
    setProgress(null)
  }

  // Reset upload zone
  const resetUpload = () => {
    setUploadState('idle')
    setFile(null)
    setProgress(null)
    setUploadError(null)
    setUploadUrl(null)
    abortControllerRef.current = null
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  // Get file icon
  const getFileIcon = () => {
    switch (uploadState) {
      case 'uploading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />
      case 'cancelled':
        return <X className="h-8 w-8 text-gray-500" />
      default:
        return <Upload className="h-8 w-8 text-gray-400" />
    }
  }

  // Get status text
  const getStatusText = () => {
    switch (uploadState) {
      case 'validating':
        return 'Validating file...'
      case 'uploading':
        return progress ? `Uploading... ${progress.percentage}%` : 'Starting upload...'
      case 'success':
        return 'Upload completed successfully'
      case 'error':
        return error || 'Upload failed'
      case 'cancelled':
        return 'Upload cancelled'
      default:
        return label || `Drop ${fileType} file here or click to browse`
    }
  }

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileInputChange}
        className="hidden"
        required={required}
      />

      {/* Upload zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${uploadState === 'idle' ? 'border-gray-300 hover:border-gray-400 cursor-pointer' : ''}
          ${uploadState === 'validating' ? 'border-blue-300 bg-blue-50' : ''}
          ${uploadState === 'uploading' ? 'border-blue-500 bg-blue-50' : ''}
          ${uploadState === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${uploadState === 'error' ? 'border-red-500 bg-red-50' : ''}
          ${uploadState === 'cancelled' ? 'border-gray-400 bg-gray-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* File icon */}
          {getFileIcon()}

          {/* Status text */}
          <p className={`text-sm ${
            uploadState === 'error' ? 'text-red-600' : 
            uploadState === 'success' ? 'text-green-600' : 
            'text-gray-600'
          }`}>
            {getStatusText()}
          </p>

          {/* File info */}
          {file && (
            <div className="text-xs text-gray-500">
              <p>{file.name}</p>
              <p>{uploadService.formatBytes(file.size)}</p>
            </div>
          )}

          {/* Progress bar */}
          {uploadState === 'uploading' && progress && (
            <div className="w-full max-w-md">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{uploadService.formatBytes(progress.speed)}/s</span>
                <span>{uploadService.formatTime(progress.timeRemaining)} remaining</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {uploadState === 'uploading' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                cancelUpload()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel Upload
            </button>
          )}

          {(uploadState === 'success' || uploadState === 'error' || uploadState === 'cancelled') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                resetUpload()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {uploadState === 'success' ? 'Replace File' : 'Try Again'}
            </button>
          )}

          {/* Upload URL */}
          {uploadState === 'success' && uploadUrl && (
            <div className="text-xs text-green-600 max-w-md truncate">
              <p>File URL: {uploadUrl}</p>
            </div>
          )}
        </div>
      </div>

      {/* Required indicator */}
      {required && uploadState === 'idle' && (
        <p className="text-xs text-red-500 mt-1">*This field is required</p>
      )}
    </div>
  )
}
