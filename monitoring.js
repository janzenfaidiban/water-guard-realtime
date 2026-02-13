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
        chart: null,

        // Get last 10 items for display
        get displayItems() {
            return this.items.slice(0, 10);
        },

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

        // Initialize Chart - Line Chart
        initChart() {
            console.log('initChart() called');
            const canvasElement = document.getElementById('trendChart');
            
            // If canvas not found, retry after longer delay
            if (!canvasElement) {
                console.warn('❌ Canvas element not found, retrying in 500ms...');
                setTimeout(() => this.initChart(), 500);
                return;
            }
            
            console.log('✅ Canvas element found:', canvasElement);

            if (this.displayItems.length === 0) {
                console.warn('No data available for chart');
                return;
            }

            // Get 2D context
            const ctx = canvasElement.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                return;
            }
            
            console.log('✅ Canvas context obtained:', ctx);

            // Prepare data - reverse to show chronological order (oldest to newest)
            const chartItems = [...this.displayItems].reverse();
            console.log('Chart data items:', chartItems.length);
            
            const labels = chartItems.map((item) => {
                try {
                    const date = new Date(item.waktu);
                    return date.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    return 'N/A';
                }
            });
            
            // Log sample data
            console.log('Labels:', labels);
            
            const phData = chartItems.map(item => parseFloat(item.ph) || 0);
            const suhuData = chartItems.map(item => parseFloat(item.suhu) || 0);
            const tdsData = chartItems.map(item => parseFloat(item.tds) || 0);
            const ntuData = chartItems.map(item => parseFloat(item.ntu) || 0);
            
            console.log('pH data:', phData);
            console.log('Suhu data:', suhuData);
            console.log('TDS data:', tdsData);
            console.log('NTU data:', ntuData);

            // Destroy old chart if exists
            if (this.chart) {
                console.log('Destroying previous chart');
                this.chart.destroy();
            }

            console.log('Creating new chart...');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'pH',
                            data: phData,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#3b82f6',
                            pointBorderColor: '#1e40af',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Suhu (°C)',
                            data: suhuData,
                            borderColor: '#f97316',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#f97316',
                            pointBorderColor: '#ea580c',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            yAxisID: 'y1'
                        },
                        {
                            label: 'TDS',
                            data: tdsData,
                            borderColor: '#22c55e',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#22c55e',
                            pointBorderColor: '#15803d',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            yAxisID: 'y2'
                        },
                        {
                            label: 'NTU',
                            data: ntuData,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#ef4444',
                            pointBorderColor: '#dc2626',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            yAxisID: 'y3'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { size: 12, weight: 'bold' },
                                padding: 15,
                                usePointStyle: true,
                                boxWidth: 6
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 11 },
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: true
                            },
                            ticks: {
                                font: { size: 10 },
                                maxRotation: 45,
                                minRotation: 0
                            }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            title: { display: true, text: 'pH' },
                            grid: { color: 'rgba(59, 130, 246, 0.1)' }
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            title: { display: true, text: 'Suhu (°C)' },
                            grid: { drawOnChartArea: false }
                        },
                        y2: {
                            type: 'linear',
                            position: 'right',
                            title: { display: true, text: 'TDS' },
                            grid: { drawOnChartArea: false }
                        },
                        y3: {
                            type: 'linear',
                            position: 'right',
                            title: { display: true, text: 'NTU' },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
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
                    // Initialize/update chart - use longer delay to ensure DOM is ready
                    if (!this.loading && this.displayItems.length > 0) {
                        setTimeout(() => {
                            console.log('Initializing chart with', this.displayItems.length, 'items');
                            this.initChart();
                        }, 500);
                    }
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
