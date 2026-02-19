# 💧 Water Guard - Real-time Monitoring Dashboard

> Real-time water quality monitoring system with Firebase integration and interactive visualization dashboard.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/firebase-realtime-orange.svg)](https://firebase.google.com/)

## 📖 Overview

Water Guard is a comprehensive water quality monitoring dashboard that provides real-time data visualization and management for water monitoring systems. The application monitors critical water quality parameters including pH levels, temperature, Total Dissolved Solids (TDS), and turbidity (NTU).

### Key Features

- 🔄 **Real-time Data Synchronization** - Live updates from Firebase Realtime Database
- 📊 **Interactive Charts** - Multi-parameter trend visualization with Chart.js
- 📋 **Data Table View** - Sortable, filterable table with 50 latest readings
- 🔧 **CRUD Operations** - Complete data management interface
- 💾 **Local Caching** - Automatic data backup to JSON for offline access
- 🎨 **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- ⚡ **Status Monitoring** - Real-time system health indicators
- 🛡️ **Data Quality Alerts** - Automatic alerts for abnormal readings

## 🏗️ Architecture

```
┌─────────────────┐
│  IoT Sensors    │ → (pH, Temp, TDS, NTU)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Firebase RTDB   │ ← Real-time Database
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐  ┌──────────────┐
│ Web UI │  │ Sync Service │ (Node.js)
│        │  │   (1 min)    │
└────────┘  └──────┬───────┘
                   ↓
            ┌──────────────┐
            │  data.json   │ ← Local Cache
            └──────┬───────┘
                   ↓
            ┌──────────────┐
            │ Chart View   │
            └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 14.0.0
- **npm** or **yarn**
- **Firebase Project** with Realtime Database enabled
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 040-water-guard-realtime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Update `config.js` with your Firebase credentials:
   ```javascript
   export const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       databaseURL: "https://your-project.firebaseio.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
   };
   ```

4. **Start the sync service**
   ```bash
   npm start
   # or
   node sync-service.js
   ```

5. **Open the dashboard**
   
   Open any of these pages in your browser:
   - `index.html` - Main data table with embedded charts
   - `chart.html` - Full-screen trend charts
   - `crud/index.html` - Data management interface

## 📁 Project Structure

```
040-water-guard-realtime/
├── index.html              # Main dashboard (table + charts)
├── chart.html              # Full-screen trend charts
├── config.js               # Firebase configuration
├── firebase.js             # Firebase initialization
├── sync-service.js         # Background sync service (Node.js)
├── table.js                # Table view logic
├── chartpage.js            # Chart rendering logic
├── monitoring.js           # Monitoring utilities
├── utils.js                # Helper functions
├── data.json               # Local data cache (auto-generated)
├── package.json            # Project dependencies
├── .env                    # Environment variables
├── .gitignore              # Git ignore rules
│
├── crud/                   # CRUD interface
│   ├── index.html          # Data management UI
│   └── app.js              # CRUD operations logic
│
└── monitoring/             # Additional monitoring tools
    ├── index.html
    └── app.js
```

## 🎯 Features in Detail

### 1. Real-time Data Table (index.html)

- **Live Updates**: Automatically refreshes when new data arrives from Firebase
- **Latest Statistics**: Shows current readings for pH, temperature, TDS, and NTU
- **Embedded Charts**: 10-point trend chart for quick analysis
- **Status Indicators**: Color-coded status based on water quality thresholds
- **Responsive Layout**: Optimized for desktop and mobile viewing

**Water Quality Thresholds:**
- pH: 6.5 - 8.5 (Optimal)
- Temperature: 20°C - 32°C (Optimal)
- NTU: ≤ 5 (Optimal)
- Status: 🟢 Good | 🟡 Warning | 🔴 Critical

### 2. Trend Charts (chart.html)

- **Multi-Axis Visualization**: Displays all parameters on synchronized timelines
- **Auto-Refresh**: Updates every 5 seconds from local cache
- **Data Range**: Shows last 20 readings
- **Sync Status**: Displays last sync time and service status
- **Interactive**: Hover tooltips for detailed values

### 3. CRUD Interface (crud/index.html)

- **Create**: Add new monitoring locations/stations
- **Read**: View all monitoring points with search
- **Update**: Edit location details and parameters
- **Delete**: Remove obsolete monitoring points
- **Real-time Sync**: All changes reflect immediately across all connected clients

### 4. Background Sync Service (sync-service.js)

**Features:**
- Runs as a Node.js background service
- Syncs Firebase data to local `data.json` every 60 seconds
- Automatic fallback from Admin SDK to REST API
- Graceful shutdown handling
- Console logging with timestamps
- Error handling and recovery

**How it works:**
```javascript
Firebase Database (every 1 min)
      ↓
   Fetch latest data (Admin SDK or REST)
      ↓
   Convert to array (sort, limit to 100)
      ↓
   Save to data.json with timestamp
      ↓
   Chart view polls data.json (every 5 sec)
```

## ⚙️ Configuration

### Firebase Admin SDK (Optional but Recommended)

For better performance and lower latency:

1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
2. Click **"Generate New Private Key"**
3. Save the downloaded JSON file as `firebase-service-account.json` in the project root
4. The sync service will automatically use Admin SDK

**Without Admin SDK:** The service automatically falls back to REST API (slower but functional).

### Sync Interval Configuration

To change the sync frequency, edit `sync-service.js`:

```javascript
// Line 155
setInterval(syncData, 60 * 1000); // Default: 60 seconds

