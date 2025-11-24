import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qthrdhiccyapbvfrwczd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aHJkaGljY3lhcGJ2ZnJ3Y3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Nzc4NTIsImV4cCI6MjA3OTU1Mzg1Mn0.iX5Gndn7owBt_Pw13wfnMQzJ9-h-cJ33D8uceoHhkT8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)