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
  const { user, setUser, setLoading, setError, setSuccessMessage } = useStore()
  const [loading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      setAuthLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
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
      setAuthLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
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
      
      const { data, error } = await supabase.auth.signUp({
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
      const { error } = await supabase.auth.signOut()
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
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
      {!loading && children}
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