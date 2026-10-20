import React from 'react';
import { useTranslation } from '../i18n';
import { Button, cx } from './ui';
import Tile from './Tile';

/**
 * Review after a discard: one bar per distinct tile, marked "yours" and "best".
 * rows: [{ tile, value }]; format(value) gives the label; lines are the "Why?" explanation.
 */
function ReviewPanel({ rows, chosen, best, format, lines, whyOpen, onToggleWhy, onNext, maxValue }) {
    const { t } = useTranslation();
    const max = maxValue || Math.max(1, ...rows.map((row) => row.value));

    return (
        <section className="rt-review" aria-live="polite">
            <h3 className="rt-review__title">{t('play.review')}</h3>
            <ul className="rt-review__list">
                {rows.map((row) => (
                    <li key={row.tile} className={cx('rt-review__row', row.tile === chosen && 'is-chosen', row.tile === best && 'is-best')}>
                        <Tile className="discardTile" tile={row.tile} />
                        <div className="rt-review__bar" aria-hidden="true"><span style={{ width: (row.value / max * 100) + '%' }} /></div>
                        <span className="rt-num rt-review__value">{format ? format(row.value) : row.value}</span>
                        <span className="rt-review__badges">
                            {row.tile === chosen ? <span className="rt-badge rt-badge--you">{t('play.you')}</span> : null}
                            {row.tile === best ? <span className="rt-badge rt-badge--best">{t('play.best')}</span> : null}
                        </span>
                    </li>
                ))}
            </ul>
            {whyOpen ? (
                <div className="rt-review__why">{lines.map((line, index) => <p key={index}>{line}</p>)}</div>
            ) : null}
            <div className="rt-review__actions">
                <Button size="sm" variant="secondary" onClick={onToggleWhy}>{t('play.why')}</Button>
                <Button size="sm" variant="primary" iconRight="chevronRight" onClick={onNext}>{t('play.next')}</Button>
            </div>
        </section>
    );
}

export default ReviewPanel;
