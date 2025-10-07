import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This client lets the rest of the app talk to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
