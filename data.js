// Mock data store
export const MOCK_DATA = {
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
            lon: -118.2437,
            supplies: {
                water_supply: 1500,
                food_supply: 2000,
                medical_kits: 200
            }
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
            lon: -118.2537,
            supplies: {
                water_supply: 800,
                food_supply: 1000,
                medical_kits: 500
            }
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
            lon: -118.2637,
            supplies: {
                water_supply: 3000,
                food_supply: 4000,
                medical_kits: 150
            }
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

// Mock API class with event emitter functionality
class MockAPI extends EventTarget {
    constructor(initialData) {
        super();
        this.data = { ...initialData };
    }

    async getAlerts() {
        await this.simulateDelay();
        return { data: this.data.alerts, error: null };
    }

    async getCenters() {
        await this.simulateDelay();
        return { data: this.data.centers, error: null };
    }

    async getUpdates() {
        await this.simulateDelay();
        return { data: this.data.updates, error: null };
    }

    // Simulate API delay
    simulateDelay() {
        const delay = Math.random() * 500 + 100; // 100-600ms delay
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Simulate real-time updates
    startSimulation() {
        this.simulationInterval = setInterval(() => {
            this.generateRandomUpdate();
        }, 15000); // Generate update every 15 seconds
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
    }

    generateRandomUpdate() {
        const types = ['alert', 'center', 'update'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const event = new CustomEvent('dataUpdate', {
            detail: { type, timestamp: new Date().toISOString() }
        });
        
        this.dispatchEvent(event);
    }
}

// Create and export API instance
export const api = new MockAPI(MOCK_DATA);
