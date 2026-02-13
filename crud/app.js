import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    push, 
    set, 
    remove, 
    update,
    onValue 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmz426AC2SxSJQXW0B5VuucxmAZ9dhVBg",
    authDomain: "real-time-watergurad.firebaseapp.com",
    databaseURL: "https://real-time-watergurad-default-rtdb.firebaseio.com",
    projectId: "real-time-watergurad",
    storageBucket: "real-time-watergurad.firebasestorage.app",
    messagingSenderId: "1014089163496",
    appId: "1:1014089163496:web:50b55c79db35c61ebddf5d",
    measurementId: "G-WBXBCFDBST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dataRef = ref(database, 'waterGuard/monitoring');

// Alpine JS App
function crudApp() {
    return {
        items: [],
        loading: true,
        editingId: null,
        searchQuery: '',
        
        formData: {
            location: '',
            status: '',
            quality: '',
            flowRate: '',
            notes: ''
        },

        get filteredItems() {
            if (!this.searchQuery) return this.items;
            return this.items.filter(item => 
                item.location.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },

        // Initialize - Load data dari Firebase
        async init() {
            this.loading = true;
            try {
                onValue(dataRef, (snapshot) => {
                    this.items = [];
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        Object.keys(data).forEach(key => {
                            this.items.push({
                                id: key,
                                ...data[key]
                            });
                        });
                    }
                    this.loading = false;
                }, (error) => {
                    console.error('Error loading data:', error);
                    this.loading = false;
                    alert('Gagal memuat data: ' + error.message);
                });
            } catch (error) {
                console.error('Init error:', error);
                this.loading = false;
            }
        },

        // Save Data (Create or Update)
        async saveData() {
            try {
                // Validasi
                if (!this.formData.location.trim()) {
                    alert('Nama lokasi tidak boleh kosong');
                    return;
                }

                const data = {
                    location: this.formData.location.trim(),
                    status: this.formData.status,
                    quality: this.formData.quality || 0,
                    flowRate: this.formData.flowRate || 0,
                    notes: this.formData.notes.trim(),
                    timestamp: new Date().toISOString()
                };

                if (this.editingId) {
                    // Update
                    const itemRef = ref(database, `waterGuard/monitoring/${this.editingId}`);
                    await update(itemRef, data);
                    alert('✅ Data berhasil diperbarui');
                } else {
                    // Create
                    await push(dataRef, data);
                    alert('✅ Data berhasil ditambahkan');
                }

                this.resetForm();
            } catch (error) {
                console.error('Save error:', error);
                alert('❌ Gagal menyimpan data: ' + error.message);
            }
        },

        // Edit Item
        editItem(id, item) {
            this.editingId = id;
            this.formData = {
                location: item.location,
                status: item.status,
                quality: item.quality,
                flowRate: item.flowRate,
                notes: item.notes
            };
            // Scroll ke form
            document.querySelector('.sticky').scrollIntoView({ behavior: 'smooth' });
        },

        // Delete Item
        async deleteItem(id) {
            if (!confirm('Yakin ingin menghapus data ini?')) return;

            try {
                const itemRef = ref(database, `waterGuard/monitoring/${id}`);
                await remove(itemRef);
                alert('✅ Data berhasil dihapus');
            } catch (error) {
                console.error('Delete error:', error);
                alert('❌ Gagal menghapus data: ' + error.message);
            }
        },

        // Reset Form
        resetForm() {
            this.formData = {
                location: '',
                status: '',
                quality: '',
                flowRate: '',
                notes: ''
            };
            this.editingId = null;
        }
    };
}

// Make crudApp available globally for Alpine
window.crudApp = crudApp;

console.log('✅ Firebase Water Guard App Ready');
