import React from 'react';
import { useTranslation } from '../i18n';
import { Button, Icon } from '../components/ui';
import { DAILY_GOAL, getDailyCount, getTrainerSummary } from '../progress';

/**
 * Home screen: continue button, daily goal and cards for every exercise.
 * `exercises`: [{ id, label, icon, summary? }]; onOpen(id) opens one.
 */
function Home({ exercises, lastId, onOpen }) {
    const { t } = useTranslation();
    const done = getDailyCount();
    const percent = Math.min(100, Math.round(done / DAILY_GOAL * 100));
    const summary = getTrainerSummary();
    const last = exercises.find((exercise) => exercise.id === lastId);

    return (
        <div className="rt-page">
            <h2 className="rt-section-title">{t('home.title')}</h2>

            {last ? (
                <Button variant="accent" size="lg" block iconRight="chevronRight" onClick={() => onOpen(last.id)}>
                    {t('home.continue', { name: last.label })}
                </Button>
            ) : null}

            <section className="rt-goal" aria-label={t('home.goal')}>
                <div className="rt-goal__row">
                    <strong>{t('home.goal')}</strong>
                    <span className="rt-num">{t('home.goalValue', { done: Math.min(done, DAILY_GOAL), goal: DAILY_GOAL })}</span>
                </div>
                <div className="rt-bar rt-goal__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
                    <span style={{ width: percent + '%' }} />
                </div>
                <div className="rt-goal__row rt-muted">
                    <span>{t('home.accuracy')}</span>
                    <span>{summary ? summary.rate + '% · ' + t('home.hands', { count: summary.hands }) : t('home.noStats')}</span>
                </div>
            </section>

            <h3 className="rt-section-title">{t('home.exercises')}</h3>
            <div className="rt-cards">
                {exercises.map((exercise) => (
                    <button key={exercise.id} type="button" className="rt-excard" onClick={() => onOpen(exercise.id)}>
                        <Icon name={exercise.icon} size={28} />
                        <span className="rt-excard__label">{exercise.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Home;
