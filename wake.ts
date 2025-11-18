/* Handle access to the WakeLock API */

let requestingWakeLock = false;
let wakeLock: WakeLockSentinel | null = null;
async function requestWakeLock() {
    if (requestingWakeLock) {
        // Avoid concurrent double-requests
        return;
    }

    try {
        requestingWakeLock = true;
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('WakeLock initialized');
    } catch (err) {
        console.warn('WakeLock request denied', err);
    } finally {
        requestingWakeLock = false;
    }
}

async function onVisibilityChange() {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
    }
}

// Keep screen lit indefinitely
export async function initWakeLock() {
    if (wakeLock !== null) { return; } // Already initialized

    if (!('wakeLock' in navigator && 'request' in navigator.wakeLock)) {
        console.log('WakeLock not supported');
        return;
    }

    await requestWakeLock();
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onVisibilityChange);
}
