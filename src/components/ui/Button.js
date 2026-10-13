import React from 'react';
import Icon from './Icon';
import cx from './cx';
import styles from './Button.module.css';

/**
 * Единая кнопка.
 * variant: primary | accent | secondary | ghost | danger | success | link
 * size: sm (36px) | md (44px) | lg (52px)
 * Без children превращается в квадратную иконочную кнопку (нужен aria-label).
 */
const Button = React.forwardRef(function Button(props, ref) {
    const {
        variant = 'secondary',
        size = 'md',
        block = false,
        loading = false,
        icon,
        iconRight,
        disabled,
        type = 'button',
        className,
        children,
        ...rest
    } = props;

    const hasLabel = children !== undefined && children !== null && children !== false;

    return (
        <button
            ref={ref}
            type={type}
            className={cx(
                styles.btn,
                styles[variant],
                styles[size],
                block && styles.block,
                loading && styles.loading,
                !hasLabel && styles.iconOnly,
                className
            )}
            disabled={disabled || loading}
            aria-busy={loading ? 'true' : undefined}
            {...rest}
        >
            {loading ? <span className={styles.spinner} aria-hidden="true" /> : (icon ? <Icon name={icon} size={18} /> : null)}
            {hasLabel ? <span className={styles.label}>{children}</span> : null}
            {iconRight && !loading ? <Icon name={iconRight} size={18} /> : null}
        </button>
    );
});

export default Button;
