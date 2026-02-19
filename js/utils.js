// Format time to readable format
export function formatTime(isoString) {
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
}

// Format time short (only time)
export function formatTimeShort(isoString) {
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'N/A';
    }
}

// Get status color for pH
export function getPhStatus(ph) {
    const phValue = parseFloat(ph);
    if (phValue >= 6.5 && phValue <= 8.5) {
        return 'font-bold text-green-600';
    } else if (phValue >= 6 || phValue <= 9) {
        return 'font-bold text-yellow-600';
    } else {
        return 'font-bold text-red-600';
    }
}

// Get status color for temperature
export function getTempStatus(temp) {
    const tempValue = parseFloat(temp);
    if (tempValue >= 20 && tempValue <= 32) {
        return 'font-bold text-green-600';
    } else if (tempValue >= 15 || tempValue <= 35) {
        return 'font-bold text-yellow-600';
    } else {
        return 'font-bold text-red-600';
    }
}

// Get status color for NTU (Turbidity)
export function getNtuStatus(ntu) {
    const ntuValue = parseFloat(ntu);
    if (ntuValue <= 5) {
        return 'font-bold text-green-600';
    } else if (ntuValue <= 10) {
        return 'font-bold text-yellow-600';
    } else {
        return 'font-bold text-red-600';
    }
}

// Get overall status badge class
export function getStatusBadgeClass(item) {
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
}

// Get overall status text
export function getOverallStatus(item) {
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
}

// Get current time formatted
export function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
