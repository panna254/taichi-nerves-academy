import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Membership {
  id: string
  user_id: string
  plan: 'monthly' | 'quarterly' | 'annual'
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  payment_method: 'mpesa' | 'paypal' | 'card'
  started_at: string
  expires_at: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}

interface PaymentTransaction {
  id: string
  user_id: string
  membership_id: string
  payment_method: 'mpesa' | 'paypal' | 'card'
  provider_transaction_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  provider_response: any
  ip_address: string
  created_at: string
  updated_at: string
}

export const useMembership = () => {
  const [membership, setMembership] = useState<Membership | null>(null)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchMembership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMembership(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      setMembership(data)
    } catch (err) {
      console.error('Error fetching membership:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch membership')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setTransactions([])
        return
      }

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setTransactions(data || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    }
  }

  const refreshMembership = async () => {
    setLoading(true)
    await Promise.all([fetchMembership(), fetchTransactions()])
  }

  const isMembershipActive = () => {
    if (!membership) return false
    return membership.status === 'active' && new Date(membership.expires_at) > new Date()
  }

  const getDaysUntilExpiration = () => {
    if (!membership || !isMembershipActive()) return 0
    const expiresAt = new Date(membership.expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getPlanPrice = (plan: 'monthly' | 'quarterly' | 'annual') => {
    const prices = {
      monthly: 1500,
      quarterly: 4000,
      annual: 14000,
    }
    return prices[plan]
  }

  const getPlanDuration = (plan: 'monthly' | 'quarterly' | 'annual') => {
    const durations = {
      monthly: 30,
      quarterly: 90,
      annual: 365,
    }
    return durations[plan]
  }

  useEffect(() => {
    refreshMembership()
  }, [])

  return {
    membership,
    transactions,
    loading,
    error,
    refreshMembership,
    isMembershipActive,
    getDaysUntilExpiration,
    getPlanPrice,
    getPlanDuration,
  }
}
