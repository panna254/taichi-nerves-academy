import { useState, useEffect } from 'react'
import { analyticsService, DashboardStats, ContentPerformance, EngagementTimeline, TopicPopularity } from '@/services/analyticsService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Eye, 
  BookOpen, 
  Headphones, 
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topContent, setTopContent] = useState<ContentPerformance[]>([])
  const [engagementData, setEngagementData] = useState<EngagementTimeline[]>([])
  const [topicPopularity, setTopicPopularity] = useState<TopicPopularity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(30) // days

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  async function fetchFallbackStats(): Promise<DashboardStats> {
    try {
      // Use the existing analytics service which has fallback logic
      return await analyticsService.getDashboardStats()
    } catch (error) {
      console.error('Fallback stats failed:', error)
      // Return minimal safe defaults
      return {
        content: {
          total_videos: 0,
          published_videos: 0,
          total_notes: 0,
          published_notes: 0,
          total_podcasts: 0,
          published_podcasts: 0,
          total_quizzes: 0,
          published_quizzes: 0,
        },
        users: {
          total: 0,
          active_subscribers: 0,
          new_today: 0,
          new_this_week: 0,
          new_this_month: 0,
        },
        engagement: {
          views_today: 0,
          views_this_week: 0,
          views_this_month: 0,
          avg_session_duration: 0,
        },
        topics: {
          total: 0,
        }
      }
    }
  }

  async function fetchAllData() {
    setLoading(true)
    setError(null)

    try {
      // Fetch dashboard stats with explicit error handling
      let statsData
      try {
        statsData = await analyticsService.getDashboardStats()
      } catch (statsError) {
        console.error('Stats fetch error:', statsError)
        statsData = await fetchFallbackStats()
      }

      setStats(statsData)

      // Fetch engagement data separately — don't let it crash the whole page
      try {
        const engagement = await analyticsService.getEngagementTimeline(timeRange)
        setEngagementData(engagement || [])
      } catch (e) {
        console.warn('Engagement timeline unavailable:', e)
        setEngagementData([])
      }

      // Fetch top content separately
      try {
        const videoPerf = await analyticsService.getContentPerformance('video', 5)
        setTopContent(videoPerf || [])
      } catch (e) {
        console.warn('Content performance unavailable:', e)
        setTopContent([])
      }

      // Fetch topic popularity separately
      try {
        const topics = await analyticsService.getTopicPopularity()
        setTopicPopularity(topics?.slice(0, 5) || [])
      } catch (e) {
        console.warn('Topic popularity unavailable:', e)
        setTopicPopularity([])
      }

    } catch (err: any) {
      console.error('Fatal analytics error:', err)
      setError(err?.message || 'An unexpected error occurred loading analytics.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold text-lg mb-2">
            Failed to load analytics
          </h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
        <p className="text-gray-500">No data available yet.</p>
      </div>
    )
  }

  const totalContent = (stats?.content?.total_videos || 0) + (stats?.content?.total_notes || 0) + (stats?.content?.total_podcasts || 0) + (stats?.content?.total_quizzes || 0)
  const publishedContent = (stats?.content?.published_videos || 0) + (stats?.content?.published_notes || 0) + (stats?.content?.published_podcasts || 0) + (stats?.content?.published_quizzes || 0)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your platform performance and user engagement</p>
        </div>
        
        {/* Time range selector */}
        <div className="flex space-x-2">
          {[7, 30, 90].map(days => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              onClick={() => setTimeRange(days)}
              size="sm"
            >
              Last {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          change={`+${stats?.users?.new_this_week || 0} this week`}
          icon={<Users className="h-8 w-8" />}
          trend="up"
        />
        <StatCard
          title="Active Subscribers"
          value={stats?.users?.active_subscribers || 0}
          percentage={`${(stats?.users?.total > 0
            ? (stats?.users?.active_subscribers / stats?.users?.total * 100)
            : 0
          ).toFixed(1)}%`}
          icon={<TrendingUp className="h-8 w-8" />}
          trend="up"
        />
        <StatCard
          title="Total Content"
          value={totalContent}
          change={`${publishedContent} published`}
          icon={<BookOpen className="h-8 w-8" />}
          trend="up"
        />
        <StatCard
          title="Total Views"
          value={stats?.engagement?.views_this_month || 0}
          change={`${stats?.engagement?.views_today || 0} today`}
          icon={<Eye className="h-8 w-8" />}
          trend="up"
        />
      </div>

      {/* Content distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Content Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Videos', value: stats?.content?.total_videos || 0 },
                    { name: 'Notes', value: stats?.content?.total_notes || 0 },
                    { name: 'Podcasts', value: stats?.content?.total_podcasts || 0 },
                    { name: 'Quizzes', value: stats?.content?.total_quizzes || 0 }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Published vs Draft */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Published vs Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { 
                    name: 'Videos',
                    Published: stats?.content?.published_videos || 0,
                    Draft: (stats?.content?.total_videos || 0) - (stats?.content?.published_videos || 0)
                  },
                  {
                    name: 'Notes',
                    Published: stats?.content?.published_notes || 0,
                    Draft: (stats?.content?.total_notes || 0) - (stats?.content?.published_notes || 0)
                  },
                  {
                    name: 'Podcasts',
                    Published: stats?.content?.published_podcasts || 0,
                    Draft: (stats?.content?.total_podcasts || 0) - (stats?.content?.published_podcasts || 0)
                  },
                  {
                    name: 'Quizzes',
                    Published: stats?.content?.published_quizzes || 0,
                    Draft: (stats?.content?.total_quizzes || 0) - (stats?.content?.published_quizzes || 0)
                  }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Published" fill="#10b981" />
                <Bar dataKey="Draft" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Engagement Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {engagementData && engagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData.slice(0, 10).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    const label = name === 'views' ? 'Views' : name === 'unique_users' ? 'Unique Users' : 'Completions'
                    return [value, label]
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Views" strokeWidth={2} />
                <Line type="monotone" dataKey="unique_users" stroke="#10b981" name="Unique Users" strokeWidth={2} />
                <Line type="monotone" dataKey="completions" stroke="#f59e0b" name="Completions" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">No engagement data for this period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top performing content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topContent && topContent.length > 0 ? (
              <div className="space-y-4">
                {topContent.map((item, index) => (
                  <div key={item.content_id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Last viewed: {new Date(item.last_viewed).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.views}</div>
                      <div className="text-xs text-muted-foreground">{item.completions} completions</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-400">No content performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Most Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topicPopularity && topicPopularity.length > 0 ? (
              <div className="space-y-3">
                {topicPopularity.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{topic.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(topic.count / Math.max(...topicPopularity.map(t => t.count)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{topic.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-400">No topic data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  change?: string
  percentage?: string
  icon: React.ReactNode
  trend: 'up' | 'down'
}

function StatCard({ title, value, change, percentage, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            {change && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {change}
              </p>
            )}
            {percentage && (
              <p className="text-sm text-green-600 mt-1">{percentage}</p>
            )}
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
