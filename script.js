import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://phituvbneyyjtixweeqq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXR1dmJuZXl5anRpeHdlZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5ODU5NDEsImV4cCI6MjA1MzU2MTk0MX0.wTrrg3pz0Rl-L4t7pyJuva5q4VPdnvX1rBMP-xpnKpU')

async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('count');
        
        if (error) {
            console.error('Supabase connection test failed:', error);
            return false;
        }
        
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase connection test error:', error);
        return false;
    }
}

// Modified fetchAlerts function with better error handling
async function fetchAlerts() {
    const alertsContainer = document.querySelector('.alerts-container');
    setLoading(alertsContainer, true);

    try {
        // Check if supabase is initialized
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        console.log('Fetching alerts...');
        const { data: alerts, error } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }

        console.log('Alerts data:', alerts);

        if (!alerts || alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="alert glass">
                    <h3>No Active Alerts</h3>
                    <p>There are currently no active alerts in your area.</p>
                </div>
            `;
            return;
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.severity.toLowerCase()} glass" data-id="${alert.id}">
                <h3>${alert.type}</h3>
                <p>📍 ${alert.location}</p>
                <p>⚠️ ${alert.severity}</p>
                <p>🕒 ${formatDate(alert.created_at)}</p>
                <p>${alert.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        
        alertsContainer.innerHTML = `
            <div class="alert high glass">
                <h3>Error</h3>
                <p>Failed to load alerts: ${error.message || 'Unknown error'}</p>
                ${error.hint ? `<p>Hint: ${error.hint}</p>` : ''}
            </div>
        `;
    } finally {
        setLoading(alertsContainer, false);
    }
}

// Modified initialization function
async function initializeApp() {
    console.log('Initializing application...');
    try {
        // Test Supabase connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
            throw new Error('Failed to connect to Supabase');
        }

        // Show loading state
        document.querySelectorAll('.section').forEach(section => {
            setLoading(section, true);
        });

        // Fetch initial data
        await Promise.all([
            fetchAlerts(),
            fetchCentersWithSupplies(),
            fetchUpdates()
        ]);

        // Setup real-time subscriptions
        setupRealTimeSubscriptions();

    } catch (error) {
        console.error('Initialization error:', error);
        document.querySelectorAll('.section').forEach(section => {
            section.innerHTML = `
                <div class="error glass">
                    <h3>Connection Error</h3>
                    <p>${error.message}</p>
                </div>
            `;
        });
    } finally {
        document.querySelectorAll('.section').forEach(section => {
            setLoading(section, false);
        });
    }
}
