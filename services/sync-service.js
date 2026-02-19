/**
 * Firebase to JSON Sync Service
 * Reads data from Firebase every 1 minute and saves to data.json
 * Run with: node sync-service.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC4dnyA7PHaq19AtFDoVEAGogDa2VkuBqs",
    authDomain: "monitoring-kualitas-air-47fa4.firebaseapp.com",
    databaseURL: "https://monitoring-kualitas-air-47fa4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "monitoring-kualitas-air-47fa4",
    storageBucket: "monitoring-kualitas-air-47fa4.firebasestorage.app",
    messagingSenderId: "37289677963",
    appId: "1:37289677963:web:d9aa457eb507239377f08e"
};

// Initialize Firebase Admin SDK
// Note: You need to download your service account key from Firebase Console
// Place it in the project root as 'firebase-service-account.json'
let admin_initialized = false;

try {
    const serviceAccount = require('../firebase-service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: firebaseConfig.databaseURL
    });
    admin_initialized = true;
    console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
    console.log('⚠️ Firebase Admin SDK not available. Using fetch API instead.');
    console.log('📝 To use Firebase Admin SDK, download service account key from Firebase Console');
    console.log('   and save it as firebase-service-account.json\n');
}

const db = admin_initialized ? admin.database() : null;

/**
 * Fetch data from Firebase using REST API
 */
async function fetchFromFirebaseREST() {
    try {
        const url = `${firebaseConfig.databaseURL}/monitoring.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data || {};
    } catch (error) {
        console.error('❌ Error fetching from Firebase REST:', error.message);
        return {};
    }
}

/**
 * Fetch data from Firebase using Admin SDK
 */
async function fetchFromFirebaseAdmin() {
    try {
        const snapshot = await db.ref('monitoring').once('value');
        return snapshot.val() || {};
    } catch (error) {
        console.error('❌ Error fetching from Firebase Admin:', error.message);
        return {};
    }
}

/**
 * Get data from Firebase (Admin SDK preferred, fallback to REST)
 */
async function getDataFromFirebase() {
    if (admin_initialized && db) {
        return await fetchFromFirebaseAdmin();
    } else {
        return await fetchFromFirebaseREST();
    }
}

/**
 * Convert Firebase object to array format for charts
 */
function convertFirebaseToArray(firebaseData) {
    const arr = [];
    Object.keys(firebaseData).forEach(key => {
        arr.push({
            id: key,
            ...firebaseData[key]
        });
    });
    // Sort by waktu descending (newest first)
    arr.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
    // Keep only last 100 items
    return arr.slice(0, 100);
}

/**
 * Save data to data.json
 */
function saveToJSON(data) {
    try {
        const filePath = path.join(__dirname, '../data/data.json');
        const jsonData = {
            lastUpdated: new Date().toISOString(),
            items: data
        };
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        console.log(`✅ Updated data.json at ${new Date().toLocaleTimeString('id-ID')} (${data.length} items)`);
        return true;
    } catch (error) {
        console.error('❌ Error saving to data.json:', error.message);
        return false;
    }
}

/**
 * Sync function - fetch from Firebase and save to JSON
 */
async function syncData() {
    try {
        console.log(`\n🔄 Syncing data... (${new Date().toLocaleTimeString('id-ID')})`);
        
        // Fetch from Firebase
        const firebaseData = await getDataFromFirebase();
        
        if (Object.keys(firebaseData).length === 0) {
            console.log('⚠️ No data found in Firebase');
            return;
        }
        
        // Convert to array format
        const dataArray = convertFirebaseToArray(firebaseData);
        
        // Save to JSON
        saveToJSON(dataArray);
    } catch (error) {
        console.error('❌ Sync error:', error.message);
    }
}

/**
 * Start sync service with 1 minute interval
 */
function startSyncService() {
    console.log('\n📡 Firebase to JSON Sync Service Started');
    console.log('═══════════════════════════════════════');
    
    // Initial sync
    syncData();
    
    // Sync every 60 seconds (1 minute)
    setInterval(syncData, 60 * 1000);
    
    console.log('⏰ Sync will run every 1 minute');
    console.log('🛑 Press Ctrl+C to stop the service\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✋ Shutting down sync service...');
    if (admin_initialized) {
        admin.app().delete();
    }
    process.exit(0);
});

// Start the service
startSyncService();
