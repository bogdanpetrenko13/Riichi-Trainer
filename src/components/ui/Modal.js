import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../../i18n';
import Button from './Button';
import cx from './cx';
import styles from './Modal.module.css';

let counter = 0;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Диалог: role="dialog", aria-modal, закрытие по Esc и клику на фон, возврат фокуса.
 * На телефоне выезжает снизу (bottom sheet), на планшете появляется по центру.
 */
function Modal(props) {
    const { open, onClose, title, footer, children, className } = props;
    const { t } = useTranslation();

    const [mounted, setMounted] = useState(open);
    const [closing, setClosing] = useState(false);
    const dialogRef = useRef(null);
    const returnFocusRef = useRef(null);
    const idRef = useRef(null);
    if (idRef.current === null) {
        counter += 1;
        idRef.current = 'rt-modal-title-' + counter;
    }

    // Плавное закрытие: сначала анимация, затем размонтирование
    useEffect(() => {
        if (open) {
            setMounted(true);
            setClosing(false);
            return undefined;
        }

        if (!mounted) return undefined;

        setClosing(true);
        const timer = setTimeout(() => {
            setMounted(false);
            setClosing(false);
        }, 180);

        return () => clearTimeout(timer);
    }, [open, mounted]);

    // Фокус, блокировка прокрутки и Esc, пока диалог на экране
    useEffect(() => {
        if (!open) return undefined;

        returnFocusRef.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const focusTimer = setTimeout(() => {
            if (dialogRef.current) dialogRef.current.focus();
        }, 0);

        function onKeyDown(event) {
            if (event.key === 'Escape' && onClose) {
                event.stopPropagation();
                onClose();
            }
        }

        document.addEventListener('keydown', onKeyDown);

        return () => {
            clearTimeout(focusTimer);
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;

            const target = returnFocusRef.current;
            if (target && typeof target.focus === 'function') target.focus();
        };
    }, [open, onClose]);

    if (!mounted) return null;

    function trapTab(event) {
        if (event.key !== 'Tab' || !dialogRef.current) return;

        const items = dialogRef.current.querySelectorAll(FOCUSABLE);
        if (items.length === 0) {
            event.preventDefault();
            return;
        }

        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function onBackdropMouseDown(event) {
        if (event.target === event.currentTarget && onClose) onClose();
    }

    return ReactDOM.createPortal(
        <div className={cx(styles.backdrop, closing && styles.closing)} onMouseDown={onBackdropMouseDown}>
            <div
                ref={dialogRef}
                className={cx(styles.dialog, closing && styles.closing, className)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? idRef.current : undefined}
                tabIndex={-1}
                onKeyDown={trapTab}
            >
                {title ? (
                    <header className={styles.header}>
                        <h2 id={idRef.current} className={styles.title}>{title}</h2>
                        <Button variant="ghost" icon="close" aria-label={t('app.close')} onClick={onClose} />
                    </header>
                ) : null}
                <div className={styles.body}>{children}</div>
                {footer ? <footer className={styles.footer}>{footer}</footer> : null}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
