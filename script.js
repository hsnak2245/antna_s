// Mock Data
const mockAlerts = [
    {
        type: 'Sandstorm',
        severity: 'high',
        location: 'Al Wakrah',
        time: '2025-01-27 14:30',
        description: 'Severe sandstorm approaching with reduced visibility'
    },
    {
        type: 'Heat Wave',
        severity: 'high',
        location: 'Doha',
        time: '2025-01-27 14:00',
        description: 'Extreme temperatures expected to reach 48°C'
    },
    {
        type: 'Flash Flood',
        severity: 'medium',
        location: 'Al Khor',
        time: '2025-01-27 13:30',
        description: 'Heavy rainfall may cause local flooding'
    }
];

const mockCenters = [
    {
        name: 'Lusail Sports Arena',
        type: 'Primary',
        capacity: 800,
        current: 234,
        contact: '+974-4000-1111',
        supplies: {
            water: '1000 units',
            food: '800 units',
            medical: '50 kits'
        }
    },
    {
        name: 'Al Thumama Stadium',
        type: 'Secondary',
        capacity: 600,
        current: 156,
        contact: '+974-4000-2222',
        supplies: {
            water: '800 units',
            food: '600 units',
            medical: '40 kits'
        }
    }
];

const mockUpdates = [
    {
        source: 'Qatar Weather',
        message: 'Severe sandstorm warning for Al Wakrah region. Visibility reduced to 500m.',
        time: '5 minutes ago',
        verified: true
    },
    {
        source: 'Civil Defence',
        message: 'Emergency teams deployed to Al Wakrah. Shelter available.',
        time: '10 minutes ago',
        verified: true
    }
];

const checklistItems = [
    'Water (5L per person per day)',
    'Non-perishable food',
    'First aid kit',
    'Portable fan/cooling devices',
    'Dust masks',
    'Emergency contact list',
    'Portable radio',
    'Power bank',
    'Important documents in waterproof container',
    'Sand/dust protection for electronics'
];

// DOM Elements
const alertsContainer = document.querySelector('.alerts-container');
const centersGrid = document.querySelector('.centers-grid');
const updatesContainer = document.querySelector('.updates-container');
const checklistContainer = document.querySelector('.checklist');

// Render Functions
function renderAlerts() {
    alertsContainer.innerHTML = mockAlerts.map(alert => `
        <div class="alert ${alert.severity}">
            <h3>${alert.type}</h3>
            <p>📍 Location: ${alert.location}</p>
            <p>⚠️ Severity: ${alert.severity}</p>
            <p>🕒 Time: ${alert.time}</p>
            <p>${alert.description}</p>
        </div>
    `).join('');
}

function renderCenters() {
    centersGrid.innerHTML = mockCenters.map(center => `
        <div class="center-card">
            <h3>${center.name}</h3>
            <p>Type: ${center.type}</p>
            <p>Capacity: ${center.current}/${center.capacity}</p>
            <p>Contact: ${center.contact}</p>
            <div class="supplies">
                <p>💧 Water: ${center.supplies.water}</p>
                <p>🍲 Food: ${center.supplies.food}</p>
                <p>🏥 Medical: ${center.supplies.medical}</p>
            </div>
        </div>
    `).join('');
}

function renderUpdates() {
    updatesContainer.innerHTML = mockUpdates.map(update => `
        <div class="update">
            <div class="update-header">
                <strong>${update.source}</strong>
                ${update.verified ? '✓' : ''}
            </div>
            <p>${update.message}</p>
            <small>${update.time}</small>
        </div>
    `).join('');
}

function renderChecklist() {
    checklistContainer.innerHTML = checklistItems.map(item => `
        <div class="checklist-item">
            <input type="checkbox" id="${item}">
            <label for="${item}">${item}</label>
        </div>
    `).join('');
}

// Initialize
function init() {
    renderAlerts();
    renderCenters();
    renderUpdates();
    renderChecklist();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Save checklist state
document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        localStorage.setItem(e.target.id, e.target.checked);
    }
});

// Load saved checklist state
window.addEventListener('load', () => {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const saved = localStorage.getItem(checkbox.id);
        if (saved) checkbox.checked = JSON.parse(saved);
    });
});