import { formatTimeShort, getCurrentTime } from "./utils.js";

// Alpine JS App for Chart Page
function chartApp() {
    return {
        items: [],
        latestData: null,
        loading: true,
        lastUpdateTime: '',
        chart: null,
        syncStatus: 'Checking...',
        lastDataHash: '',

        // Get last 20 items for chart
        get displayItems() {
            return this.items.slice(0, 20);
        },

        // Generate hash to check if data changed
        getDataHash() {
            if (this.displayItems.length === 0) return '';
            return this.displayItems.map(i => i.id).join(',');
        },

        // Prepare chart data
        prepareChartData() {
            const chartItems = [...this.displayItems].reverse();
            return {
                labels: chartItems.map(item => formatTimeShort(item.waktu)),
                phData: chartItems.map(item => parseFloat(item.ph) || 0),
                suhuData: chartItems.map(item => parseFloat(item.suhu) || 0),
                tdsData: chartItems.map(item => parseFloat(item.tds) || 0),
                ntuData: chartItems.map(item => parseFloat(item.ntu) || 0)
            };
        },

        // Initialize chart (only once)
        initChart() {
            const canvasElement = document.getElementById('trendChart');
            
            if (!canvasElement) {
                console.warn('Canvas element not found, retrying...');
                setTimeout(() => this.initChart(), 500);
                return;
            }

            if (this.displayItems.length === 0) {
                console.warn('No data available for chart');
                return;
            }

            // If chart already exists, just update data
            if (this.chart) {
                this.updateChartData();
                return;
            }

            const ctx = canvasElement.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                return;
            }

            const data = this.prepareChartData();

            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'pH',
                            data: data.phData,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#3b82f6',
                            pointBorderColor: '#1e40af',
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Suhu (°C)',
                            data: data.suhuData,
                            borderColor: '#f97316',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#f97316',
                            pointBorderColor: '#ea580c',
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            yAxisID: 'y1'
                        },
                        {
                            label: 'TDS',
                            data: data.tdsData,
                            borderColor: '#22c55e',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#22c55e',
                            pointBorderColor: '#15803d',
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            yAxisID: 'y2'
                        },
                        {
                            label: 'NTU',
                            data: data.ntuData,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#ef4444',
                            pointBorderColor: '#dc2626',
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            yAxisID: 'y3'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: false, // Disable animation for stability
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
                                color: 'rgba(0, 0, 0, 0.05)'
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
            
            this.lastDataHash = this.getDataHash();
            console.log('✅ Chart initialized successfully');
        },

        // Update chart data without recreating
        updateChartData() {
            if (!this.chart || this.displayItems.length === 0) return;

            // Check if data actually changed
            const newHash = this.getDataHash();
            if (newHash === this.lastDataHash) return;

            const data = this.prepareChartData();

            this.chart.data.labels = data.labels;
            this.chart.data.datasets[0].data = data.phData;
            this.chart.data.datasets[1].data = data.suhuData;
            this.chart.data.datasets[2].data = data.tdsData;
            this.chart.data.datasets[3].data = data.ntuData;
            this.chart.update('none'); // 'none' = no animation

            this.lastDataHash = newHash;
            this.updateLastTime();
            console.log('📊 Chart data updated');
        },

        // Load data from local data.json
        async loadDataFromJSON() {
            try {
                const response = await fetch('./data/data.json?t=' + Date.now());
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const jsonData = await response.json();
                console.log('📥 Data loaded from data.json:', jsonData.items.length, 'items');
                
                // If data.json is empty, fallback to Firebase
                if (!jsonData.items || jsonData.items.length === 0) {
                    console.log('⚠️ data.json empty, fetching from Firebase...');
                    return await this.fetchDataFromFirebase();
                }
                
                this.items = jsonData.items || [];
                if (this.items.length > 0) {
                    this.latestData = this.items[0];
                }
                
                return this.items.length > 0;
            } catch (error) {
                console.error('❌ Error loading data.json:', error);
                // Fallback to Firebase
                return await this.fetchDataFromFirebase();
            }
        },

        // Fallback: Fetch data directly from Firebase
        async fetchDataFromFirebase() {
            try {
                const firebaseURL = 'https://monitoring-kualitas-air-47fa4-default-rtdb.asia-southeast1.firebasedatabase.app/monitoring.json';
                console.log('🔄 Fetching from Firebase...');
                
                const response = await fetch(firebaseURL);
                if (!response.ok) throw new Error(`Firebase HTTP ${response.status}`);
                
                const firebaseData = await response.json();
                
                if (!firebaseData || Object.keys(firebaseData).length === 0) {
                    console.warn('⚠️ No data in Firebase');
                    return false;
                }
                
                // Convert Firebase object to array
                const arr = [];
                Object.keys(firebaseData).forEach(key => {
                    arr.push({
                        id: key,
                        ...firebaseData[key]
                    });
                });
                
                // Sort by waktu descending (newest first)
                arr.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
                
                this.items = arr.slice(0, 50);
                console.log('✅ Loaded from Firebase:', this.items.length, 'items');
                
                if (this.items.length > 0) {
                    this.latestData = this.items[0];
                }
                
                return this.items.length > 0;
            } catch (error) {
                console.error('❌ Error fetching from Firebase:', error);
                return false;
            }
        },

        // Check sync status from data.json
        async checkSyncStatus() {
            try {
                const response = await fetch('./data/data.json?t=' + Date.now());
                const jsonData = await response.json();
                
                if (!jsonData.items || jsonData.items.length === 0) {
                    this.syncStatus = '⏳ Waiting for sync service (or using Firebase)...';
                    return;
                }
                
                const lastUpdated = new Date(jsonData.lastUpdated);
                const now = new Date();
                const minutesAgo = Math.floor((now - lastUpdated) / 60000);
                
                if (minutesAgo === 0) {
                    this.syncStatus = '✅ Synced just now (data.json)';
                } else if (minutesAgo < 60) {
                    this.syncStatus = `✅ Synced ${minutesAgo}m ago (data.json)`;
                } else {
                    this.syncStatus = '⚠️ Sync service may be offline';
                }
            } catch (error) {
                this.syncStatus = '📡 Using Firebase data (fallback)';
            }
        },

        // Initialize
        async init() {
            this.loading = true;
            
            console.log('🚀 Initializing Chart App...');
            
            // Initial load from data.json (or Firebase fallback)
            const hasData = await this.loadDataFromJSON();
            
            if (hasData) {
                console.log('✅ Data loaded successfully');
                this.loading = false;
                this.updateLastTime();
                setTimeout(() => this.initChart(), 300);
            } else {
                console.log('⚠️ No data available yet');
                this.loading = false;
            }
            
            // Check sync status immediately
            await this.checkSyncStatus();
            
            // Poll for updates every 10 seconds (less frequent = more stable)
            setInterval(async () => {
                try {
                    await this.loadDataFromJSON();
                    if (this.displayItems.length > 0) {
                        if (this.chart === null) {
                            this.initChart();
                        } else {
                            this.updateChartData();
                        }
                    }
                    await this.checkSyncStatus();
                } catch (error) {
                    console.error('Poll error:', error);
                }
            }, 10000);
        },

        // Update last update time
        updateLastTime() {
            this.lastUpdateTime = getCurrentTime();
        }
    };
}

// Make chartApp available globally for Alpine
window.chartApp = chartApp;

console.log('✅ Chart Page Ready');
