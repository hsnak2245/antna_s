// Custom Error Class for better error handling
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
        // Fetch centers with their supplies using a join
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

    try {
        const { data: updates, error } = await supabase
            .from(SUPABASE_CONFIG.tables.updates)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new APIError('Failed to fetch updates', error.code, error);

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
        console.error('Error:', error);
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

// Real-time subscriptions setup
function setupRealTimeSubscriptions() {
    const channels = supabase.channel('public:all-changes');
    
    const handleReconnection = () => {
        console.log('Reconnecting to real-time channels...');
        channels.unsubscribe();
        setTimeout(setupRealTimeSubscriptions, 5000);
    };

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
            if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to real-time changes');
            } else if (status === 'CLOSED') {
                console.log('Connection closed. Attempting to reconnect...');
                handleReconnection();
            }
        });

    // Handle window focus/blur for connection management
    window.addEventListener('focus', () => {
        console.log('Window focused - checking connection');
        if (!channels.isConnected()) {
            handleReconnection();
        }
    });
}

// Emergency Preparedness Checklist
async function setupPreparationChecklist() {
    const checklistContainer = document.querySelector('.prep-checklist');
    
    const essentialItems = [
        { id: 'water', text: 'Water (1 gallon per person per day for 3 days)' },
        { id: 'food', text: 'Non-perishable food (3-day supply)' },
        { id: 'radio', text: 'Battery-powered or hand crank radio' },
        { id: 'flashlight', text: 'Flashlight and extra batteries' },
        { id: 'firstaid', text: 'First aid kit' },
        { id: 'medications', text: 'Prescription medications' },
        { id: 'documents', text: 'Important family documents' },
        { id: 'cash', text: 'Cash and change' }
    ];

    const checklistHTML = `
        <h3>Essential Emergency Items</h3>
        <div class="checklist">
            ${essentialItems.map(item => `
                <div class="checklist-item">
                    <input type="checkbox" id="${item.id}" name="${item.id}">
                    <label for="${item.id}">${item.text}</label>
                </div>
            `).join('')}
        </div>
    `;

    checklistContainer.innerHTML = checklistHTML;

    // Load saved checklist state
    const savedState = localStorage.getItem('emergencyChecklist');
    if (savedState) {
        const checkedItems = JSON.parse(savedState);
        checkedItems.forEach(itemId => {
            const checkbox = document.getElementById(itemId);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Save checklist state on changes
    checklistContainer.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const checkedBoxes = [...document.querySelectorAll('.checklist-item input:checked')]
                .map(cb => cb.id);
            localStorage.setItem('emergencyChecklist', JSON.stringify(checkedBoxes));
        }
    });
}

// Initialize application
async function init() {
    try {
        // Show loading state
        document.querySelectorAll('.section').forEach(section => {
            setLoading(section, true);
        });

        // Initialize all data fetching in parallel
        await Promise.all([
            fetchAlerts(),
            fetchCentersWithSupplies(),
            fetchUpdates(),
            setupPreparationChecklist()
        ]);

        // Setup real-time updates
        setupRealTimeSubscriptions();

    } catch (error) {
        console.error('Initialization error:', error);
        // Implement user notification for initialization failure
    } finally {
        // Hide loading state
        document.querySelectorAll('.section').forEach(section => {
            setLoading(section, false);
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', init);

// Export functions for potential reuse
export {
    fetchAlerts,
    fetchCentersWithSupplies,
    fetchUpdates,
    setupRealTimeSubscriptions,
    setupPreparationChecklist
};
