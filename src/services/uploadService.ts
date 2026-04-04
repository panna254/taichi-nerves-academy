import { supabase } from '@/lib/supabase'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed: number
  timeRemaining: number
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  metadata?: {
    name: string
    size: number
    type: string
    uploadedAt: string
  }
}

export const uploadService = {
  /**
   * Upload a file to Supabase storage
   */
  async uploadFile(
    file: File,
    bucket: string,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return new Promise((resolve) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      const startTime = Date.now()

      // Setup progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const loaded = event.loaded
          const total = event.total
          const percentage = Math.round((loaded / total) * 100)
          const elapsed = (Date.now() - startTime) / 1000
          const speed = loaded / elapsed
          const timeRemaining = (total - loaded) / speed

          onProgress({
            loaded,
            total,
            percentage,
            speed,
            timeRemaining
          })
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
            
            resolve({
              success: true,
              url,
              metadata: {
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
              }
            })
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to parse upload response'
            })
          }
        } else {
          resolve({
            success: false,
            error: `Upload failed with status ${xhr.status}`
          })
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Network error during upload'
        })
      })

      xhr.addEventListener('timeout', () => {
        resolve({
          success: false,
          error: 'Upload timeout'
        })
      })

      // Configure and send request
      xhr.timeout = 300000 // 5 minutes
      xhr.open('POST', `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`)
      xhr.setRequestHeader('Authorization', `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`)
      xhr.send(formData)
    })
  },

  /**
   * Upload large files in chunks
   */
  async chunkedUpload(
    file: File,
    bucket: string,
    path: string,
    chunkSize: number = 1024 * 1024 * 5, // 5MB chunks
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const totalChunks = Math.ceil(file.size / chunkSize)
    let uploadedChunks = 0

    try {
      // For now, fall back to regular upload
      // In a real implementation, you would handle chunked uploads here
      return await this.uploadFile(file, bucket, path, onProgress)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Chunked upload failed'
      }
    }
  },

  /**
   * Generate thumbnail for video files
   */
  async generateThumbnail(
    file: File,
    maxWidth: number = 320,
    maxHeight: number = 240
  ): Promise<string | null> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve(null)
        return
      }

      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(null)
        return
      }

      video.addEventListener('loadedmetadata', () => {
        // Set canvas dimensions
        const aspectRatio = video.videoWidth / video.videoHeight
        let width = maxWidth
        let height = maxHeight

        if (aspectRatio > maxWidth / maxHeight) {
          height = width / aspectRatio
        } else {
          width = height * aspectRatio
        }

        canvas.width = width
        canvas.height = height

        // Seek to 1 second or 10% of video duration
        const seekTime = Math.min(1, video.duration * 0.1)
        video.currentTime = seekTime
      })

      video.addEventListener('seeked', () => {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to data URL
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnail)
      })

      video.addEventListener('error', () => {
        resolve(null)
      })

      // Load video
      video.src = URL.createObjectURL(file)
    })
  },

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  },

  /**
   * Format seconds to human readable time format
   */
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `0:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
}
