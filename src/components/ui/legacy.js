/**
 * Drop-in replacements for the few reactstrap components the ported screens
 * still use. They render the same Bootstrap class names (styled by
 * styles/bootstrap-theme.css and the layout basics in styles/legacy.css), so
 * the screens look as before without Bootstrap itself. Screens drop them as
 * they move to the UI kit.
 */
import React, { useEffect, useRef } from 'react';
import cx from './cx';

export function Container({ className, ...rest }) {
    return <div className={cx('container', className)} {...rest} />;
}

export function Row({ className, ...rest }) {
    return <div className={cx('row', className)} {...rest} />;
}

export function Col({ className, xs, sm, md, lg, ...rest }) {
    return <div className={cx('col', className)} {...rest} />;
}

export function Label({ className, for: htmlFor, check, ...rest }) {
    return <label className={className} htmlFor={htmlFor} {...rest} />;
}

export const Input = React.forwardRef(function Input({ className, type = 'text', ...rest }, ref) {
    const check = type === 'checkbox' || type === 'radio';
    return <input ref={ref} type={type} className={cx(check ? 'form-check-input' : 'form-control', className)} {...rest} />;
});

export function InputGroup({ className, ...rest }) {
    return <div className={cx('input-group', className)} {...rest} />;
}

export function InputGroupAddon({ addonType = 'prepend', className, ...rest }) {
    return <div className={cx('input-group-' + addonType, className)} {...rest} />;
}

export function ListGroup({ className, ...rest }) {
    return <ul className={cx('list-group', className)} {...rest} />;
}

export function ListGroupItem({ className, ...rest }) {
    return <li className={cx('list-group-item', className)} {...rest} />;
}

/** Content stays mounted; hidden while closed (like reactstrap's Collapse). */
export function Collapse({ isOpen, className, children, ...rest }) {
    return (
        <div className={cx('collapse', isOpen && 'show', className)} hidden={!isOpen} {...rest}>
            {children}
        </div>
    );
}

export function Button({ color = 'secondary', className, block, size, ...rest }) {
    return <button type="button" className={cx('btn', 'btn-' + color, block && 'btn-block', size && 'btn-' + size, className)} {...rest} />;
}

const DropdownContext = React.createContext({ isOpen: false, toggle: () => {} });

/** Closes on an outside tap, like reactstrap's Dropdown. */
export function Dropdown({ isOpen, toggle, className, children }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!isOpen) return undefined;
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) toggle();
        };
        document.addEventListener('pointerdown', onDown);
        return () => document.removeEventListener('pointerdown', onDown);
    }, [isOpen, toggle]);
    return (
        <DropdownContext.Provider value={{ isOpen, toggle }}>
            <div ref={ref} className={cx('dropdown', isOpen && 'show', className)}>{children}</div>
        </DropdownContext.Provider>
    );
}

export function DropdownToggle({ caret, className, children, ...rest }) {
    const { isOpen, toggle } = React.useContext(DropdownContext);
    return (
        <button type="button" className={cx('btn', 'btn-secondary', caret && 'dropdown-toggle', className)}
            aria-haspopup="true" aria-expanded={isOpen ? 'true' : 'false'} onClick={toggle} {...rest}>
            {children}
        </button>
    );
}

export function DropdownMenu({ className, children }) {
    const { isOpen } = React.useContext(DropdownContext);
    return isOpen ? <div className={cx('dropdown-menu', 'show', className)} role="menu">{children}</div> : null;
}

export function DropdownItem({ className, onClick, disabled, children }) {
    const { toggle } = React.useContext(DropdownContext);
    return (
        <button type="button" role="menuitem" className={cx('dropdown-item', disabled && 'disabled', className)} disabled={disabled}
            onClick={(e) => { if (onClick) onClick(e); toggle(); }}>
            {children}
        </button>
    );
}
