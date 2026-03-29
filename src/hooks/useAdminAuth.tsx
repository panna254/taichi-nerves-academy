import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type AdminRole = "admin" | "editor" | "reviewer"

interface AdminUser extends User {
  adminRole?: AdminRole
  permissions?: string[]
}

interface AdminAuthContextValue {
  user: AdminUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: adminRole } = await supabase
            .from('admin_user_roles')
            .select('role, permissions')
            .eq('user_id', session.user.id)
            .single()

          if (adminRole) {
            setUser({
              ...session.user,
              adminRole: adminRole.role,
              permissions: adminRole.permissions || [],
            })
            setToken(session.access_token)
          } else {
            setUser(null)
            setToken(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: adminRole } = await supabase
            .from('admin_user_roles')
            .select('role, permissions')
            .eq('user_id', session.user.id)
            .single()

          if (adminRole) {
            setUser({
              ...session.user,
              adminRole: adminRole.role,
              permissions: adminRole.permissions || [],
            })
            setToken(session.access_token)
          } else {
            setUser(null)
            setToken(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setToken(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        const { data: adminRole } = await supabase
          .from('admin_user_roles')
          .select('role, permissions')
          .eq('user_id', data.user.id)
          .single()

        if (!adminRole) {
          await supabase.auth.signOut()
          return { success: false, error: 'Access denied: Admin privileges required' }
        }

        setUser({
          ...data.user,
          adminRole: adminRole.role,
          permissions: adminRole.permissions || [],
        })
        setToken(data.session?.access_token || null)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
  }

  const hasPermission = (permission: string): boolean => {
    return user?.adminRole === 'admin' || 
           (user?.permissions?.includes(permission) ?? false)
  }

  const value = useMemo(() => ({
    user, token, loading, login, logout, hasPermission
  }), [user, token, loading])

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return ctx
}



