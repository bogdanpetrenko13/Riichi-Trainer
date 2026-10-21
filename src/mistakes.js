/**
 * Mistake deck: hands (the 14 tiles before the discard) where the player chose a worse discard.
 * They come back later; two correct answers in a row retire a hand. Stored in localStorage.
 */
const KEY = 'rt-mistakes';
const MAX_ITEMS = 50;
const RETIRE_AFTER = 2;

function load() {
    try {
        const list = JSON.parse(window.localStorage.getItem(KEY));
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function save(list) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
    } catch { }
}

/** Identity of a hand: its tile counts. */
export function mistakeKey(hand) {
    return hand.join(',');
}

export function getMistakes() {
    return load();
}

export function countMistakes() {
    return load().length;
}

/** Records a mistake (a repeated hand just goes back to the start of its streak). */
export function addMistake(item) {
    const list = load();
    const key = mistakeKey(item.hand);
    const existing = list.findIndex((entry) => mistakeKey(entry.hand) === key);
    if (existing >= 0) list.splice(existing, 1);
    list.unshift({ ...item, streak: 0, added: Date.now() });
    save(list);
}

/** Registers the result of a repeated hand. Returns true when the hand left the deck. */
export function resolveMistake(hand, correct) {
    const list = load();
    const key = mistakeKey(hand);
    const index = list.findIndex((entry) => mistakeKey(entry.hand) === key);
    if (index < 0) return false;

    if (!correct) {
        list[index].streak = 0;
        save(list);
        return false;
    }

    list[index].streak = (list[index].streak || 0) + 1;
    const retired = list[index].streak >= RETIRE_AFTER;
    if (retired) list.splice(index, 1);
    save(list);
    return retired;
}

/** Picks the next hand to repeat: the least practised first, ties go to the oldest. */
export function pickMistake(excludeKey) {
    const list = load().filter((entry) => mistakeKey(entry.hand) !== excludeKey);
    const pool = list.length ? list : load();
    if (!pool.length) return null;
    return pool.slice().sort((a, b) => (a.streak || 0) - (b.streak || 0) || a.added - b.added)[0];
}

/** The Home screen sets this so the trainer starts with a mistake. */
export function requestRepeat() {
    try { window.localStorage.setItem('rt-start-repeat', '1'); } catch { }
}

export function consumeRepeatRequest() {
    try {
        const wanted = window.localStorage.getItem('rt-start-repeat') === '1';
        window.localStorage.removeItem('rt-start-repeat');
        return wanted;
    } catch {
        return false;
    }
}
