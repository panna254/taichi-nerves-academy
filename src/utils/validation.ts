export const validators = {
  // Video lecture validation
  videoLecture: (data: any) => {
    const errors: string[] = []
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters')
    }
    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
    if (!data.content_type) {
      errors.push('Content type is required')
    }
    if (data.youtube_url && !isValidYouTubeUrl(data.youtube_url)) {
      errors.push('Invalid YouTube URL format')
    }
    if (data.duration && (data.duration < 0 || data.duration > 86400)) {
      errors.push('Duration must be between 0 and 24 hours')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Note validation
  note: (data: any) => {
    const errors: string[] = []
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters')
    }
    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
    if (!data.content_type) {
      errors.push('Content type is required')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Podcast validation
  podcast: (data: any) => {
    const errors: string[] = []
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters')
    }
    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
    if (!data.content_type) {
      errors.push('Content type is required')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Quiz validation
  quiz: (data: any) => {
    const errors: string[] = []
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters')
    }
    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
    if (!data.content_type) {
      errors.push('Content type is required')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Topic validation
  topic: (data: any) => {
    const errors: string[] = []
    
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Topic name must be at least 2 characters')
    }
    if (data.name && data.name.length > 100) {
      errors.push('Topic name must be less than 100 characters')
    }
    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // User validation
  user: (data: any) => {
    const errors: string[] = []
    
    if (!data.email || !isValidEmail(data.email)) {
      errors.push('Valid email is required')
    }
    if (data.full_name && data.full_name.length > 100) {
      errors.push('Full name must be less than 100 characters')
    }
    if (data.membership_status && !['active', 'inactive', 'expired'].includes(data.membership_status)) {
      errors.push('Invalid membership status')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // File upload validation
  file: (file: File, type: 'video' | 'audio' | 'pdf' | 'image') => {
    const errors: string[] = []
    const maxSizes = {
      video: 500 * 1024 * 1024, // 500MB
      audio: 100 * 1024 * 1024, // 100MB
      pdf: 50 * 1024 * 1024,    // 50MB
      image: 5 * 1024 * 1024     // 5MB
    }
    
    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      pdf: ['application/pdf'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
    
    if (file.size > maxSizes[type]) {
      errors.push(`File size must be less than ${maxSizes[type] / 1024 / 1024}MB`)
    }
    
    if (!allowedTypes[type].includes(file.type)) {
      errors.push(`Invalid file type. Allowed: ${allowedTypes[type].join(', ')}`)
    }
    
    // Check file name for suspicious characters
    const suspiciousChars = /[<>:"|?*\x00-\x1f]/
    if (suspiciousChars.test(file.name)) {
      errors.push('File name contains invalid characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // URL validation
  url: (url: string) => {
    try {
      new URL(url)
      return { valid: true, errors: [] }
    } catch {
      return { valid: false, errors: ['Invalid URL format'] }
    }
  },

  // Slug validation
  slug: (slug: string) => {
    const errors: string[] = []
    
    if (!slug || slug.trim().length < 3) {
      errors.push('Slug must be at least 3 characters')
    }
    
    // Only allow alphanumeric, hyphens, and underscores
    const validSlugRegex = /^[a-z0-9-_]+$/
    if (!validSlugRegex.test(slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, hyphens, and underscores')
    }
    
    if (slug.length > 100) {
      errors.push('Slug must be less than 100 characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Content validation
  content: (data: any) => {
    const errors: string[] = []
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters')
    }
    if (data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
    if (!data.content_type || !['article', 'video', 'pdf', 'quiz'].includes(data.content_type)) {
      errors.push('Valid content type is required')
    }
    if (data.summary && data.summary.length > 500) {
      errors.push('Summary must be less than 500 characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Helper functions
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
  return youtubeRegex.test(url)
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitization functions
export const sanitizers = {
  // Sanitize HTML content
  html: (html: string): string => {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  },

  // Sanitize text input
  text: (text: string): string => {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 10000) // Limit length
  },

  // Sanitize file name
  fileName: (fileName: string): string => {
    return fileName
      .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase()
      .substring(0, 255) // Limit length
  },

  // Sanitize slug
  slug: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and underscores
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100) // Limit length
  }
}

// Security utilities
export const security = {
  // Generate CSRF token (simplified version)
  generateCSRFToken: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  },

  // Check if request is from same origin
  isSameOrigin: (url: string): boolean => {
    try {
      const origin = window.location.origin
      const urlObj = new URL(url)
      return urlObj.origin === origin
    } catch {
      return false
    }
  },

  // Validate file signature (magic numbers)
  validateFileSignature: (file: File, expectedType: string): boolean => {
    // This is a simplified version - in production, use proper file signature checking
    const signatures: { [key: string]: number[] } = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'application/pdf': [0x25, 0x50, 0x44, 0x46],
      'video/mp4': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    }
    
    const expectedSignature = signatures[expectedType]
    if (!expectedSignature) return true // Skip validation for unknown types
    
    // This would require reading the file bytes - simplified for now
    return true
  }
}
