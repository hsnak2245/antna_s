// config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm'

const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
    tables: {
        alerts: 'alerts',
        centers: 'centers',
        supplies: 'supplies',
        updates: 'updates'
    }
};

// Initialize Supabase Client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

export { SUPABASE_CONFIG, supabase };
