import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n';
import Icon from './Icon';
import cx from './cx';
import styles from './Toast.module.css';

const ICONS = { info: 'info', success: 'check', warning: 'alert', error: 'alert' };

let listeners = [];
let nextId = 1;

/** Показать уведомление из любого места: showToast({ message, type, duration }). */
export function showToast(options) {
    const toast = {
        id: nextId++,
        message: options.message,
        type: options.type || 'info',
        duration: options.duration === undefined ? 3500 : options.duration,
    };
    listeners.forEach((listener) => listener({ kind: 'add', toast: toast }));
    return toast.id;
}

export function dismissToast(id) {
    listeners.forEach((listener) => listener({ kind: 'remove', id: id }));
}

/** Контейнер уведомлений. Монтируется один раз в корне приложения. */
export function ToastHost() {
    const { t } = useTranslation();
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    useEffect(() => {
        function remove(id) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }

        function listener(event) {
            if (event.kind === 'remove') {
                remove(event.id);
                return;
            }

            const toast = event.toast;
            setToasts((current) => current.concat(toast).slice(-3));

            if (toast.duration > 0) {
                timers.current[toast.id] = setTimeout(() => remove(toast.id), toast.duration);
            }
        }

        listeners.push(listener);

        return () => {
            listeners = listeners.filter((item) => item !== listener);
            Object.keys(timers.current).forEach((id) => clearTimeout(timers.current[id]));
            timers.current = {};
        };
    }, []);

    return (
        <div className={styles.host} aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cx(styles.toast, styles[toast.type])}
                    role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
                >
                    <Icon name={ICONS[toast.type] || 'info'} size={20} className={styles.icon} />
                    <span className={styles.message}>{toast.message}</span>
                    <button type="button" className={styles.close} aria-label={t('app.close')} onClick={() => dismissToast(toast.id)}>
                        <Icon name="close" size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ToastHost;
