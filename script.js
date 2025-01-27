// Custom Error Class
class APIError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.details = details;
    }
}

// Utility Functions
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(date));
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

        if (error) throw new APIError('Failed to fetch alerts', error.code, error);

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
        console.error('Error:', error);
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
        // Fetch centers with their supplies
        const { data: centers, error: centersError } = await supabase
            .from(SUPABASE_CONFIG.tables.centers)
            .select(`
                *,
                supplies:${SUPABASE_CONFIG.tables.supplies}(*)
            `);

        if (centersError) throw new APIError('Failed to fetch centers', centersError.code, centersError);

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
        console.error('Error:', error);
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

    try
