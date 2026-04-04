import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeContent(contentType: string, onUpdate: () => void) {
  useEffect(() => {
    // Map content types to table names
    const tableName = {
      video: 'content',
      note: 'content', 
      podcast: 'content',
      quiz: 'content',
      article: 'content'
    }[contentType] || 'content'

    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: tableName,
          filter: `content_type=eq.${contentType}`
        },
        (payload) => {
          console.log('Content updated:', payload)
          
          // Only trigger update for published content changes
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new?.status
            const oldStatus = payload.old?.status
            
            // Trigger update if status changed to/from published
            if (newStatus === 'published' || oldStatus === 'published') {
              onUpdate()
            }
          } else if (payload.eventType === 'INSERT') {
            // Trigger update for new published content
            if (payload.new?.status === 'published') {
              onUpdate()
            }
          } else if (payload.eventType === 'DELETE') {
            // Trigger update for deleted content
            onUpdate()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contentType, onUpdate])
}

export function useRealtimeTopics(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('topics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'topics'
        },
        (payload) => {
          console.log('Topics updated:', payload)
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onUpdate])
}

export function useRealtimeUserRoles(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('admin_user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_user_roles'
        },
        (payload) => {
          console.log('User roles updated:', payload)
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onUpdate])
}
