/** Small progress helpers for the home screen: daily goal and trainer summary (localStorage). */

export const DAILY_GOAL = 10;
const DAILY_KEY = 'rt-daily';
const LAST_KEY = 'rt-last-state';

function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function read(key) {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function write(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch { }
}

/** Number of hands finished today. */
export function getDailyCount() {
    try {
        const saved = JSON.parse(read(DAILY_KEY));
        return saved && saved.date === today() ? saved.count : 0;
    } catch {
        return 0;
    }
}

/** Counts one more finished hand for today. */
export function bumpDaily() {
    write(DAILY_KEY, JSON.stringify({ date: today(), count: getDailyCount() + 1 }));
}

/** Overall trainer numbers from the saved stats, or null when there are none yet. */
export function getTrainerSummary() {
    try {
        const stats = JSON.parse(read('stats'));
        if (!stats || !stats.totalTenpai) return null;
        const rate = stats.totalDiscards > 0 ? Math.round(stats.totalOptimalDiscards / stats.totalDiscards * 100) : 0;
        return { hands: stats.totalTenpai, rate: rate };
    } catch {
        return null;
    }
}

export function getLastState() {
    const value = parseInt(read(LAST_KEY), 10);
    return isNaN(value) ? null : value;
}

export function setLastState(id) {
    write(LAST_KEY, String(id));
}
