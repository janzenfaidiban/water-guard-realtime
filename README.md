# Water Guard Real-time Monitoring Dashboard

Dashboard monitoring kualitas air dengan real-time data sync dari Firebase.

## 📁 Struktur File

```
├── index.html           # Halaman Tabel Data
├── chart.html           # Halaman Grafik Trend
├── config.js            # Konfigurasi Firebase
├── firebase.js          # Inisialisasi Firebase
├── utils.js             # Fungsi Utility
├── table.js             # Logika Tabel
├── chartpage.js         # Logika Chart
├── sync-service.js      # Sync Firebase → data.json
├── data.json            # Local Data Cache (auto-updated)
└── README.md            # File ini
```

## 🚀 Instalasi & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Sync Service
```bash
node sync-service.js
```

Service ini akan:
- ✅ Membaca data dari Firebase setiap 1 menit
- ✅ Menyimpan ke file `data.json`
- ✅ Menampilkan status di console

### 3. Buka Browser

**Halaman Tabel Data:**
```
http://localhost:3000/index.html
```
- Menampilkan tabel dengan 50 data terakhir
- Real-time updates dari Firebase

**Halaman Grafik Trend:**
```
http://localhost:3000/chart.html
```
- Grafik multi-axis (pH, Suhu, TDS, NTU)
- Data dari local cache (`data.json`)
- Auto-refresh setiap 5 detik

## 📊 Data Flow

```
Firebase Database
      ↓
  sync-service.js (every 1 min)
      ↓
   data.json
      ↓
  chart.html (polling every 5 sec)
      ↓
  Chart.js Visualization
```

## 🔧 Cara Kerja

### Tabel (index.html)
- Menghubung langsung ke Firebase
- Listener real-time untuk updates
- Menampilkan 50 data terbaru dengan scroll

### Chart (chart.html)
- Membaca dari `data.json` (local cache)
- Polling setiap 5 detik untuk cek update
- Menampilkan 20 data terakhir
- Status sync service ditampilkan

### Sync Service
- Berjalan di background (Node.js)
- Sync setiap 1 menit (configurable)
- Fallback ke REST API jika Admin SDK tidak tersedia
- Graceful shutdown dengan Ctrl+C

## 📝 Catatan Penting

### Menggunakan Firebase Admin SDK (Optional)
Untuk performance lebih baik, download service account key:

1. Go to Firebase Console → Service Accounts
2. Click "Generate New Private Key"
3. Save as `firebase-service-account.json` di project root
4. Service akan otomatis menggunakan Admin SDK

Tanpa file ini, service akan menggunakan REST API (lebih lambat tapi tetap bekerja).

### Konfigurasi Sync Interval
Edit `sync-service.js`, ubah baris:
```javascript
setInterval(syncData, 60 * 1000); // Ubah 60 ke nilai lain (dalam detik)
```

### Limit Data
- Tabel: Max 100 items
- Chart: Display 20 items terakhir
- data.json: Simpan 100 items terakhir

Edit nilai di:
- `firebase.js` → `setupListener()`
- `chartpage.js` → `displayItems`
- `sync-service.js` → return arr.slice(0, 100)

## 🛠️ Troubleshooting

### Chart Tidak Menampilkan Data
1. Pastikan sync-service.js sudah running
2. Check console browser (F12)
3. Cek apakah `data.json` sudah ter-update
4. Buka console Node.js, lihat ada error?

### Sync Service Error
```bash
# Error: Cannot find module 'firebase-admin'
npm install firebase-admin

# Error: Service account key not found
# → Service akan fallback ke REST API (cek Console)
```

### Data Tidak Update
1. Pastikan service masih running: `node sync-service.js`
2. Check Firebase rules (pastikan read access)
3. Restart service: `Ctrl+C` → `node sync-service.js`

## 📊 Fitur

✅ Real-time data sync dari Firebase
✅ Multi-halaman dashboard
✅ Responsive design
✅ Local data caching
✅ Auto-refresh chart
✅ Status monitoring
✅ Error handling

## 🎯 Status Indicator

- 🟢 **✅ Synced just now** - Data fresh
- 🟡 **✅ Synced Xm ago** - Data dalam X menit terakhir
- 🔴 **⚠️ Sync service may be offline** - Perlu restart service
- ❌ **Sync service offline** - Service tidak running

## 📄 License

Nokensoft 2026
