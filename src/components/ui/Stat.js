import React from 'react';
import cx from './cx';
import styles from './Stat.module.css';

/**
 * Плитка статистики: подпись, крупное число и (необязательно) полоска прогресса.
 * tone: primary | accent | success | info
 */
function Stat(props) {
    const { label, value, suffix, percent, tone = 'primary' } = props;

    let width = null;
    if (percent !== undefined && percent !== null && !isNaN(percent)) {
        width = Math.max(0, Math.min(100, percent));
    }

    return (
        <div className={styles.stat}>
            <div className={styles.label}>{label}</div>
            <div className={cx(styles.value, 'rt-num')}>
                {value}
                {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
            </div>
            {width !== null ? (
                <div className={styles.bar} aria-hidden="true">
                    <div className={cx(styles.fill, styles[tone])} style={{ width: width + '%' }} />
                </div>
            ) : null}
        </div>
    );
}

export default Stat;
