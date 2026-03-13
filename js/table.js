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

function tableApp() {
    return {
        items: [],
        latestData: null,
        loading: true,
        lastUpdateTime: '',
        
        // Filter State
        filter: { day: '', month: '', year: '' },
        isFiltered: false,
        filteredItems: [],

        // --- State Pagination ---
        currentPage: 1,
        itemsPerPage: 10,

        // Logic pengambilan data yang akan ditampilkan
        get displayItems() {
            const source = this.isFiltered ? this.filteredItems : this.items;
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return source.slice(start, end);
        },

        // Menghitung total halaman
        get totalPages() {
            const source = this.isFiltered ? this.filteredItems : this.items;
            return Math.ceil(source.length / this.itemsPerPage) || 1;
        },

        // --- Navigasi ---
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },

        applyFilter() {
            this.isFiltered = true;
            this.currentPage = 1; // Reset ke halaman 1 saat filter
            this.filteredItems = this.items.filter(item => {
                const date = new Date(item.waktu);
                const matchDay = this.filter.day === '' || date.getDate() == this.filter.day;
                const matchMonth = this.filter.month === '' || date.getMonth() == this.filter.month;
                const matchYear = this.filter.year === '' || date.getFullYear() == this.filter.year;
                return matchDay && matchMonth && matchYear;
            });
        },

        resetFilter() {
            this.filter = { day: '', month: '', year: '' };
            this.isFiltered = false;
            this.currentPage = 1;
        },

        // Re-export utility functions
        formatTime, getPhStatus, getTempStatus, getNtuStatus, getStatusBadgeClass, getOverallStatus,

        init() {
            this.loading = true;
            setupListener((items) => {
                this.items = items; // Ambil semua data agar pagination berfungsi
                if (this.items.length > 0) this.latestData = this.items[0];
                if (this.isFiltered) this.applyFilter();
                this.loading = false;
                this.updateLastTime();
            });
        },

        updateLastTime() {
            this.lastUpdateTime = getCurrentTime();
        }
    };
}

window.tableApp = tableApp;
console.log('✅ Table Page Ready with Filter');