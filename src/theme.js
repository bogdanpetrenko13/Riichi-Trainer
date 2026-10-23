// Хранение и применение пользовательских настроек внешнего вида:
// тема (light | dark | system) и размер тайлов (s | m | l).
// Класс темы ставится на <html>: theme-light / theme-dark.

const THEME_KEY = 'rt-theme';
const TILE_KEY = 'rt-tile-size';
const THEME_COLORS = { light: '#f7f4ec', dark: '#1c1f1d' };

export const THEMES = ['light', 'dark', 'system'];
export const TILE_SIZES = ['s', 'm', 'l'];

function readStorage(key, fallback) {
    try {
        const value = window.localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch (e) {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch (e) { }
}

function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function getThemePreference() {
    const value = readStorage(THEME_KEY, 'system');
    return THEMES.indexOf(value) > -1 ? value : 'light';
}

export function resolveTheme(preference) {
    if (preference === 'system') return systemPrefersDark() ? 'dark' : 'light';
    return preference === 'dark' ? 'dark' : 'light';
}

export function applyTheme(preference) {
    const resolved = resolveTheme(preference);
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add('theme-' + resolved);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[resolved]);

    return resolved;
}

export function setThemePreference(preference) {
    writeStorage(THEME_KEY, preference);
    return applyTheme(preference);
}

export function getTileSize() {
    const value = readStorage(TILE_KEY, 'm');
    return TILE_SIZES.indexOf(value) > -1 ? value : 'm';
}

export function applyTileSize(size) {
    const root = document.documentElement;
    root.classList.remove('tiles-s', 'tiles-m', 'tiles-l');
    root.classList.add('tiles-' + size);
}

export function setTileSize(size) {
    writeStorage(TILE_KEY, size);
    applyTileSize(size);
}

/** Вызывается один раз при старте приложения, до первого рендера. */
export function initAppearance() {
    applyTheme(getThemePreference());
    applyTileSize(getTileSize());

    if (window.matchMedia) {
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = function () {
            if (getThemePreference() === 'system') applyTheme('system');
        };

        if (query.addEventListener) query.addEventListener('change', listener);
        else if (query.addListener) query.addListener(listener);
    }
}
