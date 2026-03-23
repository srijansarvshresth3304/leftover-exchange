import { createClient } from '@supabase/supabase-js';

// Ye do cheezein hum abhi Supabase Dashboard se uthayenge
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);