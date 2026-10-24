import React, { useMemo, useState } from 'react';
import { useTranslation } from '../i18n';
import { Button, Collapsible, Icon, NumberField, Segmented } from '../components/ui';
import { MELD_FU, WAITS, calculateFu, calculatePayment, emptyMelds } from '../scripts/ScoreCounter';

const MELD_KINDS = Object.keys(MELD_FU);

const INITIAL = {
    dealer: 'ko',
    mode: 'han',
    han: 3,
    yakuman: 1,
    open: false,
    special: 'none',
    melds: emptyMelds(),
    pair: 0,
    wait: 'ryanmen',
    kiriage: false,
};

/** Малый счётчик «− n +» для сетов. */
function Counter({ value, onChange, canAdd, label }) {
    return (
        <span className="rt-mini" role="group" aria-label={label}>
            <button type="button" aria-label="−" disabled={value <= 0} onClick={() => onChange(value - 1)}>
                <Icon name="minus" size={16} />
            </button>
            <output>{value}</output>
            <button type="button" aria-label="+" disabled={!canAdd} onClick={() => onChange(value + 1)}>
                <Icon name="plus" size={16} />
            </button>
        </span>
    );
}

/** Группа взаимоисключающих кнопок (для 4–5 вариантов в сетке). */
function Choice({ options, value, onChange, ariaLabel }) {
    return (
        <div className="rt-opts" role="radiogroup" aria-label={ariaLabel}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={value === option.value ? 'true' : 'false'}
                    className={'rt-opts__item' + (value === option.value ? ' rt-opts__item--on' : '')}
                    onClick={() => onChange(option.value)}
                >
                    <span>{option.label}</span>
                    {option.sub ? <small>{option.sub}</small> : null}
                </button>
            ))}
        </div>
    );
}

