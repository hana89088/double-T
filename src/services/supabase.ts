import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const canInitSupabase = Boolean(supabaseUrl) && Boolean(supabaseAnonKey)
export const supabase = canInitSupabase ? createClient(supabaseUrl, supabaseAnonKey) : undefined as unknown as ReturnType<typeof createClient>

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
