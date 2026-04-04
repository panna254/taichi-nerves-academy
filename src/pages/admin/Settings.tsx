import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Settings() {
  const { user } = useAdminAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [user, updateTrigger])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Get user details from users table using clerk_user_id
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('clerk_user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        // Fallback to auth user data
        setFullName(user.email?.split('@')[0] || '')
        setEmail(user.email || '')
      } else {
        setFullName(data.full_name || user.email?.split('@')[0] || '')
        setEmail(data.email || user.email || '')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setFullName(user.email?.split('@')[0] || '')
      setEmail(user.email || '')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update user in database
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('clerk_user_id', user.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
      
      // Trigger storage event to notify other components (like AdminTopbar)
      localStorage.setItem('userProfileUpdated', Date.now().toString())
      setTimeout(() => {
        localStorage.removeItem('userProfileUpdated')
      }, 100)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile')
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMessage('')
      }, 5000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="bg-white rounded-lg shadow max-w-2xl">
            <div className="p-6 border-b">
              <div className="h-6 bg-muted rounded w-32"></div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow max-w-2xl">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed here. Contact administrator if you need to update your email.
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('success') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
