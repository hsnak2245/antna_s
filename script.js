import { SUPABASE_CONFIG, initSupabase } from './config.js';

// Initialize Supabase client
const supabase = initSupabase();

// Utility Functions
const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(dateString));
};

const setLoading = (element, isLoading) => {
    if (isLoading) {
        element.classList.add('loading');
    } else {
        element.classList.remove('loading');
    }
};

// Data Fetching Functions
async function fetchAlerts() {
    const alertsContainer = document.querySelector('.alerts-container');
    setLoading(alertsContainer, true);

    try {
        const { data: alerts, error } = await supabase
            .from(SUPABASE_CONFIG.tables.alerts)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

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
        console.error('Error fetching alerts:', error);
        alertsContainer.innerHTML = `
            <div class="alert high glass">
                <h3>Error</h3>
                <p>Failed to load alerts. Please try again later.</p>
            </div>
        `;
    } finally {
        setLoading(alertsContainer, false);
    }
}

async function fetchCentersWithSupplies() {
    const centersGrid = document.querySelector('.centers-grid');
    setLoading(centersGrid, true);

    try {
        const { data: centers, error: centersError } = await supabase
            .from(SUPABASE_CONFIG.tables.centers)
            .select(`
                *,
                supplies:${SUPABASE_CONFIG.tables.supplies}(*)
            `);

        if (centersError) throw centersError;

        if (!centers || centers.length === 0) {
            centersGrid.innerHTML = `
                <div class="center-card glass">
                    <h3>No Centers Available</h3>
                    <p>No emergency centers are currently registered in the system.</p>
                </div>
            `;
            return;
        }

        centersGrid.innerHTML = centers.map(center => `
            <div class="center-card glass" data-id="${center.id}">
                <div class="status-indicator ${center.status}"></div>
                <h3>${center.name}</h3>
                <p>Type: ${center.type}</p>
                <p>Capacity: ${center.current_occupancy}/${center.capacity}</p>
                <p>Contact: ${center.contact || 'N/A'}</p>
                
                <div class="supplies">
                    <p>💧 Water: ${center.supplies?.[0]?.water_supply || 0} units</p>
                    <p>🍲 Food: ${center.supplies?.[0]?.food_supply || 0} units</p>
                    <p>🏥 Medical: ${center.supplies?.[0]?.medical_kits || 0} kits</p>
                </div>
                
                ${center.lat && center.lon ? 
                    `<p>📍 Location: ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}</p>` 
                    : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching centers:', error);
        centersGrid.innerHTML = `
            <div class="center-card glass">
                <h3>Error</h3>
                <p>Failed to load centers. Please try again later.</p>
            </div>
        `;
    } finally {
        setLoading(centersGrid, false);
    }
}

async function fetchUpdates() {
    const updatesContainer = document.querySelector('.updates-container');
    setLoading(updatesContainer, true);

    try {
        const { data: updates, error } = await supabase
            .from(SUPABASE_CONFIG.tables.updates)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!updates || updates.length === 0) {
            updatesContainer.innerHTML = `
                <div class="update glass">
                    <h3>No Updates</h3>
                    <p>No recent updates are available.</p>
                </div>
            `;
            return;
        }

        updatesContainer.innerHTML = updates.map(update => `
            <div class="update glass" data-id="${update.id}">
                <div class="update-header">
                    <strong>${update.source}</strong>
                    ${update.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                </div>
                <p>${update.message}</p>
                <small>🕒 ${formatDate(update.created_at)}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching updates:', error);
        updatesContainer.innerHTML = `
            <div class="update glass">
                <h3>Error</h3>
                <p>Failed to load updates. Please try again later.</p>
            </div>
        `;
    } finally {
        setLoading(updatesContainer, false);
    }
}

// Setup real-time updates
function setupRealTimeSubscriptions() {
    const channels = supabase.channel('public:all-changes');
    
    channels
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: SUPABASE_CONFIG.tables.alerts },
            (payload) => {
                console.log('Alert change received:', payload);
                fetchAlerts();
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: SUPABASE_CONFIG.tables.centers },
            (payload) => {
                console.log('Center change received:', payload);
                fetchCentersWithSupplies();
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: SUPABASE_CONFIG.tables.supplies },
            (payload) => {
                console.log('Supplies change received:', payload);
                fetchCentersWithSupplies();
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: SUPABASE_CONFIG.tables.updates },
            (payload) => {
                console.log('Update change received:', payload);
                fetchUpdates();
            }
        )
        .subscribe((status) => {
            console.log('Subscription status:', status);
        });

    return channels;
}

// Initialize the application
async function initializeApp() {
    console.log('Initializing application...');
    try {
        if (!supabase) {
            throw new Error('Supabase client not initialized');
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
        const subscription = setupRealTimeSubscriptions();

        // Cleanup on page unload
        window.addEventListener('unload', () => {
            subscription.unsubscribe();
        });

    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        // Hide loading state
        document.querySelectorAll('.section').forEach(section => {
            setLoading(section, false);
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible
        Promise.all([
            fetchAlerts(),
            fetchCentersWithSupplies(),
            fetchUpdates()
        ]).catch(console.error);
    }
});
