import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      toast.success('Check your email for the login link!')
    } catch (error) {
      toast.error('Failed to sign in')
      console.error(error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
      console.error(error)
    }
  }

  return {
    user,
    loading,
    signIn,
    signOut
  }
} 