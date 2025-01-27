// Initialize Supabase client
const supabaseUrl = 'https://phituvbneyyjtixweeqq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXR1dmJuZXl5anRpeHdlZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5ODU5NDEsImV4cCI6MjA1MzU2MTk0MX0.wTrrg3pz0Rl-L4t7pyJuva5q4VPdnvX1rBMP-xpnKpU'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// Fetch Data Functions
async function fetchAlerts() {
    try {
        const { data: alerts, error } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.severity}">
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

async function fetchCenters() {
    try {
        const { data: centers, error } = await supabase
            .from('centers')
            .select(`
                *,
                supplies (
                    water_supply,
                    food_supply,
                    medical_kits
                )
            `);

        if (error) throw error;

        centersGrid.innerHTML = centers.map(center => `
            <div class="center-card">
                <h3>${center.name}</h3>
                <p>Type: ${center.type}</p>
                <p>Capacity: ${center.current_occupancy}/${center.capacity}</p>
                <p>Contact: ${center.contact}</p>
                <div class="supplies">
                    <p>💧 Water: ${center.supplies[0]?.water_supply || 0} units</p>
                    <p>🍲 Food: ${center.supplies[0]?.food_supply || 0} units</p>
                    <p>🏥 Medical: ${center.supplies[0]?.medical_kits || 0} kits</p>
                </div>
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
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        updatesContainer.innerHTML = updates.map(update => `
            <div class="update">
                <div class="update-header">
                    <strong>${update.source}</strong>
                    ${update.verified ? '✓' : ''}
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
    // Listen for new alerts
    supabase
        .channel('public:alerts')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'alerts' },
            () => fetchAlerts()
        )
        .subscribe();

    // Listen for center updates
    supabase
        .channel('public:centers')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'centers' },
            () => fetchCenters()
        )
        .subscribe();

    // Listen for live updates
    supabase
        .channel('public:updates')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'updates' },
            () => fetchUpdates()
        )
        .subscribe();
}

// Initialize
async function init() {
    // Initial data fetch
    await Promise.all([
        fetchAlerts(),
        fetchCenters(),
        fetchUpdates()
    ]);

    // Setup real-time subscriptions
    setupRealTimeSubscriptions();

    // Load saved checklist state
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const saved = localStorage.getItem(checkbox.id);
        if (saved) checkbox.checked = JSON.parse(saved);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Save checklist state
document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        localStorage.setItem(e.target.id, e.target.checked);
    }
});
