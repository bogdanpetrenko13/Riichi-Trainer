import React from 'react';
import { useTranslation } from '../i18n';
import { Segmented } from './ui';

/** "Confirm / Quick" switch shown at the top of a drill's settings sheet. */
function ModeSwitch({ mode, onChange }) {
    const { t } = useTranslation();

    return (
        <div className="rt-setting-block">
            <div className="rt-muted rt-mb-2">{t('play.mode')}</div>
            <Segmented
                ariaLabel={t('play.mode')}
                value={mode}
                onChange={onChange}
                options={[
                    { value: 'confirm', label: t('play.modeConfirm') },
                    { value: 'quick', label: t('play.modeQuick') },
                ]}
            />
        </div>
    );
}

export default ModeSwitch;
