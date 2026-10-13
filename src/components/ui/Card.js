import React from 'react';
import Icon from './Icon';
import cx from './cx';
import styles from './Card.module.css';

/** Единая карточка: необязательные header (title, icon, actions), body и footer. */
function Card(props) {
    const {
        title,
        icon,
        actions,
        footer,
        interactive = false,
        as: Tag = 'section',
        className,
        bodyClassName,
        children,
        ...rest
    } = props;

    return (
        <Tag className={cx(styles.card, interactive && styles.interactive, className)} {...rest}>
            {(title || actions) ? (
                <header className={styles.header}>
                    {title ? (
                        <h3 className={styles.title}>
                            {icon ? <Icon name={icon} size={20} /> : null}
                            <span>{title}</span>
                        </h3>
                    ) : <span />}
                    {actions ? <div className={styles.actions}>{actions}</div> : null}
                </header>
            ) : null}
            <div className={cx(styles.body, bodyClassName)}>{children}</div>
            {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </Tag>
    );
}

export default Card;
