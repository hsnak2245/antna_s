// config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm'

const SUPABASE_CONFIG = {
    url: 'https://phituvbneyyjtixweeqq.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXR1dmJuZXl5anRpeHdlZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5ODU5NDEsImV4cCI6MjA1MzU2MTk0MX0.wTrrg3pz0Rl-L4t7pyJuva5q4VPdnvX1rBMP-xpnKpU',
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
