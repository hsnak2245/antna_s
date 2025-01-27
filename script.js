// Initialize Supabase client
const supabaseUrl = 'https://phituvbneyyjtixweeqq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXR1dmJuZXl5anRpeHdlZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5ODU5NDEsImV4cCI6MjA1MzU2MTk0MX0.wTrrg3pz0Rl-L4t7pyJuva5q4VPdnvX1rBMP-xpnKpU'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// DOM Elements
const alertsContainer = document.querySelector('.alerts-container');
const centersGrid = document.querySelector('.centers-grid');
const updatesContainer = document.querySelector('.updates-container');

// Fetch Data Functions
async function fetchAlerts() {
    try {
        const { data: alerts, error } = await supabase
            .from('alerts')
            .select('id, type, severity, location, description, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.severity.toLowerCase()}" data-id="${alert.id}">
                <h3>${alert.type}</h3>
                <p>📍 Location: ${alert.location}</p>
                <p>⚠️ Severity: ${alert.severity}</p>
                <p>🕒 Time: ${new Date(alert.created_at).toLocaleString()}</p>
                <p>${alert.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching alerts:', error);
        alertsContainer.innerHTML = '<p>Error loading alerts</p>';
    }
}

async function fetchCentersWithSupplies() {
    try {
        // Fetch centers
        const { data: centers, error: centersError } = await supabase
            .from('centers')
            .select('*');

        if (centersError) throw centersError;

        // Fetch supplies for each center
        const centersWithSupplies = await Promise.all(centers.map(async (center) => {
            const { data: supplies, error: suppliesError } = await supabase
                .from('supplies')
                .select('*')
                .eq('center_id', center.id)
                .single();

            if (suppliesError) throw suppliesError;

            return { ...center, supplies };
        }));

        centersGrid.innerHTML = centersWithSupplies.map(center => `
            <div class="center-card" data-id="${center.id}">
                <h3>${center.name}</h3>
                <p>Type: ${center.type}</p>
                <p>Capacity: ${center.current_occupancy}/${center.capacity}</p>
                <p>Contact: ${center.contact || 'N/A'}</p>
                <div class="supplies">
                    <p>💧 Water: ${center.supplies?.water_supply || 0} units</p>
                    <p>🍲 Food: ${center.supplies?.food_supply || 0} units</p>
                    <p>🏥 Medical: ${center.supplies?.medical_kits || 0} kits</p>
                </div>
                ${center.lat && center.lon ? 
                    `<p>📍 Location: ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}</p>` 
                    : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching centers:', error);
        centersGrid.innerHTML = '<p>Error loading centers</p>';
    }
}

async function fetchUpdates() {
    try {
        const { data: updates, error } = await supabase
            .from('updates')
            .select('id, source, message, verified, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        updatesContainer.innerHTML = updates.map(update => `
            <div class="update" data-id="${update.id}">
                <div class="update-header">
                    <strong>${update.source}</strong>
                    ${update.verified ? '<span class="verified-badge">✓</span>' : ''}
                </div>
                <p>${update.message}</p>
                <small>${new Date(update.created_at).toLocaleString()}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching updates:', error);
        updatesContainer.innerHTML = '<p>Error loading updates</p>';
    }
}

// Real-time subscriptions
function setupRealTimeSubscriptions() {
    const channels = supabase.channel('public:all-changes');

    channels
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'alerts' },
            (payload) => {
                console.log('Alert change received:', payload);
                fetchAlerts();
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'centers' },
            (payload) => {
                console.log('Center change received:', payload);
                fetchCentersWithSupplies();
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'supplies' },
            (payload) => {
                console.log('Supplies change received:', payload);
                fetchCentersWithSupplies();
            }
        )
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'updates' },
            (payload) => {
                console.log('Update change received:', payload);
                fetchUpdates();
            }
        )
        .subscribe();
}

// Initialize
async function init() {
    try {
        // Initial data fetch
        await Promise.all([
            fetchAlerts(),
            fetchCentersWithSupplies(),
            fetchUpdates()
        ]);

        // Setup real-time subscriptions
        setupRealTimeSubscriptions();

    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Error Handler
function handleError(error) {
    console.error('Error:', error.message);
    if (error.code === 'PGRST301') {
        // Handle authentication errors
        console.log('Authentication required');
    }
}
