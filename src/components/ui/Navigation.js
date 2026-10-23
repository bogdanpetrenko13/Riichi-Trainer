import React from 'react';
import Icon from './Icon';
import cx from './cx';
import styles from './Layout.module.css';

/** Верхняя панель: заголовок, слева/справа произвольные элементы. */
export function AppBar(props) {
    const { title, left, right } = props;

    return (
        <header className={styles.appbar}>
            <div className={styles.appbarInner}>
                <div className={styles.appbarSide}>{left}</div>
                <h1 className={styles.appbarTitle}>{title}</h1>
                <div className={cx(styles.appbarSide, styles.appbarRight)}>{right}</div>
            </div>
        </header>
    );
}

/**
 * Нижняя навигация (до 5 пунктов).
 * items: [{ id, label, icon }], activeId, onSelect(id).
 */
export function BottomNav(props) {
    const { items, activeId, onSelect, ariaLabel } = props;

    return (
        <nav className={styles.bottomnav} aria-label={ariaLabel}>
            <ul className={styles.bottomnavList} style={{ '--rt-nav-count': items.length }}>
                {items.map((item) => {
                    const active = item.id === activeId;
                    return (
                        <li key={item.id} className={styles.bottomnavItem}>
                            <button
                                type="button"
                                className={cx(styles.navButton, active && styles.navActive)}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => onSelect(item.id)}
                            >
                                <Icon name={item.icon} size={24} />
                                <span className={styles.navLabel}>{item.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
