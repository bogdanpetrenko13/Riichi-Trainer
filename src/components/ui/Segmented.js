import React, { useRef } from 'react';
import Icon from './Icon';
import cx from './cx';
import styles from './Segmented.module.css';

/**
 * Сегментированный переключатель с «скользящей» пилюлей.
 * role="tablist" — для вкладок, role="radiogroup" — для выбора одного значения.
 * options: [{ value, label, icon, id, controls }]
 */
function Segmented(props) {
    const { options, value, onChange, role = 'radiogroup', ariaLabel, className } = props;
    const containerRef = useRef(null);

    const isTabs = role === 'tablist';
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

    function onKeyDown(event) {
        const key = event.key;
        let next = -1;

        if (key === 'ArrowRight' || key === 'ArrowDown') next = (selectedIndex + 1) % options.length;
        else if (key === 'ArrowLeft' || key === 'ArrowUp') next = (selectedIndex - 1 + options.length) % options.length;
        else if (key === 'Home') next = 0;
        else if (key === 'End') next = options.length - 1;

        if (next < 0) return;

        event.preventDefault();
        onChange(options[next].value);

        const buttons = containerRef.current ? containerRef.current.querySelectorAll('button') : [];
        if (buttons[next]) buttons[next].focus();
    }

    return (
        <div
            ref={containerRef}
            className={cx(styles.segmented, className)}
            role={role}
            aria-label={ariaLabel}
            style={{ '--rt-seg-count': options.length, '--rt-seg-index': selectedIndex }}
            onKeyDown={onKeyDown}
        >
            <span className={styles.indicator} aria-hidden="true" />
            {options.map((option, index) => {
                const selected = index === selectedIndex;
                const stateProps = isTabs
                    ? { role: 'tab', 'aria-selected': selected ? 'true' : 'false', 'aria-controls': option.controls }
                    : { role: 'radio', 'aria-checked': selected ? 'true' : 'false' };

                return (
                    <button
                        key={option.value}
                        id={option.id}
                        type="button"
                        className={cx(styles.option, selected && styles.selected)}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        {...stateProps}
                    >
                        {option.icon ? <Icon name={option.icon} size={18} /> : null}
                        <span className={styles.text}>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default Segmented;
