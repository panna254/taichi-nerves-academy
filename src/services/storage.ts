import { supabase } from '@/lib/supabase';

export class StorageError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const storageService = {
  /**
   * Upload user avatar
   * @param userId User ID
   * @param file Image file
   * @returns Public URL of the uploaded avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new StorageError('Only image files are allowed for avatars');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new StorageError('Avatar file size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (error) {
        console.error('Avatar upload error:', error);
        throw new StorageError('Failed to upload avatar', error.message);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      console.error('Unexpected error uploading avatar:', error);
      throw new StorageError('An unexpected error occurred while uploading avatar');
    }
  },

  /**
   * Upload lecture resource
   * @param lectureId Lecture ID
   * @param file Resource file
   * @returns Public URL of the uploaded resource
   */
  async uploadLectureResource(lectureId: string, file: File): Promise<string> {
    try {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new StorageError('Resource file size must be less than 50MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${lectureId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('lecture-resources')
        .upload(fileName, file, {
          contentType: file.type
        });
      
      if (error) {
        console.error('Resource upload error:', error);
        throw new StorageError('Failed to upload resource', error.message);
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lecture-resources')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      console.error('Unexpected error uploading resource:', error);
      throw new StorageError('An unexpected error occurred while uploading resource');
    }
  },

  /**
   * Delete file from storage
   * @param bucket Storage bucket name
   * @param path File path in bucket
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) {
        console.error('File deletion error:', error);
        throw new StorageError('Failed to delete file', error.message);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      console.error('Unexpected error deleting file:', error);
      throw new StorageError('An unexpected error occurred while deleting file');
    }
  },

  /**
   * Get public URL for a file
   * @param bucket Storage bucket name
   * @param path File path in bucket
   * @returns Public URL
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * List files in a bucket path
   * @param bucket Storage bucket name
   * @param path Directory path
   * @returns Array of file information
   */
  async listFiles(bucket: string, path: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);
      
      if (error) {
        console.error('File listing error:', error);
        throw new StorageError('Failed to list files', error.message);
      }
      
      return data || [];
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      console.error('Unexpected error listing files:', error);
      throw new StorageError('An unexpected error occurred while listing files');
    }
  },

  /**
   * Upload multiple files for a lecture
   * @param lectureId Lecture ID
   * @param files Array of files
   * @returns Array of public URLs
   */
  async uploadMultipleLectureResources(lectureId: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => 
      this.uploadLectureResource(lectureId, file)
    );
    
    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new StorageError('Failed to upload one or more files');
    }
  }
};
