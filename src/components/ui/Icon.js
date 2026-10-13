import React from 'react';
import ICONS from '../../assets/icons';

/** Inline SVG-иконка. Без `title` скрыта от скринридеров (декоративная). */
function Icon(props) {
    const { name, size = 20, title, className, ...rest } = props;
    const path = ICONS[name];

    if (!path) return null;

    const accessibility = title
        ? { role: 'img', 'aria-label': title }
        : { 'aria-hidden': 'true', focusable: 'false' };

    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...accessibility}
            {...rest}
        >
            <path d={path} />
        </svg>
    );
}

export default Icon;
