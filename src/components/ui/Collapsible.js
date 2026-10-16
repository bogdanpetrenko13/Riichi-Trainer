import React, { useRef, useState } from 'react';
import { Collapse } from './legacy';
import Icon from './Icon';
import cx from './cx';
import styles from './Collapsible.module.css';

let counter = 0;

/**
 * Раскрывающаяся карточка с доступным заголовком-кнопкой (aria-expanded).
 * Работает в двух режимах: управляемом (open + onToggle) и самостоятельном (defaultOpen).
 * Содержимое остаётся в DOM и в закрытом состоянии, поэтому внутренние компоненты не размонтируются.
 */
function Collapsible(props) {
    const { title, icon, defaultOpen = false, open, onToggle, className, bodyClassName, children } = props;

    const [innerOpen, setInnerOpen] = useState(defaultOpen);
    const idRef = useRef(null);
    if (idRef.current === null) {
        counter += 1;
        idRef.current = 'rt-collapsible-' + counter;
    }

    const controlled = open !== undefined;
    const isOpen = controlled ? open : innerOpen;

    function toggle() {
        if (!controlled) setInnerOpen(!innerOpen);
        if (onToggle) onToggle(!isOpen);
    }

    return (
        <section className={cx(styles.box, isOpen && styles.open, className)}>
            <h3 className={styles.heading}>
                <button
                    type="button"
                    className={styles.trigger}
                    aria-expanded={isOpen ? 'true' : 'false'}
                    aria-controls={idRef.current}
                    onClick={toggle}
                >
                    {icon ? <Icon name={icon} size={20} className={styles.icon} /> : null}
                    <span className={styles.label}>{title}</span>
                    <Icon name="chevronDown" size={20} className={styles.chevron} />
                </button>
            </h3>
            <Collapse isOpen={isOpen}>
                <div id={idRef.current} className={cx(styles.body, bodyClassName)}>
                    {children}
                </div>
            </Collapse>
        </section>
    );
}

export default Collapsible;
