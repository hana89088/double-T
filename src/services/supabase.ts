import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey)
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)
  : undefined

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          plan: 'basic' | 'premium' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          plan?: 'basic' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          plan?: 'basic' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      datasets: {
        Row: {
          id: string
          user_id: string
          name: string
          format: 'csv' | 'excel' | 'text'
          schema: Json | null
          row_count: number
          preview: Json | null
          file_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          format: 'csv' | 'excel' | 'text'
          schema?: Json | null
          row_count?: number
          preview?: Json | null
          file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          format?: 'csv' | 'excel' | 'text'
          schema?: Json | null
          row_count?: number
          preview?: Json | null
          file_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          dataset_id: string
          user_id: string
          type: string
          parameters: Json | null
          results: Json | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dataset_id: string
          user_id: string
          type: string
          parameters?: Json | null
          results?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dataset_id?: string
          user_id?: string
          type?: string
          parameters?: Json | null
          results?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visualizations: {
        Row: {
          id: string
          analysis_id: string
          chart_type: string
          configuration: Json | null
          data: Json | null
          embed_url: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          chart_type: string
          configuration?: Json | null
          data?: Json | null
          embed_url?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          chart_type?: string
          configuration?: Json | null
          data?: Json | null
          embed_url?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          analysis_id: string
          title: string
          insights: Json | null
          recommendations: Json | null
          export_format: string
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          title: string
          insights?: Json | null
          recommendations?: Json | null
          export_format: string
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          title?: string
          insights?: Json | null
          recommendations?: Json | null
          export_format?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export async function fetchDashboardMetrics() {
  if (!isSupabaseConfigured) {
    return {
      datasets: [],
      analyses: [],
      visualizations: [],
      reports: [],
    }
  }
  try {
    const [ds, an, vz, rp] = await Promise.all([
      (supabase as any).from('datasets').select('id,created_at').order('created_at', { ascending: true }),
      (supabase as any).from('analyses').select('id,created_at').order('created_at', { ascending: true }),
      (supabase as any).from('visualizations').select('id,created_at').order('created_at', { ascending: true }),
      (supabase as any).from('reports').select('id,created_at').order('created_at', { ascending: true }),
    ])
    return {
      datasets: ds.data || [],
      analyses: an.data || [],
      visualizations: vz.data || [],
      reports: rp.data || [],
    }
  } catch (error) {
    console.error('fetchDashboardMetrics error', error)
    return {
      datasets: [],
      analyses: [],
      visualizations: [],
      reports: [],
      error: error instanceof Error ? error.message : 'unknown-error',
    }
  }
}

export function subscribeToMetrics(onChange: () => void) {
  if (!isSupabaseConfigured) return () => {}
  // subscribe to inserts/updates/deletes on key tables
  const channel = (supabase as any).channel('metrics-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'datasets' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'analyses' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'visualizations' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, onChange)
    .subscribe()
  return () => { try { (supabase as any).removeChannel(channel) } catch {} }
}
