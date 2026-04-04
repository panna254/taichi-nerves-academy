import { useState, useCallback, useEffect } from 'react'

class RateLimiter {
  private timestamps: Map<string, number[]> = new Map()
  private storage: Map<string, any> = new Map()
  
  /**
   * Check if an action can be performed based on rate limits
   */
  canPerform(action: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const key = `${action}_${this.getUserId()}`
    const timestamps = this.timestamps.get(key) || []
    
    // Remove old timestamps outside window
    const validTimestamps = timestamps.filter(t => now - t < windowMs)
    
    if (validTimestamps.length >= limit) {
      return false
    }
    
    validTimestamps.push(now)
    this.timestamps.set(key, validTimestamps)
    return true
  }

  /**
   * Get remaining requests for an action
   */
  getRemainingRequests(action: string, limit: number, windowMs: number): number {
    const now = Date.now()
    const key = `${action}_${this.getUserId()}`
    const timestamps = this.timestamps.get(key) || []
    
    const validTimestamps = timestamps.filter(t => now - t < windowMs)
    return Math.max(0, limit - validTimestamps.length)
  }

  /**
   * Get time until next available request
   */
  getTimeUntilNextRequest(action: string, windowMs: number): number {
    const now = Date.now()
    const key = `${action}_${this.getUserId()}`
    const timestamps = this.timestamps.get(key) || []
    
    const validTimestamps = timestamps.filter(t => now - t < windowMs)
    if (validTimestamps.length === 0) return 0
    
    const oldestTimestamp = Math.min(...validTimestamps)
    return Math.max(0, oldestTimestamp + windowMs - now)
  }

  /**
   * Reset rate limit for a specific action
   */
  reset(action: string): void {
    const key = `${action}_${this.getUserId()}`
    this.timestamps.delete(key)
  }

  /**
   * Get user identifier for rate limiting
   */
  private getUserId(): string {
    // Try to get user ID from various sources
    if (typeof window !== 'undefined') {
      // Check for user ID in localStorage
      const userId = localStorage.getItem('userId')
      if (userId) return userId
      
      // Check for session ID
      let sessionId = sessionStorage.getItem('rateLimitSessionId')
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15)
        sessionStorage.setItem('rateLimitSessionId', sessionId)
      }
      return sessionId
    }
    
    // Fallback to random ID
    return Math.random().toString(36).substring(2, 15)
  }

  /**
   * Store data with expiration
   */
  store(key: string, value: any, ttlMs: number): void {
    const expiry = Date.now() + ttlMs
    this.storage.set(key, { value, expiry })
  }

  /**
   * Retrieve stored data
   */
  retrieve(key: string): any {
    const item = this.storage.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.storage.delete(key)
      return null
    }
    
    return item.value
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now()
    
    // Clean up timestamps
    for (const [key, timestamps] of this.timestamps.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < 3600000) // 1 hour window
      if (validTimestamps.length === 0) {
        this.timestamps.delete(key)
      } else {
        this.timestamps.set(key, validTimestamps)
      }
    }
    
    // Clean up storage
    for (const [key, item] of this.storage.entries()) {
      if (now > item.expiry) {
        this.storage.delete(key)
      }
    }
  }
}

// Predefined rate limits
export const RATE_LIMITS = {
  // Content operations
  CREATE_CONTENT: { limit: 5, windowMs: 60000 }, // 5 creations per minute
  UPDATE_CONTENT: { limit: 20, windowMs: 60000 }, // 20 updates per minute
  DELETE_CONTENT: { limit: 3, windowMs: 60000 }, // 3 deletions per minute
  
  // File uploads
  UPLOAD_FILE: { limit: 10, windowMs: 60000 }, // 10 uploads per minute
  
  // User operations
  UPDATE_USER: { limit: 10, windowMs: 60000 }, // 10 user updates per minute
  LOGIN_ATTEMPT: { limit: 5, windowMs: 900000 }, // 5 login attempts per 15 minutes
  
  // API calls
  API_REQUEST: { limit: 100, windowMs: 60000 }, // 100 API requests per minute
  
  // Search operations
  SEARCH: { limit: 30, windowMs: 60000 }, // 30 searches per minute
}

export const rateLimiter = new RateLimiter()

// Rate limiting hook for React components
export const useRateLimit = (action: string, limit: number, windowMs: number) => {
  const [canPerform, setCanPerform] = useState(true)
  const [remaining, setRemaining] = useState(limit)
  const [resetTime, setResetTime] = useState(0)

  const checkRateLimit = useCallback(() => {
    const can = rateLimiter.canPerform(action, limit, windowMs)
    const remainingRequests = rateLimiter.getRemainingRequests(action, limit, windowMs)
    const timeUntilReset = rateLimiter.getTimeUntilNextRequest(action, windowMs)

    setCanPerform(can)
    setRemaining(remainingRequests)
    setResetTime(timeUntilReset)

    return can
  }, [action, limit, windowMs])

  useEffect(() => {
    checkRateLimit()
    
    const interval = setInterval(() => {
      checkRateLimit()
    }, 1000)

    return () => clearInterval(interval)
  }, [checkRateLimit])

  return {
    canPerform,
    remaining,
    resetTime,
    checkRateLimit
  }
}

// Rate limiting middleware for API calls
export const withRateLimit = async (
  action: string,
  apiCall: () => Promise<any>,
  limit?: number,
  windowMs?: number
) => {
  const rateLimitConfig = RATE_LIMITS[action as keyof typeof RATE_LIMITS]
  const finalLimit = limit || rateLimitConfig?.limit || 10
  const finalWindowMs = windowMs || rateLimitConfig?.windowMs || 60000

  if (!rateLimiter.canPerform(action, finalLimit, finalWindowMs)) {
    const timeUntilReset = rateLimiter.getTimeUntilNextRequest(action, finalWindowMs)
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`)
  }

  try {
    const result = await apiCall()
    return result
  } catch (error) {
    // Don't count failed requests towards rate limit
    rateLimiter.reset(action)
    throw error
  }
}

// Cleanup expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup()
  }, 300000) // Clean up every 5 minutes
}

export default rateLimiter