// Examples:
setInterval(syncData, 30 * 1000);  // 30 seconds
setInterval(syncData, 120 * 1000); // 2 minutes
```

### Data Limits

Adjust data retention limits in these files:

- **Table View** (`firebase.js` → `setupListener`): Default 100 items
- **Chart View** (`chartpage.js` → `displayItems`): Default 20 items
- **Local Cache** (`sync-service.js` → `convertFirebaseToArray`): Default 100 items

### Firebase Database Rules

Recommended Firebase Realtime Database rules:

```json
{
  "rules": {
    "monitoring": {
      ".read": true,
      ".write": true,
      ".indexOn": ["waktu", "timestamp"]
    },
    "waterGuard": {
      "monitoring": {
        ".read": true,
        ".write": true,
        ".indexOn": ["timestamp"]
      }
    }
  }
}
```

## 🛠️ Development

### Running in Development Mode

```bash
# Start sync service with auto-restart (using nodemon)
npm install -g nodemon
nodemon sync-service.js

# Serve files with live reload (using live-server)
npm install -g live-server
live-server --port=8080
```

### Testing the Application

1. **Test Firebase Connection**
   - Open browser console (F12)
   - Look for "✅ Firebase initialized" message
   
2. **Test Sync Service**
   - Run `node sync-service.js`
   - Check for "✅ Updated data.json" messages
   - Verify `data.json` file exists and contains data

3. **Test Real-time Updates**
   - Open `index.html` in two browser windows
   - Add/edit data in `crud/index.html`
   - Verify both windows update automatically

## 🐛 Troubleshooting

### Chart Not Displaying Data

**Problem:** Chart page shows "No data available"

**Solutions:**
1. ✅ Verify sync service is running: `node sync-service.js`
2. ✅ Check if `data.json` exists and has data
3. ✅ Open browser console (F12) to check for JavaScript errors
4. ✅ Ensure Chart.js CDN is loading (check Network tab)

### Sync Service Errors

**Problem:** `Cannot find module 'firebase-admin'`
```bash
npm install firebase-admin
```

**Problem:** `Service account key not found`
- Service will fallback to REST API automatically
- For better performance, add `firebase-service-account.json` (see Configuration)

**Problem:** `Permission denied` on Firebase
- Check Firebase Realtime Database rules
- Ensure `.read` is set to `true` for testing

### Data Not Updating

1. **Check sync service status**
   ```bash
   # Verify service is running
   ps aux | grep "node sync-service.js"
   ```

2. **Verify Firebase connection**
   - Open Firebase Console → Realtime Database
   - Check if data exists under `monitoring` node

3. **Check browser console**
   - Press F12 → Console tab
   - Look for error messages

4. **Restart services**
   ```bash
   # Stop service (Ctrl+C)
   # Clear cache
   rm data.json
   # Restart
   node sync-service.js
   ```

### CORS Errors

If you see CORS errors in browser console:

1. Use a local web server (don't open HTML files directly)
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server -p 8000
   ```

2. Access via `http://localhost:8000/index.html`

## 📊 Data Format

### Firebase Data Structure

```json
{
  "monitoring": {
    "-N1234abcd": {
      "waktu": "2026-02-19T04:30:00.000Z",
      "ph": 7.2,
      "suhu": 26.5,
      "tds": 145,
      "ntu": 3.2
    }
  }
}
```

### Local Cache Format (data.json)

```json
{
  "lastUpdated": "2026-02-19T04:30:51.000Z",
  "items": [
    {
      "id": "-N1234abcd",
      "waktu": "2026-02-19T04:30:00.000Z",
      "ph": 7.2,
      "suhu": 26.5,
      "tds": 145,
      "ntu": 3.2
    }
  ]
}
```

## 🔐 Security Considerations

- **API Keys**: Never commit `firebase-service-account.json` to version control
- **Database Rules**: Use proper authentication in production
- **Environment Variables**: Store sensitive config in `.env` file
- **.gitignore**: Already configured to exclude sensitive files

## 🚀 Deployment

### Deploy to Web Server

1. Build and copy all files to web server
2. Set up Node.js service for `sync-service.js`
3. Configure process manager (PM2 recommended)

```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start sync-service.js --name water-guard-sync

# Enable auto-start on reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs water-guard-sync
```

### Deploy Frontend to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer: Not supported (use ES6+ features)

## 🛣️ Roadmap

- [ ] User authentication and authorization
- [ ] Export data to CSV/Excel
- [ ] Email/SMS alerts for critical readings
- [ ] Historical data analysis (weekly/monthly reports)
- [ ] Multi-location support with map view
- [ ] Mobile app (React Native/Flutter)
- [ ] API endpoints for third-party integration

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC License - Copyright © 2026 Nokensoft

## 🙏 Acknowledgments

- **Firebase** - Real-time database and hosting
- **Chart.js** - Beautiful data visualization
- **Tailwind CSS** - Utility-first CSS framework
- **Alpine.js** - Lightweight JavaScript framework

## 📞 Support

For issues, questions, or contributions:
- Create an issue in the repository
- Contact: Nokensoft Development Team

---

**Made with 💧 by Nokensoft © 2026**
