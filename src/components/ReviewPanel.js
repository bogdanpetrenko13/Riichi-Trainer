import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n';
import { Button, cx } from './ui';
import Tile from './Tile';

/**
 * Review after a discard: one bar per distinct tile, marked "yours" and "best".
 * rows: [{ tile, value }]; format(value) gives the label; lines are the "Why?" explanation.
 */
function ReviewPanel({ rows, chosen, best, format, lines, whyOpen, onToggleWhy, onNext, maxValue, hinted, insight, worsened }) {
    const { t } = useTranslation();
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && ref.current.scrollIntoView) ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, []);
    const max = maxValue || Math.max(1, ...rows.map((row) => row.value));

    return (
        <section className="rt-review" aria-live="polite" ref={ref}>
            {worsened ? (
                <div className="rt-alertbox" role="alert">
                    <strong>{t('play.worsenedTitle')}</strong>
                    <span>{t(worsened.before === 0 ? 'play.worsenedTenpai' : 'play.worsened', { before: worsened.before, after: worsened.after })}</span>
                </div>
            ) : null}
            <h3 className="rt-review__title">{t('play.review')}</h3>
            {hinted ? <p className="rt-review__note">{t('play.hintedNote')}</p> : null}
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
            {insight ? <p className="rt-review__insight">{t('play.insight.' + insight.key, insight.params)}</p> : null}
            {whyOpen && insight && insight.lost.length > 0 ? (
                <div className="rt-review__tiles">
                    <span>{t('play.insight.lostLabel')}</span>
                    <div>{insight.lost.map((tile) => <Tile key={tile} className="discardTile" tile={tile} />)}</div>
                </div>
            ) : null}
            {whyOpen && insight && insight.gained.length > 0 ? (
                <div className="rt-review__tiles">
                    <span>{t('play.insight.gainedLabel')}</span>
                    <div>{insight.gained.map((tile) => <Tile key={tile} className="discardTile" tile={tile} />)}</div>
                </div>
            ) : null}
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
