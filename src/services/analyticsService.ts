import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  content: {
    total_videos: number
    published_videos: number
    total_notes: number
    published_notes: number
    total_podcasts: number
    published_podcasts: number
    total_quizzes: number
    published_quizzes: number
  }
  users: {
    total: number
    active_subscribers: number
    new_today: number
    new_this_week: number
    new_this_month: number
  }
  engagement: {
    views_today: number
    views_this_week: number
    views_this_month: number
    avg_session_duration: number
  }
  topics: {
    total: number
  }
}

export interface ContentPerformance {
  content_id: string
  title: string
  views: number
  completions: number
  avg_duration: number
  last_viewed: string
}

export interface EngagementTimeline {
  date: string
  views: number
  unique_users: number
  completions: number
}

export interface TopicPopularity {
  name: string
  count: number
}

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Since we don't have the SQL functions yet, let's use direct queries
      const [
        contentStats,
        userStats,
        engagementStats,
        topicStats
      ] = await Promise.all([
        // Content stats
        supabase
          .from('content')
          .select('content_type, status')
          .eq('deleted_at', null),
        
        // User stats
        supabase
          .from('users')
          .select('created_at'),
        
        // Engagement stats (mock for now - will need analytics table)
        supabase
          .from('content')
          .select('created_at, view_count')
          .eq('status', 'published')
          .limit(100),
        
        // Topic stats
        supabase
          .from('topics')
          .select('id')
      ])

      // Process content stats
      const content = contentStats.data || []
      const contentStatsProcessed = {
        total_videos: content.filter(c => c.content_type === 'video').length,
        published_videos: content.filter(c => c.content_type === 'video' && c.status === 'published').length,
        total_notes: content.filter(c => c.content_type === 'note').length,
        published_notes: content.filter(c => c.content_type === 'note' && c.status === 'published').length,
        total_podcasts: content.filter(c => c.content_type === 'podcast').length,
        published_podcasts: content.filter(c => c.content_type === 'podcast' && c.status === 'published').length,
        total_quizzes: content.filter(c => c.content_type === 'quiz').length,
        published_quizzes: content.filter(c => c.content_type === 'quiz' && c.status === 'published').length,
      }

      // Process user stats
      const users = userStats.data || []
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const userStatsProcessed = {
        total: users.length,
        active_subscribers: users.length, // Mock - would need subscriptions table
        new_today: users.filter(u => new Date(u.created_at) >= today).length,
        new_this_week: users.filter(u => new Date(u.created_at) >= weekAgo).length,
        new_this_month: users.filter(u => new Date(u.created_at) >= monthAgo).length,
      }

      // Process engagement stats (mock data)
      const engagement = engagementStats.data || []
      const engagementStatsProcessed = {
        views_today: Math.floor(Math.random() * 100) + 50,
        views_this_week: Math.floor(Math.random() * 500) + 200,
        views_this_month: Math.floor(Math.random() * 2000) + 800,
        avg_session_duration: 180, // Mock: 3 minutes
      }

      // Process topic stats
      const topics = topicStats.data || []
      const topicStatsProcessed = {
        total: topics.length,
      }

      return {
        content: contentStatsProcessed,
        users: userStatsProcessed,
        engagement: engagementStatsProcessed,
        topics: topicStatsProcessed,
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      throw error
    }
  },

  async getContentPerformance(contentType: string, limit = 10): Promise<ContentPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('id, title, view_count, created_at, status')
        .eq('content_type', contentType)
        .eq('status', 'published')
        .eq('deleted_at', null)
        .order('view_count', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(item => ({
        content_id: item.id,
        title: item.title,
        views: item.view_count || 0,
        completions: Math.floor((item.view_count || 0) * 0.7), // Mock completion rate
        avg_duration: 180, // Mock: 3 minutes
        last_viewed: item.created_at,
      }))
    } catch (error) {
      console.error('Failed to fetch content performance:', error)
      throw error
    }
  },

  async getEngagementTimeline(days = 30): Promise<EngagementTimeline[]> {
    try {
      // Generate mock timeline data for now
      const timeline: EngagementTimeline[] = []
      const now = new Date()
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const baseViews = Math.floor(Math.random() * 50) + 20
        const baseUsers = Math.floor(Math.random() * 20) + 10
        
        timeline.push({
          date: date.toISOString().split('T')[0],
          views: baseViews + Math.floor(Math.random() * 30),
          unique_users: baseUsers + Math.floor(Math.random() * 15),
          completions: Math.floor(baseViews * 0.6) + Math.floor(Math.random() * 10),
        })
      }
      
      return timeline
    } catch (error) {
      console.error('Failed to fetch engagement timeline:', error)
      throw error
    }
  },

  async getTopicPopularity(limit = 10): Promise<TopicPopularity[]> {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('topics(name)')
        .eq('status', 'published')
        .eq('deleted_at', null)
        .limit(100)

      if (error) throw error

      // Count topics
      const topicCounts: { [key: string]: number } = {}
      data?.forEach(item => {
        if (item.topics && Array.isArray(item.topics)) {
          item.topics.forEach((topic: any) => {
            const name = topic.name || 'Unknown'
            topicCounts[name] = (topicCounts[name] || 0) + 1
          })
        }
      })

      return Object.entries(topicCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch topic popularity:', error)
      throw error
    }
  },

  async trackContentView(userId: string, contentType: string, contentId: string) {
    try {
      // First get current view count
      const { data: currentData } = await supabase
        .from('content')
        .select('view_count')
        .eq('id', contentId)
        .single()

      // Then increment it
      const currentViews = currentData?.view_count || 0
      const { error } = await supabase
        .from('content')
        .update({ 
          view_count: currentViews + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)

      if (error) console.error('Failed to track view:', error)
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  },

  async trackContentCompletion(userId: string, contentType: string, contentId: string, durationSeconds: number) {
    try {
      // This would need an analytics table
      console.log('Content completion tracked:', { userId, contentType, contentId, durationSeconds })
    } catch (error) {
      console.error('Failed to track completion:', error)
    }
  }
}
