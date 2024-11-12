import { supabase } from '@/lib/supabaseClient'

export class AuthService {
  async signIn(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  async verifyOTP(email: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('OTP verification failed:', error)
      throw error
    }
  }
} 