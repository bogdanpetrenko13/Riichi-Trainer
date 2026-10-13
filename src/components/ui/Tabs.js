import React, { useRef, useState } from 'react';
import Segmented from './Segmented';
import cx from './cx';
import styles from './Tabs.module.css';

let counter = 0;

/**
 * Вкладки: сегментированная полоса + панели.
 * tabs: [{ id, label, icon, content }]. Все панели остаются в DOM (скрыты атрибутом hidden),
 * поэтому состояние внутри панелей не теряется при переключении.
 */
function Tabs(props) {
    const { tabs, defaultValue, value, onChange, ariaLabel, className } = props;

    const [innerValue, setInnerValue] = useState(defaultValue !== undefined ? defaultValue : tabs[0].id);
    const idRef = useRef(null);
    if (idRef.current === null) {
        counter += 1;
        idRef.current = 'rt-tabs-' + counter;
    }

    const controlled = value !== undefined;
    const current = controlled ? value : innerValue;
    const prefix = idRef.current;

    function select(next) {
        if (!controlled) setInnerValue(next);
        if (onChange) onChange(next);
    }

    return (
        <div className={cx(styles.tabs, className)}>
            <Segmented
                role="tablist"
                ariaLabel={ariaLabel}
                value={current}
                onChange={select}
                options={tabs.map((tab) => ({
                    value: tab.id,
                    label: tab.label,
                    icon: tab.icon,
                    id: prefix + '-tab-' + tab.id,
                    controls: prefix + '-panel-' + tab.id,
                }))}
            />
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    id={prefix + '-panel-' + tab.id}
                    role="tabpanel"
                    aria-labelledby={prefix + '-tab-' + tab.id}
                    className={styles.panel}
                    hidden={tab.id !== current}
                >
                    {tab.content}
                </div>
            ))}
        </div>
    );
}

export default Tabs;
