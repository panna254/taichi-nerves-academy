import { supabase } from "@/lib/supabase"

export interface AuditLog {
  id?: string
  user_id?: string
  action: string
  resource_type: string
  resource_id: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at?: string
}

export const auditService = {
  /**
   * Log an action to the audit trail
   */
  async logAction(action: string, resourceType: string, resourceId: string, details?: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const auditLog: Partial<AuditLog> = {
        user_id: user?.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: await this.getClientIP(),
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
      }

      // Remove sensitive information from details
      if (auditLog.details) {
        auditLog.details = this.sanitizeDetails(auditLog.details)
      }

      const { error } = await supabase.from('audit_logs').insert(auditLog)
      
      if (error) {
        console.error('Audit logging failed:', error)
        // Don't throw error to avoid breaking main functionality
      }
    } catch (error) {
      console.error('Audit logging failed:', error)
      // Don't throw error to avoid breaking main functionality
    }
  },

  /**
   * Get audit logs for a specific resource
   */
  async getResourceHistory(resourceType: string, resourceId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(id, email, full_name)
        `)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }
  },

  /**
   * Get audit logs for a specific user
   */
  async getUserHistory(userId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch user audit logs:', error)
      return []
    }
  },

  /**
   * Get all audit logs (admin only)
   */
  async getAllAuditLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(id, email, full_name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }
  },

  /**
   * Search audit logs
   */
  async searchAuditLogs(query: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(id, email, full_name)
        `)
        .or(`action.ilike.%${query}%,resource_type.ilike.%${query}%,resource_id.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to search audit logs:', error)
      return []
    }
  },

  /**
   * Get client IP address
   */
  async getClientIP(): Promise<string> {
    try {
      // Try multiple IP detection services
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/ip/',
        'https://api.ip.sb/ip'
      ]

      for (const service of services) {
        try {
          const response = await fetch(service, { 
            signal: AbortSignal.timeout(3000) // 3 second timeout
          })
          
          if (response.ok) {
            const data = await response.text()
            const ip = data.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/)?.[0]
            if (ip) return ip
          }
        } catch {
          continue // Try next service
        }
      }

      return 'unknown'
    } catch {
      return 'unknown'
    }
  },

  /**
   * Sanitize sensitive information from audit details
   */
  sanitizeDetails(details: any): any {
    if (typeof details !== 'object' || details === null) {
      return details
    }

    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'api_key', 'private_key', 'session', 'cookie', 'authorization'
    ]

    const sanitized = { ...details }

    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        // Check if value looks like sensitive data
        if (value.length > 20 && /^[A-Za-z0-9+/=]+$/.test(value)) {
          return '[REDACTED]'
        }
        return value
      }
      
      if (typeof value === 'object' && value !== null) {
        return this.sanitizeDetails(value)
      }
      
      return value
    }

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase()
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeValue(sanitized[key])
      }
    }

    return sanitized
  },

  /**
   * Create audit log for content creation
   */
  async logContentCreation(contentId: string, contentType: string, title: string): Promise<void> {
    await this.logAction('CREATE_CONTENT', 'content', contentId, {
      content_type: contentType,
      title,
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Create audit log for content update
   */
  async logContentUpdate(contentId: string, contentType: string, changes: any): Promise<void> {
    await this.logAction('UPDATE_CONTENT', 'content', contentId, {
      content_type: contentType,
      changes,
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Create audit log for content deletion
   */
  async logContentDeletion(contentId: string, contentType: string, title: string): Promise<void> {
    await this.logAction('DELETE_CONTENT', 'content', contentId, {
      content_type: contentType,
      title,
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Create audit log for user action
   */
  async logUserAction(action: string, userId: string, details?: any): Promise<void> {
    await this.logAction(action, 'user', userId, {
      ...details,
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Create audit log for file upload
   */
  async logFileUpload(fileId: string, fileName: string, fileSize: number): Promise<void> {
    await this.logAction('UPLOAD_FILE', 'file', fileId, {
      file_name: fileName,
      file_size: fileSize,
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Create audit log for login attempt
   */
  async logLoginAttempt(email: string, success: boolean, ip?: string): Promise<void> {
    await this.logAction('LOGIN_ATTEMPT', 'auth', email, {
      email,
      success,
      ip_address: ip || await this.getClientIP(),
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Create audit log for permission change
   */
  async logPermissionChange(userId: string, role: string, previousRole?: string): Promise<void> {
    await this.logAction('CHANGE_PERMISSION', 'user', userId, {
      new_role: role,
      previous_role: previousRole,
      timestamp: new Date().toISOString()
    })
  },

  /**
   * Get audit statistics
   */
  async getAuditStats(days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, resource_type, created_at')
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      const stats = {
        total_actions: data?.length || 0,
        actions_by_type: {} as Record<string, number>,
        actions_by_resource: {} as Record<string, number>,
        actions_by_day: {} as Record<string, number>
      }

      data?.forEach(log => {
        // Count by action type
        stats.actions_by_type[log.action] = (stats.actions_by_type[log.action] || 0) + 1
        
        // Count by resource type
        stats.actions_by_resource[log.resource_type] = (stats.actions_by_resource[log.resource_type] || 0) + 1
        
        // Count by day
        const day = new Date(log.created_at).toLocaleDateString()
        stats.actions_by_day[day] = (stats.actions_by_day[day] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Failed to fetch audit stats:', error)
      return null
    }
  }
}

// Audit log middleware for automatic logging
export const withAudit = <T extends any[], R>(
  action: string,
  resourceType: string,
  fn: (...args: T) => Promise<R>,
  getResourceId?: (...args: T) => string,
  getDetails?: (...args: T) => any
) => {
  return async (...args: T): Promise<R> => {
    const resourceId = getResourceId?.(...args) || 'unknown'
    const details = getDetails?.(...args)
    
    try {
      const result = await fn(...args)
      
      // Log successful action
      await auditService.logAction(action, resourceType, resourceId, {
        ...details,
        success: true
      })
      
      return result
    } catch (error) {
      // Log failed action
      await auditService.logAction(action, resourceType, resourceId, {
        ...details,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }
}

export default auditService
