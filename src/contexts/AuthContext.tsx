import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { User } from '../types'
import { useStore } from '../stores/appStore'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setUser, setLoading, setError, setSuccessMessage } = useStore()
  const [isAuthInitializing, setAuthInitializing] = useState(true)
  const isSupabaseConfigured = Boolean((supabase as any)) && Boolean((supabase as any).auth)

  const loading = isAuthInitializing || isLoading

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthInitializing(false)
      return
    }

    checkUser()

    const { data: authListener } = (supabase as any).auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          plan: session.user.user_metadata?.plan || 'basic',
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setAuthInitializing(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      if (!isSupabaseConfigured) return
      const { data: { session } } = await (supabase as any).auth.getSession()
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
          plan: session.user.user_metadata?.plan || 'basic',
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at
        }
        setUser(userData)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setAuthInitializing(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      if (!isSupabaseConfigured) {
        setError('Supabase chưa được cấu hình ở môi trường dev')
        return
      }
      const { data, error } = await (supabase as any).auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email!,
          plan: data.user.user_metadata?.plan || 'basic',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at
        }
        setUser(userData)
        setSuccessMessage('Successfully signed in!')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      setError(null)
      
      if (!isSupabaseConfigured) {
        setError('Supabase chưa được cấu hình ở môi trường dev')
        return
      }
      const { data, error } = await (supabase as any).auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            plan: 'basic'
          }
        }
      })

      if (error) throw error

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || name,
          plan: 'basic',
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at
        }
        setUser(userData)
        setSuccessMessage('Account created successfully! Please check your email to verify your account.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      if (!isSupabaseConfigured) {
        setError('Supabase chưa được cấu hình ở môi trường dev')
        return
      }
      const { error } = await (supabase as any).auth.signOut()
      if (error) throw error
      setUser(null)
      setSuccessMessage('Successfully signed out!')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign out')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      
      if (!isSupabaseConfigured) {
        setError('Supabase chưa được cấu hình ở môi trường dev')
        return
      }
      const { error } = await (supabase as any).auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      setSuccessMessage('Password reset instructions have been sent to your email!')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during password reset')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {!isAuthInitializing && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
