import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Creating Supabase client with:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    key: supabaseKey ? 'SET' : 'MISSING',
    urlValue: supabaseUrl,
    keyPrefix: supabaseKey?.substring(0, 20)
  })

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
