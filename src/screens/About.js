import React from 'react';
import { useTranslation } from '../i18n';
import { Card } from '../components/ui';

/** О приложении и благодарности (ключи credits.* без изменений). */
function About() {
    const { t } = useTranslation();

    return (
        <div className="rt-page rt-stack">
            <h2 className="rt-section-title">{t('app.about')}</h2>

            <Card title={t('app.name')} icon="tile">
                <p className="rt-prose">{t('app.aboutText')}</p>
            </Card>

            <Card title={t('credits.label')} icon="info">
                <ul className="rt-prose rt-lines" style={{ paddingLeft: 'var(--rt-space-5)' }}>
                    <li>
                        {t('credits.tilesPreLink')} <a href="https://github.com/FluffyStuff/riichi-mahjong-tiles">{t('credits.tilesLinkText')}</a>
                        {t('credits.tilesPostLink')}<a href="https://creativecommons.org/licenses/by/4.0/">{t('credits.ccLinkText')}</a>
                    </li>
                    <li>
                        {t('credits.shantenPreLink')}<a href="http://cmj3.web.fc2.com/#syanten">{t('credits.shantenLinkText')}</a>{t('credits.shantenPostLink')}
                    </li>
                </ul>
            </Card>
        </div>
    );
}

export default About;
