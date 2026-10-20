/** Trainer mode shared by all drills: "confirm" (select, then confirm) or "quick" (discard at once). */

const MODE_KEY = 'rt-trainer-mode';

export function getTrainerMode() {
    try {
        return window.localStorage.getItem(MODE_KEY) === 'quick' ? 'quick' : 'confirm';
    } catch {
        return 'confirm';
    }
}

export function setTrainerMode(mode) {
    try {
        window.localStorage.setItem(MODE_KEY, mode);
    } catch { }
}
