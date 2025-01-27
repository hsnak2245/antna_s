import { api } from './data.js';

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
        const { data: alerts, error } = await api.getAlerts();
        if (error) throw error;

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

async function fetchCenters() {
    const centersGrid = document.querySelector('.centers-grid');
    setLoading(centersGrid, true);

    try {
        const { data: centers, error } = await api.getCenters();
        if (error) throw error;

        centersGrid.innerHTML = centers.map(center => `
            <div class="center-card glass" data-id="${center.id}">
                <div class="status-indicator ${center.status}"></div>
                <h3>${center.name}</h3>
                <p>Type: ${center.type}</p>
                <p>Capacity: ${center.current_occupancy}/${center.capacity}</p>
                <p>Contact: ${center.contact || 'N/A'}</p>
                
                <div class="supplies">
                    <p>💧 Water: ${center.supplies.water_supply} units</p>
                    <p>🍲 Food: ${center.supplies.food_supply} units</p>
                    <p>🏥 Medical: ${center.supplies.medical_kits} kits</p>
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
        const { data: updates, error } = await api.getUpdates();
        if (error) throw error;

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

// Emergency Preparedness Checklist
function setupPreparationChecklist() {
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

    // Load saved state
    const savedState = localStorage.getItem('emergencyChecklist');
    if (savedState) {
        const checkedItems = JSON.parse(savedState);
        checkedItems.forEach(itemId => {
            const checkbox = document.getElementById(itemId);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Save state on changes
    checklistContainer.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const checkedBoxes = [...document.querySelectorAll('.checklist-item input:checked')]
                .map(cb => cb.id);
            localStorage.setItem('emergencyChecklist', JSON.stringify(checkedBoxes));
        }
    });
}

// Setup real-time updates
function setupRealTimeUpdates() {
    api.addEventListener('dataUpdate', async (event) => {
        const { type } = event.detail;
        
        switch (type) {
            case 'alert':
                await fetchAlerts();
                break;
            case 'center':
                await fetchCenters();
                break;
            case 'update':
                await fetchUpdates();
                break;
        }
    });

    // Start the simulation
    api.startSimulation();

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        api.stopSimulation();
    });
}

// Initialize the application
async function initializeApp() {
    try {
        // Show loading state
        document.querySelectorAll('.section').forEach(section => {
            setLoading(section, true);
        });

        // Fetch all data in parallel
        await Promise.all([
            fetchAlerts(),
            fetchCenters(),
            fetchUpdates()
        ]);

        // Setup checklist and real-time updates
        setupPreparationChecklist();
        setupRealTimeUpdates();

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
        // Refresh all data when tab becomes visible
        Promise.all([
            fetchAlerts(),
            fetchCenters(),
            fetchUpdates()
        ]).catch(console.error);
    }
});

// Export functions for potential reuse
export {
    fetchAlerts,
    fetchCenters,
    fetchUpdates,
    setupPreparationChecklist,
    setupRealTimeUpdates
};
