import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible } from '../components/ui';

/** Справка: короткие инструкции из существующих ключей перевода. */
function Help() {
    const { t } = useTranslation();
    const analyzer = [2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="rt-page rt-stack">
            <h2 className="rt-section-title">{t('app.help')}</h2>
            <p className="rt-muted">{t('app.helpIntro')}</p>

            <Collapsible title={t('menu.trainer')} icon="target" defaultOpen>
                <p className="rt-prose">{t('trainer.instructions')}</p>
                <p className="rt-prose rt-muted">{t('trainer.disclaimer')}</p>
            </Collapsible>

            <Collapsible title={t('menu.analyzer')} icon="search">
                <ol className="rt-prose">
                    {analyzer.map((n) => <li key={n}>{t('analyzer.instructions' + n)}</li>)}
                </ol>
            </Collapsible>

            <Collapsible title={t('menu.defense')} icon="shield">
                <p className="rt-prose">{t('defense.instructions')}</p>
            </Collapsible>

            <Collapsible title={t('menu.shanten')} icon="compass">
                <p className="rt-prose">{t('shanten.instructions')}</p>
            </Collapsible>

            <Collapsible title={t('menu.allLast')} icon="barChart">
                <p className="rt-prose">{t('allLast.loadInstructions')}</p>
            </Collapsible>
        </div>
    );
}

export default Help;
