import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";
import { firebaseConfig, DB_REFERENCE } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const monitoringRef = ref(database, DB_REFERENCE);

// Setup real-time listener
export function setupListener(onDataChange) {
    onValue(monitoringRef, (snapshot) => {
        let items = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach(key => {
                items.push({
                    id: key,
                    ...data[key]
                });
            });
            // Sort by waktu descending (newest first)
            items.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
        }
        onDataChange(items);
    }, (error) => {
        console.error('❌ Firebase Error:', error);
    });
}
