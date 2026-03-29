import { supabase } from "@/lib/supabase"

export interface UploadedFile {
  id: string
  name: string        // original filename shown to user
  type: string        // MIME type
  size: number        // bytes
  url: string         // public URL
  storagePath: string // path inside bucket
  uploadedAt: string  // ISO timestamp from DB record
}

export const adminFileService = {
  validateFile(file: File): { valid: boolean; error: string | null } {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    const maxSize = 104857600 // 100MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large (max 100MB)' }
    }

    return { valid: true, error: null }
  },

  async uploadFile(
    file: File,
    contentId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error!)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `content/${contentId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('content-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Call progress callback if provided (Supabase v2 doesn't support onUploadProgress)
    if (onProgress) {
      onProgress(100)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('content-files')
      .getPublicUrl(filePath)

    const { data: fileRecord, error: dbError } = await supabase
      .from('content_files')
      .insert({
        content_id: contentId,
        filename: fileName,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        mime_type: file.type,
        public_url: publicUrl,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return {
      id: fileRecord.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: publicUrl,
      storagePath: filePath,
      uploadedAt: fileRecord.created_at,
    }
  },

  async deleteFile(fileId: string) {
    const { data: file, error: fetchError } = await supabase
      .from('content_files')
      .select('storage_path')
      .eq('id', fileId)
      .single()

    if (fetchError || !file) {
      throw new Error('File not found')
    }

    const { error: storageError } = await supabase.storage
      .from('content-files')
      .remove([file.storage_path])

    if (storageError) throw storageError

    const { error: dbError } = await supabase
      .from('content_files')
      .delete()
      .eq('id', fileId)

    if (dbError) throw dbError

    return { success: true }
  },

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from('content-files')
      .createSignedUrl(filePath, expiresIn)

    if (error) throw error
    return data.signedUrl
  },
}
