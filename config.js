// Supabase Configuration
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
const initSupabase = () => {
    try {
        console.log('Initializing Supabase client...');
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase client library not loaded');
        }
        
        const client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        console.log('Supabase client initialized successfully');
        return client;
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        return null;
    }
};

export { SUPABASE_CONFIG, initSupabase };
