// config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm'

const getEnvVars = () => {
    const body = document.querySelector('body');
    return {
        supabaseUrl: body.dataset.supabaseUrl,
        supabaseKey: body.dataset.supabaseKey
    };
};

const env = getEnvVars();

const SUPABASE_CONFIG = {
    url: env.supabaseUrl,
    key: env.supabaseKey,
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
