// Mock data for development and fallback purposes
const MOCK_DATA = {
    alerts: [
        {
            id: 1,
            type: "Natural Disaster",
            severity: "HIGH",
            location: "Coastal Region, Zone A",
            description: "Category 4 hurricane approaching. Expected landfall in 24 hours. Immediate evacuation required.",
            created_at: "2025-01-26T18:30:00Z"
        },
        {
            id: 2,
            type: "Infrastructure",
            severity: "MEDIUM",
            location: "Downtown District",
            description: "Power outage affecting multiple blocks. Repair crews dispatched.",
            created_at: "2025-01-27T10:15:00Z"
        },
        {
            id: 3,
            type: "Weather",
            severity: "LOW",
            location: "Northern District",
            description: "Heavy rainfall expected. Possible minor flooding in low-lying areas.",
            created_at: "2025-01-27T12:00:00Z"
        }
    ],

    centers: [
        {
            id: 1,
            name: "Central Emergency Shelter",
            type: "Primary Shelter",
            status: "online",
            current_occupancy: 245,
            capacity: 500,
            contact: "+1 (555) 0123",
            lat: 34.0522,
            lon: -118.2437
        },
        {
            id: 2,
            name: "Westside Medical Center",
            type: "Medical Facility",
            status: "online",
            current_occupancy: 89,
            capacity: 150,
            contact: "+1 (555) 0124",
            lat: 34.0622,
            lon: -118.2537
        },
        {
            id: 3,
            name: "Eastside Supply Hub",
            type: "Supply Distribution",
            status: "offline",
            current_occupancy: 0,
            capacity: 1000,
            contact: "+1 (555) 0125",
            lat: 34.0722,
            lon: -118.2637
        }
    ],

    supplies: [
        {
            id: 1,
            center_id: 1,
            water_supply: 1500,
            food_supply: 2000,
            medical_kits: 200,
            last_updated: "2025-01-27T11:00:00Z"
        },
        {
            id: 2,
            center_id: 2,
            water_supply: 800,
            food_supply: 1000,
            medical_kits: 500,
            last_updated: "2025-01-27T11:30:00Z"
        },
        {
            id: 3,
            center_id: 3,
            water_supply: 3000,
            food_supply: 4000,
            medical_kits: 150,
            last_updated: "2025-01-27T12:00:00Z"
        }
    ],

    updates: [
        {
            id: 1,
            source: "Emergency Response Team",
            message: "Additional rescue teams deployed to affected areas. Helicopter support activated.",
            verified: true,
            created_at: "2025-01-27T09:15:00Z"
        },
        {
            id: 2,
            source: "Weather Service",
            message: "Hurricane trajectory updated. Expected to make landfall 2 hours earlier than previously predicted.",
            verified: true,
            created_at: "2025-01-27T10:30:00Z"
        },
        {
            id: 3,
            source: "Local Police",
            message: "Traffic diversions in place around flooded areas. Please follow posted detours.",
            verified: true,
            created_at: "2025-01-27T11:45:00Z"
        },
        {
            id: 4,
            source: "Community Report",
            message: "Power restored in downtown area sectors A1-A4.",
            verified: false,
            created_at: "2025-01-27T12:30:00Z"
        }
    ]
};

// Utility function to simulate API delay
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

// Mock API functions
const mockAPI = {
    // Fetch alerts with optional filtering
    async getAlerts() {
        await simulateDelay();
        return { data: MOCK_DATA.alerts, error: null };
    },

    // Fetch centers with their supplies
    async getCentersWithSupplies() {
        await simulateDelay();
        const centersWithSupplies = MOCK_DATA.centers.map(center => ({
            ...center,
            supplies: [MOCK_DATA.supplies.find(s => s.center_id === center.id)]
        }));
        return { data: centersWithSupplies, error: null };
    },

    // Fetch updates with optional filtering
    async getUpdates() {
        await simulateDelay();
        return { data: MOCK_DATA.updates, error: null };
    },

    // Subscribe to real-time changes (mock implementation)
    subscribeToChanges(callback) {
        // Simulate random updates every 30 seconds
        const interval = setInterval(() => {
            const types = ['alerts', 'centers', 'supplies', 'updates'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            callback({
                type: randomType,
                timestamp: new Date().toISOString()
            });
        }, 30000);

        // Return cleanup function
        return () => clearInterval(interval);
    }
};

// Function to determine whether to use mock data
const shouldUseMockData = () => {
    // Add your conditions here (e.g., environment check, Supabase connection test)
    return !window.supabase || process.env.USE_MOCK_DATA === 'true';
};

// Export mock data and API
export { MOCK_DATA, mockAPI, shouldUseMockData };