function ScoreCounter() {
    const { t, i18n } = useTranslation();
    const fmt = (n) => n.toLocaleString(i18n.language === 'ru' ? 'ru-RU' : 'en-US').replace(/\u00a0|\u202f/g, ' ');
    const [s, setS] = useState(INITIAL);

    const set = (patch) => setS((prev) => ({ ...prev, ...patch }));
    const isYakuman = s.mode === 'yakuman';
    const han = isYakuman ? 13 : s.han;
    const yakuman = isYakuman ? s.yakuman : 0;
    const setCount = MELD_KINDS.reduce((sum, kind) => sum + s.melds[kind][0] + s.melds[kind][1], 0);
    const special = s.open ? 'none' : s.special;

    const result = useMemo(() => {
        const fuInput = {
            open: s.open,
            pinfu: special === 'pinfu',
            chiitoitsu: special === 'chiitoitsu',
            melds: s.melds,
            pair: s.pair,
            wait: s.wait,
        };
        const ronFu = calculateFu({ ...fuInput, winType: 'ron' });
        const tsumoFu = calculateFu({ ...fuInput, winType: 'tsumo' });
        const dealer = s.dealer === 'oya';
        const common = { han, dealer, kiriage: s.kiriage, yakuman };
        return {
            ronFu,
            tsumoFu,
            ron: calculatePayment({ ...common, fu: ronFu.fu, tsumo: false }),
            tsumo: calculatePayment({ ...common, fu: tsumoFu.fu, tsumo: true }),
        };
    }, [s, han, yakuman, special]);

    const limit = result.ron.limit;
    const fuMatters = !isYakuman && han > 0 && han < 5;

    function setMeld(kind, index, value) {
        const next = s.melds[kind].slice();
        next[index] = value;
        set({ melds: { ...s.melds, [kind]: next } });
    }

    function partLabel(part) {
        if (MELD_FU[part.key]) {
            return t('counter.meld.' + part.key) + ' · ' + (part.closed ? t('counter.closed') : t('counter.openMeld')) + (part.count > 1 ? ' ×' + part.count : '');
        }
        return t('counter.part.' + part.key);
    }

    function renderBreakdown(info, title) {
        const sum = info.parts.reduce((total, part) => total + part.fu, 0);
        return (
            <div className="rt-fu">
                <h4>{title}</h4>
                <ul>
                    {info.parts.map((part, index) => (
                        <li key={index}><span>{partLabel(part)}</span><b className="rt-num">+{part.fu}</b></li>
                    ))}
                </ul>
                <p className="rt-fu__total">
                    {sum !== info.fu ? t('counter.rounded', { sum, fu: info.fu }) : t('counter.fuTotal', { fu: info.fu })}
                </p>
            </div>
        );
    }

    const headline = isYakuman
        ? t('counter.yakumanTimes', { count: s.yakuman })
        : han <= 0
            ? t('counter.noYaku')
            : fuMatters
                ? (result.ronFu.fu === result.tsumoFu.fu
                    ? t('counter.hanFu', { han, fu: result.ronFu.fu })
                    : t('counter.hanFuSplit', { han, ron: result.ronFu.fu, tsumo: result.tsumoFu.fu }))
                : t('counter.hanOnly', { han });

    const tsumoText = s.dealer === 'oya'
        ? fmt(result.tsumo.fromDealer) + ' ×3'
        : fmt(result.tsumo.fromOthers) + ' / ' + fmt(result.tsumo.fromDealer);

    const empty = !isYakuman && han <= 0;

    return (
        <div className="rt-page rt-counter">
            <Segmented
                ariaLabel={t('counter.player')}
                value={s.dealer}
                onChange={(value) => set({ dealer: value })}
                options={[{ value: 'ko', label: t('counter.nonDealer') }, { value: 'oya', label: t('counter.dealer') }]}
            />

            <h3 className="rt-label">{t('counter.han')}</h3>
            <div className="rt-quick rt-quick--han" role="group" aria-label={t('counter.hanCount')}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={'rt-quick__item' + (!isYakuman && s.han === value ? ' rt-quick__item--on' : '')}
                        onClick={() => set({ han: value, mode: 'han' })}
                    >
                        {value}
                    </button>
                ))}
                <button
                    type="button"
                    className={'rt-quick__item rt-quick__item--wide' + (isYakuman ? ' rt-quick__item--on' : '')}
                    onClick={() => set({ mode: 'yakuman' })}
                >
                    {t('counter.yakuman')}
                </button>
            </div>
            {isYakuman ? (
                <div className="rt-counter__line">
                    <span>{t('counter.yakumanCount')}</span>
                    <NumberField id="counter-yakuman" min={1} max={6} value={s.yakuman} onChange={(value) => set({ yakuman: value })} />
                </div>
            ) : null}
            {!isYakuman && han >= 13 ? <p className="rt-hint">{t('counter.kazoeNote')}</p> : null}
            {!isYakuman && han >= 5 ? <p className="rt-hint">{t('counter.fuIgnored')}</p> : null}

            {fuMatters ? (
                <>
                    <h3 className="rt-label">{t('counter.handType')}</h3>
                    <Segmented
                        ariaLabel={t('counter.handType')}
                        value={s.open ? 'open' : 'closed'}
                        onChange={(value) => set({ open: value === 'open' })}
                        options={[{ value: 'closed', label: t('counter.closedHand') }, { value: 'open', label: t('counter.openHand') }]}
                    />

                    {!s.open ? (
                        <Choice
                            ariaLabel={t('counter.special')}
                            value={special}
                            onChange={(value) => set({ special: value })}
                            options={[
                                { value: 'none', label: t('counter.specialNone') },
                                { value: 'pinfu', label: t('counter.pinfu'), sub: t('counter.pinfuSub') },
                                { value: 'chiitoitsu', label: t('counter.chiitoitsu'), sub: t('counter.chiitoitsuSub') },
                            ]}
                        />
                    ) : null}

                    {special === 'none' ? (
                        <>
                            <h3 className="rt-label">{t('counter.sets')}</h3>
                            <div className="rt-melds">
                                <div className="rt-melds__head">
                                    <span />
                                    <span>{t('counter.closed')}</span>
                                    <span>{t('counter.openMeld')}</span>
                                </div>
                                {MELD_KINDS.map((kind) => (
                                    <div key={kind} className="rt-melds__row">
                                        <span>
                                            {t('counter.meld.' + kind)}
                                            <small>{t('counter.meldFu', { closed: MELD_FU[kind][0], open: MELD_FU[kind][1] })}</small>
                                        </span>
                                        {[0, 1].map((index) => (
                                            <Counter
                                                key={index}
                                                label={t('counter.meld.' + kind) + ' · ' + (index === 0 ? t('counter.closed') : t('counter.openMeld'))}
                                                value={s.melds[kind][index]}
                                                canAdd={setCount < 4}
                                                onChange={(value) => setMeld(kind, index, value)}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <h3 className="rt-label">{t('counter.pair')}</h3>
                            <Segmented
                                ariaLabel={t('counter.pair')}
                                value={s.pair}
                                onChange={(value) => set({ pair: value })}
                                options={[
                                    { value: 0, label: t('counter.pairNone') },
                                    { value: 2, label: t('counter.pairYakuhai') },
                                    { value: 4, label: t('counter.pairDouble') },
                                ]}
                            />

                            <h3 className="rt-label">{t('counter.wait')}</h3>
                            <Choice
                                ariaLabel={t('counter.wait')}
                                value={s.wait}
                                onChange={(value) => set({ wait: value })}
                                options={WAITS.map((wait) => ({
                                    value: wait,
                                    label: t('counter.waits.' + wait),
                                    sub: wait === 'ryanmen' || wait === 'shanpon' ? '0' : '+2',
                                }))}
                            />
                            <p className="rt-hint">{t('counter.waitHint')}</p>
                        </>
                    ) : null}
                </>
            ) : null}

            <Collapsible title={t('counter.rules')} icon="sliders">
                <label className="rt-check rt-check--flat">
                    <input type="checkbox" checked={s.kiriage} onChange={(event) => set({ kiriage: event.target.checked })} />
                    <span>
                        {t('counter.kiriage')}
                        <small>{t('counter.kiriageHint')}</small>
                    </span>
                </label>
            </Collapsible>

            {fuMatters ? (
                <Collapsible title={t('counter.breakdown')} icon="list">
                    {renderBreakdown(result.ronFu, t('counter.ron'))}
                    {renderBreakdown(result.tsumoFu, t('counter.tsumo'))}
                </Collapsible>
            ) : null}

            <Collapsible title={t('counter.how')} icon="info">
                <div className="rt-prose">
                    <p>{t('counter.howBase')}</p>
                    <p>{t('counter.howPay')}</p>
                    <p>{t('counter.howLimits')}</p>
                    <p>{t('counter.howFu')}</p>
                </div>
            </Collapsible>

            <Button variant="ghost" icon="refresh" block onClick={() => setS(INITIAL)}>{t('counter.reset')}</Button>

            <section className="rt-resultbar" aria-live="polite">
                <div className="rt-resultbar__main">
                    <span className="rt-resultbar__head">
                        {headline}
                        {limit ? <span className="rt-limit">{t('counter.limit.' + limit)}</span> : null}
                    </span>
                    <span className="rt-resultbar__ron">
                        {t('counter.ron')} <b className="rt-num">{empty ? '—' : fmt(result.ron.ron)}</b>
                    </span>
                </div>
                <div className="rt-resultbar__side">
                    <span>{t('counter.tsumo')}</span>
                    <b className="rt-num">{empty ? '—' : tsumoText}</b>
                </div>
            </section>
        </div>
    );
}

export default ScoreCounter;
