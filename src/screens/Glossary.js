import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n';
import { Icon } from '../components/ui';
import { GLOSSARY, GLOSSARY_CATEGORIES, parseTiles, searchGlossary } from '../data/glossary';
import { getTileImage } from '../scripts/TileConversions';

const SECTION_ICONS = {
    yaku: 'list', yakuman: 'target', waits: 'search', defense: 'shield', score: 'calculator',
    tiles: 'tile', calls: 'play', general: 'book', efficiency: 'compass', strategy: 'layers',
};
const RECENT_KEY = 'rt-gloss-recent';

function loadRecent() {
    try {
        const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        return Array.isArray(list) ? list.filter((id) => GLOSSARY[id]).slice(0, 5) : [];
    } catch (e) {
        return [];
    }
}

function saveRecent(list) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (e) { /* без хранилища работаем так же */ }
}

/** Хан на закрытой / открытой руке (для яку) или метка «якуман». */
function HanPills({ entry, t }) {
    if (!entry.han) return null;
    if (entry.cat === 'yakuman') {
        return entry.han[1] === null ? <span className="rt-pills"><i>{t('glossary.closedOnly')}</i></span> : null;
    }
    const [closed, open] = entry.han;
    if (closed === 0) return null;
    return (
        <span className="rt-pills" aria-label={t('glossary.hanLabel', { closed, open: open === null ? '—' : open })}>
            <i>{t('glossary.closedShort')} {closed}</i>
            <i className={open === null ? 'rt-pills__no' : ''}>{t('glossary.openShort')} {open === null ? '—' : open}</i>
        </span>
    );
}

function TermRow({ entry, language, open, onToggle, showSection, t }) {
    const text = entry[language];
    return (
        <li className={'rt-term' + (open ? ' rt-term--open' : '')}>
            <button type="button" className="rt-term__btn" aria-expanded={open ? 'true' : 'false'} onClick={() => onToggle(entry.id)}>
                <span className="rt-term__head">
                    <strong className="rt-term__name">{text.term}</strong>
                    {entry.ja ? <span className="rt-term__ja" lang="ja">{entry.ja}</span> : null}
                    <HanPills entry={entry} t={t} />
                    {showSection ? <span className="rt-term__cat">{t('glossary.cat.' + entry.cat)}</span> : null}
                </span>
                {!open ? <span className="rt-term__preview">{text.def}</span> : null}
            </button>
            {open ? (
                <div className="rt-term__body">
                    <p className="rt-term__def">{text.def}</p>
                    {entry.ex.map((example, index) => (
                        <div className="rt-ex" key={index} aria-label={t('glossary.example')}>
                            {parseTiles(example).map((group, g) => (
                                <span className="rt-ex__group" key={g}>
                                    {group.map((tile, i) => <img key={i} src={getTileImage(tile)} alt="" draggable="false" />)}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            ) : null}
        </li>
    );
}

/** Глоссарий: сетка разделов, внутри — список с раскрывающимися строками; поиск работает по всем разделам. */
function Glossary() {
    const { t, i18n } = useTranslation();
    const language = i18n.language === 'ru' ? 'ru' : 'en';
    const [query, setQuery] = useState('');
    const [section, setSection] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [recent, setRecent] = useState(loadRecent);

    useEffect(() => { window.scrollTo(0, 0); }, [section]);

    const counts = useMemo(() => {
        const result = {};
        GLOSSARY.forEach((entry) => { result[entry.cat] = (result[entry.cat] || 0) + 1; });
        return result;
    }, []);

    const searching = query.trim().length > 0;

    const entries = useMemo(() => {
        if (searching) return searchGlossary(GLOSSARY, query, language);
        if (section) return GLOSSARY.filter((entry) => entry.cat === section);
        return [];
    }, [query, section, language, searching]);

    function toggle(id) {
        const next = openId === id ? null : id;
        setOpenId(next);
        if (next !== null) {
            const list = [id].concat(recent.filter((other) => other !== id)).slice(0, 5);
            setRecent(list);
            saveRecent(list);
        }
    }

    function openSection(id, entryId) {
        setSection(id);
        setQuery('');
        setOpenId(entryId === undefined ? null : entryId);
    }

    // Яку в разделе группируются по ханам на закрытой руке.
    function renderList(list) {
        const rows = (items) => items.map((entry) => (
            <TermRow key={entry.id} entry={entry} language={language} open={openId === entry.id} onToggle={toggle} showSection={searching} t={t} />
        ));

        if (!searching && section === 'yaku') {
            const groups = [1, 2, 3, 6, 0];
            return groups.map((han) => {
                const items = list.filter((entry) => entry.han && entry.han[0] === han);
                if (items.length === 0) return null;
                return (
                    <React.Fragment key={han}>
                        <li className="rt-group" aria-hidden="true">{t('glossary.group.h' + han)}</li>
                        {rows(items)}
                    </React.Fragment>
                );
            });
        }
        return rows(list);
    }

    return (
        <div className="rt-page rt-glossary">
            <label className="rt-search">
                <Icon name="search" size={20} />
                <input
                    type="search"
                    value={query}
                    placeholder={t('glossary.search')}
                    aria-label={t('glossary.search')}
                    autoComplete="off"
                    onChange={(event) => { setQuery(event.target.value); setOpenId(null); }}
                />
                {query ? (
                    <button type="button" className="rt-search__clear" aria-label={t('glossary.clear')} onClick={() => setQuery('')}>
                        <Icon name="close" size={18} />
                    </button>
                ) : null}
            </label>

            {!searching && section === null ? (
                <>
                    <div className="rt-sections">
                        {GLOSSARY_CATEGORIES.map((id) => (
                            <button key={id} type="button" className="rt-section" onClick={() => openSection(id)}>
                                <Icon name={SECTION_ICONS[id]} size={24} />
                                <b>{t('glossary.cat.' + id)}</b>
                                <small>{t('glossary.cat.' + id + 'Sub', { count: counts[id] })}</small>
                            </button>
                        ))}
                    </div>
                    {recent.length > 0 ? (
                        <>
                            <h3 className="rt-section-title">{t('glossary.recent')}</h3>
                            <div className="rt-chips">
                                {recent.map((id) => (
                                    <button key={id} type="button" className="rt-chip rt-chip--btn" onClick={() => openSection(GLOSSARY[id].cat, id)}>
                                        {GLOSSARY[id][language].term}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : null}
                </>
            ) : (
                <>
                    {searching ? (
                        <p className="rt-muted rt-glossary__count" aria-live="polite">{t('glossary.count', { count: entries.length })}</p>
                    ) : (
                        <div className="rt-secbar">
                            <button type="button" className="rt-secbar__back" onClick={() => openSection(null)}>
                                <Icon name="chevronLeft" size={20} />
                                {t('glossary.sections')}
                            </button>
                            <b>{t('glossary.cat.' + section)}</b>
                            <span className="rt-muted">{entries.length}</span>
                        </div>
                    )}

                    {entries.length === 0 ? (
                        <div className="rt-empty">{t('glossary.empty')}</div>
                    ) : (
                        <ul className="rt-terms">{renderList(entries)}</ul>
                    )}
                </>
            )}
        </div>
    );
}

export default Glossary;
