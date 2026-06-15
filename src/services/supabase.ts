import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[BarangayHub] Missing Supabase environment variables.\n' +
      'Create a .env.local file with:\n' +
      '  VITE_SUPABASE_URL=your_supabase_url\n' +
      '  VITE_SUPABASE_ANON_KEY=your_anon_key'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
);
