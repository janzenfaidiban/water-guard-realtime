import { setupListener } from "./firebase.js";
import {
    formatTime,
    getPhStatus,
    getTempStatus,
    getNtuStatus,
    getStatusBadgeClass,
    getOverallStatus,
    getCurrentTime
} from "./utils.js";

// Alpine JS App for Table Page
function tableApp() {
    return {
        items: [],
        latestData: null,
        loading: true,
        lastUpdateTime: '',

        // Get last 50 items for display
        get displayItems() {
            return this.items.slice(0, 50);
        },

        // Format time
        formatTime,

        // Status functions
        getPhStatus,
        getTempStatus,
        getNtuStatus,
        getStatusBadgeClass,
        getOverallStatus,

        // Initialize
        init() {
            this.loading = true;
            setupListener((items) => {
                this.items = items.slice(0, 100); // Keep up to 100 items
                if (this.items.length > 0) {
                    this.latestData = this.items[0];
                }
                this.loading = false;
                this.updateLastTime();
            });
        },

        // Update last update time
        updateLastTime() {
            this.lastUpdateTime = getCurrentTime();
        }
    };
}

// Make tableApp available globally for Alpine
window.tableApp = tableApp;

console.log('✅ Table Page Ready');
