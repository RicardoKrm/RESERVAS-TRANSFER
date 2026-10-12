import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://yygddgcdynrjqzkfqwzs.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_KTGer1S7sB0gGTcFs5KacQ_UFKUIH6d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
