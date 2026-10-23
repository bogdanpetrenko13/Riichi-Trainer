import React, { useMemo, useState } from 'react';
import { useTranslation } from '../i18n';
import { Icon } from '../components/ui';
import { GLOSSARY, GLOSSARY_CATEGORIES, searchGlossary } from '../data/glossary';

/** Глоссарий: поиск по названию, синонимам и определению + фильтр по категориям. */
function Glossary() {
    const { t, i18n } = useTranslation();
    const language = i18n.language === 'ru' ? 'ru' : 'en';
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');

    const entries = useMemo(() => {
        const inCategory = category === 'all' ? GLOSSARY : GLOSSARY.filter((entry) => entry.cat === category);
        return searchGlossary(inCategory, query, language);
    }, [query, category, language]);

    const categories = ['all'].concat(GLOSSARY_CATEGORIES);

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
                    onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                    <button type="button" className="rt-search__clear" aria-label={t('glossary.clear')} onClick={() => setQuery('')}>
                        <Icon name="close" size={18} />
                    </button>
                ) : null}
            </label>

            <div className="rt-filters" role="tablist" aria-label={t('glossary.categories')}>
                {categories.map((id) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={category === id ? 'true' : 'false'}
                        className={'rt-filter' + (category === id ? ' rt-filter--on' : '')}
                        onClick={() => setCategory(id)}
                    >
                        {t('glossary.cat.' + id)}
                    </button>
                ))}
            </div>

            <p className="rt-muted rt-glossary__count" aria-live="polite">{t('glossary.count', { count: entries.length })}</p>

            {entries.length === 0 ? (
                <div className="rt-empty">{t('glossary.empty')}</div>
            ) : (
                <ul className="rt-terms">
                    {entries.map((entry) => {
                        const text = entry[language];
                        return (
                            <li key={entry.id} className="rt-term">
                                <div className="rt-term__head">
                                    <strong className="rt-term__name">{text.term}</strong>
                                    {entry.ja ? <span className="rt-term__ja" lang="ja">{entry.ja}</span> : null}
                                </div>
                                <p className="rt-term__def">{text.def}</p>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default Glossary;
