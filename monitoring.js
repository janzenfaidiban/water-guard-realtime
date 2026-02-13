import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

// Firebase Configuration (Monitoring Kualitas Air)
const firebaseConfig = {
    apiKey: "AIzaSyC4dnyA7PHaq19AtFDoVEAGogDa2VkuBqs",
    authDomain: "monitoring-kualitas-air-47fa4.firebaseapp.com",
    databaseURL: "https://monitoring-kualitas-air-47fa4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "monitoring-kualitas-air-47fa4",
    storageBucket: "monitoring-kualitas-air-47fa4.firebasestorage.app",
    messagingSenderId: "37289677963",
    appId: "1:37289677963:web:d9aa457eb507239377f08e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const monitoringRef = ref(database, 'monitoring');

// Alpine JS App
function monitoringApp() {
    return {
        items: [],
        latestData: null,
        loading: true,
        lastUpdateTime: '',

        // Format time to readable format
        formatTime(isoString) {
            try {
                const date = new Date(isoString);
                return date.toLocaleString('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            } catch (e) {
                return isoString;
            }
        },

        // Get status color for pH
        getPhStatus(ph) {
            const phValue = parseFloat(ph);
            if (phValue >= 6.5 && phValue <= 8.5) {
                return 'font-bold text-green-600';
            } else if (phValue >= 6 || phValue <= 9) {
                return 'font-bold text-yellow-600';
            } else {
                return 'font-bold text-red-600';
            }
        },

        // Get status color for temperature
        getTempStatus(temp) {
            const tempValue = parseFloat(temp);
            if (tempValue >= 20 && tempValue <= 32) {
                return 'font-bold text-green-600';
            } else if (tempValue >= 15 || tempValue <= 35) {
                return 'font-bold text-yellow-600';
            } else {
                return 'font-bold text-red-600';
            }
        },

        // Get status color for NTU (Turbidity)
        getNtuStatus(ntu) {
            const ntuValue = parseFloat(ntu);
            if (ntuValue <= 5) {
                return 'font-bold text-green-600';
            } else if (ntuValue <= 10) {
                return 'font-bold text-yellow-600';
            } else {
                return 'font-bold text-red-600';
            }
        },

        // Get overall status badge
        getStatusBadgeClass(item) {
            const ph = parseFloat(item.ph);
            const ntu = parseFloat(item.ntu);
            const temp = parseFloat(item.suhu);

            const isPhGood = ph >= 6.5 && ph <= 8.5;
            const isNtuGood = ntu <= 5;
            const isTempGood = temp >= 20 && temp <= 32;

            if (isPhGood && isNtuGood && isTempGood) {
                return 'px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800';
            } else if ((isPhGood || isNtuGood || isTempGood) && !(isPhGood && isNtuGood && isTempGood)) {
                return 'px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800';
            } else {
                return 'px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800';
            }
        },

        // Get overall status text
        getOverallStatus(item) {
            const ph = parseFloat(item.ph);
            const ntu = parseFloat(item.ntu);
            const temp = parseFloat(item.suhu);

            const isPhGood = ph >= 6.5 && ph <= 8.5;
            const isNtuGood = ntu <= 5;
            const isTempGood = temp >= 20 && temp <= 32;

            if (isPhGood && isNtuGood && isTempGood) {
                return '✅ BAIK';
            } else if ((isPhGood || isNtuGood || isTempGood) && !(isPhGood && isNtuGood && isTempGood)) {
                return '⚠️ PERLU PERHATIAN';
            } else {
                return '❌ KRITIS';
            }
        },

        // Initialize - Load realtime data from Firebase
        async init() {
            this.loading = true;
            try {
                onValue(monitoringRef, (snapshot) => {
                    this.items = [];
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        // Convert object to array and reverse to show newest first
                        Object.keys(data).forEach(key => {
                            this.items.push({
                                id: key,
                                ...data[key]
                            });
                        });
                        // Sort by waktu descending (newest first)
                        this.items.sort((a, b) => {
                            return new Date(b.waktu) - new Date(a.waktu);
                        });
                        // Keep only last 100 items
                        this.items = this.items.slice(0, 100);
                        // Set latest data
                        if (this.items.length > 0) {
                            this.latestData = this.items[0];
                        }
                    }
                    this.loading = false;
                    this.updateLastTime();
                }, (error) => {
                    console.error('❌ Error loading data:', error);
                    this.loading = false;
                });
            } catch (error) {
                console.error('❌ Init error:', error);
                this.loading = false;
            }
        },

        // Update last update time
        updateLastTime() {
            const now = new Date();
            this.lastUpdateTime = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    };
}

// Make monitoringApp available globally for Alpine
window.monitoringApp = monitoringApp;

console.log('✅ Firebase Monitoring Kualitas Air Ready');
