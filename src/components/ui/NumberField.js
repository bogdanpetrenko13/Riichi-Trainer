import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n';
import Icon from './Icon';
import cx from './cx';
import styles from './NumberField.module.css';

/**
 * Числовое поле с кнопками − / + (зоны нажатия 44px).
 * Заменяет react-numeric-input и вызывает onChange с тем же набором аргументов:
 * onChange(число, строка, { id }).
 */
function NumberField(props) {
    const { id, min, max, step = 1, value, onChange, className } = props;
    const { t } = useTranslation();
    const [text, setText] = useState(String(value));

    useEffect(() => {
        setText(String(value));
    }, [value]);

    function clamp(number) {
        return Math.min(max, Math.max(min, number));
    }

    function commit(number) {
        const next = clamp(number);
        setText(String(next));
        if (next !== value && onChange) onChange(next, String(next), { id: id });
    }

    function onInput(event) {
        const raw = event.target.value.replace(/[^0-9]/g, '');
        setText(raw);

        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed >= min && parsed <= max && parsed !== value && onChange) {
            onChange(parsed, String(parsed), { id: id });
        }
    }

    function onBlur() {
        const parsed = parseInt(text, 10);
        if (isNaN(parsed)) setText(String(value));
        else commit(parsed);
    }

    function onKeyDown(event) {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            commit(value + step);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            commit(value - step);
        } else if (event.key === 'Enter') {
            event.target.blur();
        }
    }

    return (
        <div className={cx(styles.field, 'rt-number', className)}>
            <button
                type="button"
                className={styles.step}
                aria-label={t('app.decrease')}
                disabled={value <= min}
                onClick={() => commit(value - step)}
            >
                <Icon name="minus" size={18} />
            </button>
            <input
                id={id}
                className={cx(styles.input, 'rt-num')}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={text}
                onChange={onInput}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
            />
            <button
                type="button"
                className={styles.step}
                aria-label={t('app.increase')}
                disabled={value >= max}
                onClick={() => commit(value + step)}
            >
                <Icon name="plus" size={18} />
            </button>
        </div>
    );
}

export default NumberField;
