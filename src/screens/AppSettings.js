import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Segmented, Icon, cx } from '../components/ui';
import { getThemePreference, setThemePreference, getTileSize, setTileSize } from '../theme';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'ru', label: 'Русский' },
    { code: 'fr', label: 'Français' },
    { code: 'pl', label: 'polski' },
    { code: 'pt', label: 'Português Brasileiro' },
    { code: 'zh_CN', label: '简体中文' },
    { code: 'ko', label: '한국어' },
    { code: 'de', label: 'Deutsch' },
];

/** Настройки приложения: тема, размер костей, язык. */
function AppSettings() {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState(getThemePreference());
    const [tileSize, setTile] = useState(getTileSize());

    function onTheme(value) {
        setThemePreference(value);
        setTheme(value);
    }

    function onTileSize(value) {
        setTileSize(value);
        setTile(value);
    }

    const current = (i18n.language || 'en').replace('-', '_');

    function isCurrent(code) {
        return current === code || (code === 'zh_CN' && current.indexOf('zh') === 0) || (code !== 'zh_CN' && current.split('_')[0] === code);
    }

    return (
        <div className="rt-page rt-stack">
            <h2 className="rt-section-title">{t('app.settings')}</h2>

            <Card title={t('app.appearance')} icon="sliders">
                <div className="rt-stack">
                    <div>
                        <div className="rt-muted rt-mb-2" id="rt-theme-label">{t('app.theme')}</div>
                        <Segmented
                            ariaLabel={t('app.theme')}
                            value={theme}
                            onChange={onTheme}
                            options={[
                                { value: 'light', label: t('app.themeLight'), icon: 'sun' },
                                { value: 'dark', label: t('app.themeDark'), icon: 'moon' },
                                { value: 'system', label: t('app.themeSystem'), icon: 'globe' },
                            ]}
                        />
                    </div>
                    <div>
                        <div className="rt-muted rt-mb-2" id="rt-tile-label">{t('app.tileSize')}</div>
                        <Segmented
                            ariaLabel={t('app.tileSize')}
                            value={tileSize}
                            onChange={onTileSize}
                            options={[
                                { value: 's', label: t('app.tileSmall') },
                                { value: 'm', label: t('app.tileMedium') },
                                { value: 'l', label: t('app.tileLarge') },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            <Card title={t('app.language')} icon="globe">
                <ul className="rt-lines" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {LANGUAGES.map((language) => {
                        const active = isCurrent(language.code);
                        return (
                            <li key={language.code}>
                                <button
                                    type="button"
                                    className={cx('rt-lang', active && 'rt-lang--active')}
                                    aria-pressed={active}
                                    lang={language.code.replace('_', '-')}
                                    onClick={() => i18n.changeLanguage(language.code)}
                                >
                                    <span>{language.label}</span>
                                    {active ? <Icon name="check" size={18} /> : null}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </Card>
        </div>
    );
}

export default AppSettings;
