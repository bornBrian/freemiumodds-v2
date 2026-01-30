import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found. Using mock data.')
  console.warn('     SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.warn('     SUPABASE_KEY:', supabaseKey ? 'Set' : 'Missing')
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Helper: Check if Supabase is configured
export const isSupabaseConfigured = () => supabase !== null
